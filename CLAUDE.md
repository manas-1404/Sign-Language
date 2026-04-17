# Sign Language Learning Companion - Architecture Document

## Role and Expectations

You are a senior full stack software engineer. Every piece of code you write must follow these non-negotiable principles:

- Object oriented programming throughout. No standalone procedural scripts.
- Modular and reusable code. Every class, function, and module must have a single clear responsibility.
- Clean separation of concerns between frontend and backend.
- Type annotations on every function and class in Python. TypeScript types on everything in the frontend.
- No hardcoded values outside of the designated config files.
- Every class must have a docstring. Every non-trivial function must have a docstring.

---

## Project Overview

A real-time sign language learning companion that allows hearing users to practice ASL signs via their webcam. The user practices a sign, the app captures a still frame, sends it to a multi-agent backend, and receives structured feedback across three channels simultaneously: hand shape, facial expression, and body posture. The key differentiator from existing tools is that the system understands non-manual markers (eyebrow raises, mouth morphemes) as grammatical elements, not just aesthetic ones.

---

## Monorepo Structure

```
sign-language-companion/
├── frontend/                  # Next.js app hosted on Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Home page
│   │   │   └── practice-sign/
│   │   │       └── page.tsx           # Main practice route
│   │   ├── components/
│   │   │   ├── WebcamCapture.tsx      # Webcam + countdown capture component
│   │   │   ├── FeedbackPanel.tsx      # Three dropdown feedback display
│   │   │   ├── SignPrompt.tsx         # Shows which sign to practice
│   │   │   └── ProgressBar.tsx        # Lesson progress indicator
│   │   ├── hooks/
│   │   │   ├── useWebcam.ts           # Webcam access and frame capture logic
│   │   │   └── useLessonState.ts      # Client-side lesson progression state
│   │   ├── services/
│   │   │   └── signApi.ts             # API client for Modal backend calls
│   │   ├── types/
│   │   │   └── index.ts               # All shared TypeScript types
│   │   └── constants/
│   │       └── signs.ts               # Sign metadata for the 10 hardcoded signs
├── backend/                   # Modal serverless GPU backend
│   ├── app.py                         # Modal app entry point and web endpoint definition
│   ├── agents/
│   │   ├── base_agent.py              # Abstract base class for all subagents
│   │   ├── hand_agent.py              # Hand shape analysis subagent
│   │   ├── face_agent.py              # Facial expression analysis subagent
│   │   ├── body_agent.py              # Body posture analysis subagent
│   │   └── orchestrator.py            # Orchestrator agent that synthesizes subagent results
│   ├── config/
│   │   └── signs_config.json          # Ground truth reference data for all 10 signs
│   ├── models/
│   │   └── schemas.py                 # Pydantic models for request and response validation
│   └── utils/
│       ├── image_utils.py             # Base64 decode and image preprocessing utilities
│       └── inference.py               # LLM client factory that reads INFERENCE_MODE and returns correct client
└── README.md
```

---

## Frontend Architecture

### Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- Hosted on Vercel

### Routes

There are only two routes in the entire frontend.

`/` is the home page. It explains the product, the problem it solves, and has a single call to action button that navigates to `/practice-sign`.

`/practice-sign` is the main practice route. All lesson state lives here in React state via the `useLessonState` hook. There is no routing between individual signs. The component re-renders with the next sign when the user clicks the next button.

### Key Components

#### WebcamCapture

Responsible for accessing the user's front-facing camera, displaying the live preview, running a 3-second countdown, capturing a still frame at the end of the countdown, and returning the frame as a base64-encoded JPEG string. It does nothing else. It does not call the API. It does not manage lesson state.

#### FeedbackPanel

Receives the structured feedback JSON from the parent and renders three expandable dropdown sections: Hand Shape, Facial Expression, and Body Posture. Each dropdown has a color indicator: green if the channel was marked correct, red if incorrect. It is a pure presentational component. It receives props and renders. It has no internal state and makes no API calls.

#### SignPrompt

Displays the name and description of the current sign the user is supposed to practice. Receives the current sign metadata as a prop.

#### useLessonState Hook

Manages all lesson progression logic. Tracks the current sign index (0 to 9), provides a `nextSign()` function that increments the index, and tracks whether the lesson is complete. This is the only place lesson state lives.

#### useWebcam Hook

Encapsulates all webcam access logic using the browser MediaDevices API. Returns a ref for the video element, a capture function that uses a canvas to extract a still frame as base64 JPEG, and the current permission status.

#### signApi Service

A typed API client that wraps the fetch call to the Modal backend. Exports a single async function `analyzeSign(signId: number, imageBase64: string): Promise<FeedbackResponse>`. All API configuration (base URL) comes from environment variables.

### TypeScript Types

Define all types in `src/types/index.ts`. There are three interfaces that must exactly mirror the backend Pydantic schemas. `ChannelFeedback` has a boolean `correct` field and a string `feedback` field. `FeedbackResponse` has three `ChannelFeedback` fields named `hand`, `face`, and `body`. `SignMetadata` has a numeric `id`, a string `name`, and a string `description`.

### Signs Constant

`src/constants/signs.ts` exports an array of 10 `SignMetadata` objects. The IDs must match the numeric keys in the backend `signs_config.json`. The signs to include are: hello (1), thank you (2), yes (3), no (4), please (5), sorry (6), water (7), help (8), name (9), and a question sign like "are you hungry" (10) where eyebrow position is grammatically required. Sign 10 is specifically chosen to showcase the facial expression channel during the demo.

---

## Backend Architecture

### Tech Stack

- Python 3.11
- Modal for serverless GPU hosting
- LangGraph for agent orchestration
- LangChain for LLM integration with Gemma 4 via Google AI API
- FastAPI via Modal's `@modal.fastapi_endpoint` decorator
- Pydantic for request and response validation

### Entry Point

`app.py` defines the Modal app and the single web endpoint. The endpoint is decorated with `@modal.fastapi_endpoint(method="POST")` and accepts a path parameter `sign_id: int` and a Pydantic request body containing the base64 image. It instantiates the `Orchestrator` class and calls its `analyze` method. It returns the structured `FeedbackResponse`. No business logic lives here. This file is purely the HTTP entry point.

### Pydantic Schemas (models/schemas.py)

Define all request and response models here. There are three models: `SignRequest` which contains the base64 image string, `ChannelFeedback` which contains a boolean `correct` field and a string `feedback` field, and `FeedbackResponse` which contains three `ChannelFeedback` fields named `hand`, `face`, and `body`. The frontend TypeScript types must exactly mirror this structure.

### Signs Config (config/signs_config.json)

A JSON file with numeric keys 1 through 10. Each entry contains the ground truth reference for all three channels. The subagents read from this file at runtime to know what correct execution looks like for the sign being practiced. Example entry:

```json
{
  "8": {
    "name": "help",
    "hand": "Dominant fist placed on top of open non-dominant palm. Both hands move upward together. Fingers of the dominant hand should be closed into a fist with thumb up.",
    "face": "Expression should be neutral or slightly concerned. Eyebrows should be in a neutral position for a statement. If asking for help as a question, eyebrows must be raised.",
    "body": "Torso upright and facing forward. Slight forward lean is acceptable. Arms extended in front of the body at chest height."
  }
}
```

### Agent Architecture

#### BaseAgent (agents/base_agent.py)

Abstract base class that all three subagents inherit from. Defines the interface that every subagent must implement. Contains shared initialization logic for the LangChain LLM client. Subclasses must implement the `analyze` method which takes a base64 image string and a reference string and returns a `ChannelFeedback` object.

#### HandAgent (agents/hand_agent.py)

Inherits from `BaseAgent`. Its system prompt instructs Gemma 4 to act as an expert ASL hand shape evaluator. It receives the image and the hand reference string from the config. It must return a JSON object with `correct` (boolean) and `feedback` (1 to 2 sentences maximum, specific and actionable). The prompt explicitly tells the model to ignore facial expression and body posture since those are handled by other agents.

#### FaceAgent (agents/face_agent.py)

Inherits from `BaseAgent`. Its system prompt instructs Gemma 4 to act as an expert ASL non-manual marker evaluator with specific knowledge that eyebrow position, mouth morphemes, and head tilt carry grammatical meaning in ASL. It receives the image and the face reference string. Returns the same JSON schema. The prompt must explicitly mention that this agent is evaluating linguistic grammar, not aesthetic expression.

#### BodyAgent (agents/body_agent.py)

Inherits from `BaseAgent`. Its system prompt instructs Gemma 4 to evaluate upper body posture and orientation only. Returns the same JSON schema.

#### Orchestrator (agents/orchestrator.py)

This is not an LLM call. It is a Python class that coordinates the three subagents. It instantiates the LLM client by calling the factory in `utils/inference.py` which reads `INFERENCE_MODE` and returns the correct client. It passes the same client instance to all three subagents. It calls all three concurrently using `asyncio.gather`, collects their `ChannelFeedback` results, and assembles them into a single `FeedbackResponse`. It does no LLM inference itself. It also owns the `_load_reference` method which reads `signs_config.json` and returns the reference dict for the given sign ID.

### Image Utils (utils/image_utils.py)

Contains a single utility class `ImageProcessor` with static methods for decoding base64 strings to bytes and any preprocessing needed before passing to the model.

### Inference Factory (utils/inference.py)

Contains a single factory class `InferenceClientFactory` with a static method that reads the `INFERENCE_MODE` environment variable and returns the appropriate LangChain LLM client. When the mode is `api` it returns a client pointed at Google's Gemma 4 API using the `GOOGLE_API_KEY`. When the mode is `local` it returns a client that loads the Gemma 4 weights from the Modal Volume. This is the only file in the entire codebase that reads `INFERENCE_MODE`. No other file should be aware of which mode is active.

---

## Data Flow

1. User is on `/practice-sign`. The `useLessonState` hook provides the current sign ID (1 through 10) and the current `SignMetadata`.
2. `SignPrompt` displays the sign name and description.
3. `WebcamCapture` shows the live camera preview. User positions themselves and the 3-second countdown begins automatically.
4. At the end of the countdown, `useWebcam` captures a still frame and returns it as base64 JPEG to the parent.
5. The parent calls `signApi.analyzeSign(signId, imageBase64)` which sends a POST request to `https://<modal-endpoint>/practice-sign/{signId}` with the image in the JSON body.
6. Modal receives the request. The endpoint instantiates `Orchestrator` and calls `analyze`.
7. `Orchestrator._load_reference(sign_id)` reads `signs_config.json` and extracts the reference for this sign.
8. `asyncio.gather` fires all three subagent `analyze` calls concurrently.
9. Each subagent constructs its prompt with the image and reference text, calls Gemma 4, parses the JSON response, and returns a `ChannelFeedback` object.
10. `Orchestrator` assembles the three results into a `FeedbackResponse` and returns it.
11. The frontend receives the response and passes it to `FeedbackPanel`.
12. `FeedbackPanel` renders three dropdowns with color coded correct/incorrect indicators and the feedback text.
13. User reads feedback, corrects their sign, and either retries or clicks next to advance to the next sign.

---

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_MODAL_API_URL=https://<your-modal-endpoint>.modal.run
```

### Backend

For local development these live in a `.env` file in the backend directory. On Modal they are injected as Modal Secrets.

```
INFERENCE_MODE=api          # "api" for local dev, "local" for Modal production
GOOGLE_API_KEY=<gemma-4-api-key>   # only required when INFERENCE_MODE=api
```

---

## Two-Mode Inference Design

The backend supports two inference modes controlled entirely by the `INFERENCE_MODE` environment variable. This is the feature flag. No other part of the codebase needs to know which mode is active. Only `Orchestrator._init_llm()` reads this flag and returns the appropriate LangChain client. Every other class including all three subagents and the orchestrator itself calls the LLM client identically regardless of mode.

### API Mode (local development)

When `INFERENCE_MODE=api`, the LLM client points to Google's Gemma 4 API using the `GOOGLE_API_KEY`. No GPU is required. This is the mode used during all local development and iteration. Run the backend locally with `modal serve backend/app.py` which gives a live reloading endpoint URL to point the frontend at.

### Local Mode (Modal production)

When `INFERENCE_MODE=local`, the LLM client loads the Gemma 4 weights directly from a Modal Volume. The weights must be pre-downloaded into the Modal Volume during the container image build step using Modal's `@modal.build()` lifecycle decorator. This ensures weights are cached in the Volume and never re-downloaded on cold starts. This mode runs on Modal's GPU infrastructure and is used for the final deployed production endpoint.

The switch between modes requires only changing one environment variable. No code changes, no refactoring, no different entry points.

---

## Key Technical Decisions and Rationale

Each subagent uses a focused system prompt on a single channel rather than one prompt doing all three. This produces more accurate analysis because the model is not context-switching between three different evaluation tasks in a single pass.

The orchestrator uses `asyncio.gather` for true parallel execution. Sequential subagent calls would triple the latency unnecessarily since the three analyses are fully independent.

Lesson state lives on the client in React state. There is no session management on the backend. The backend is stateless by design which means no database, no session IDs, and no data persistence across requests.

The JSON config file approach for sign reference data is intentional. It keeps the ground truth human-readable, easily editable, and version controlled without any database dependency.

The two-mode inference design using a single `INFERENCE_MODE` environment variable keeps the codebase clean and eliminates the need for separate dev and prod codepaths. Swapping between Google's Gemma 4 API during development and the actual model weights on Modal in production requires zero code changes. The flag is read in exactly one place inside `Orchestrator._init_llm()` and nowhere else.

---

## What to Build First

1. Backend `models/schemas.py` first since all other files depend on the type contracts.
2. Backend `config/signs_config.json` with all 10 signs fully written out.
3. Backend `agents/base_agent.py` abstract class.
4. Backend `agents/hand_agent.py`, `face_agent.py`, `body_agent.py` inheriting from base.
5. Backend `agents/orchestrator.py` wiring everything together.
6. Backend `app.py` exposing the Modal endpoint.
7. Test the backend end to end with a curl or Python script before touching the frontend.
8. Frontend `src/types/index.ts` and `src/constants/signs.ts`.
9. Frontend `src/hooks/useWebcam.ts` and `src/hooks/useLessonState.ts`.
10. Frontend `src/services/signApi.ts`.
11. Frontend components in this order: `SignPrompt`, `FeedbackPanel`, `WebcamCapture`.
12. Frontend pages: `practice-sign/page.tsx` wiring everything together, then `page.tsx` home page last.
