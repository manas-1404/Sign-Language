"""FastAPI application entry point for the sign language analysis backend.

This file is purely the HTTP entry point. No business logic lives here.
All analysis is delegated to the SignAnalysisOrchestrator.

Run locally:
    uvicorn backend.app:app --reload --port 8000

Environment:
    Copy .env.example to .env and fill in your GOOGLE_API_KEY.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.models.schemas import FeedbackResponse, SignRequest
from backend.agents.orchestrator import SignAnalysisOrchestrator

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """FastAPI lifespan context — no persistent state needed."""
    yield


app = FastAPI(
    title="Sign Language Analysis API",
    description="Multi-agent ASL sign evaluation using Gemma 4 vision.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    """Liveness probe endpoint."""
    return {"status": "ok"}


@app.post("/analyze/{sign_id}", response_model=FeedbackResponse)
async def analyze_sign(sign_id: int, request: SignRequest) -> FeedbackResponse:
    """Analyze a webcam frame for the specified ASL sign.

    Runs hand shape, facial expression, and body posture evaluation
    concurrently and returns structured feedback for all three channels.

    Args:
        sign_id: Numeric sign identifier (1–10).
        request: Request body containing the base64-encoded JPEG image.

    Returns:
        FeedbackResponse with correct/feedback for hand, face, and body.
    """
    if sign_id < 1 or sign_id > 10:
        raise HTTPException(status_code=400, detail="sign_id must be between 1 and 10")

    orchestrator = SignAnalysisOrchestrator()

    try:
        return await orchestrator.analyze(sign_id, request.image_base64)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
