"""FastAPI application entry point for the sign language analysis backend.

This file is purely the HTTP entry point. No business logic lives here.
All analysis is delegated to the SignAnalysisOrchestrator.

Run locally:
    uvicorn backend.app:app --reload --port 8000

Environment:
    Copy .env.example to .env and fill in your GOOGLE_API_KEY.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import ApiConfig
from backend.models.schemas import FeedbackResponse, SignRequest
from backend.agents.orchestrator import SignAnalysisOrchestrator
from backend.utils.debug_image_writer import DebugImageWriter

load_dotenv()


def _require_api_secret(x_api_secret: str | None = Header(default=None, alias="X-Api-Secret")) -> None:
    """FastAPI dependency that rejects requests missing the correct shared secret."""
    expected = os.environ.get("MODAL_PROXY_API_SECRET")
    if not expected or x_api_secret != expected:
        raise HTTPException(status_code=403, detail="Forbidden")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """FastAPI lifespan context — no persistent state needed."""
    yield


app = FastAPI(
    title="Sign Language Analysis API",
    description="Multi-agent ASL sign evaluation using Gemma 4 vision.",
    version="2.0.0",
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


@app.post("/analyze", response_model=FeedbackResponse, dependencies=[Depends(_require_api_secret)])
async def analyze_sign(
    tier: int = Query(..., ge=ApiConfig.MIN_TIER, le=ApiConfig.MAX_TIER, description="Learning tier (1 or 2)"),
    content_id: int = Query(..., ge=ApiConfig.MIN_CONTENT_ID, description="Sign or phrase ID within the tier"),
    request: SignRequest = ...,
) -> FeedbackResponse:
    """Analyze a video frame sequence for the specified tier and content item.

    Runs hand shape, facial expression, and body posture evaluation
    concurrently across all frames and returns structured feedback.

    Args:
        tier: Learning tier (1 = individual signs, 2 = short phrases).
        content_id: Numeric ID of the sign or phrase within the tier config.
        request: Request body containing the ordered list of base64 JPEG frames.

    Returns:
        FeedbackResponse with correct/feedback for hand, face, and body.
    """
    DebugImageWriter.save_frames(content_id, request.frames)

    orchestrator = SignAnalysisOrchestrator()

    try:
        return await orchestrator.analyze(tier, content_id, request.frames)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
