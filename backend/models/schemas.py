"""Pydantic schemas for request and response validation.

These models are the single source of truth for the API contract.
The frontend TypeScript types must exactly mirror this structure.
"""

from pydantic import BaseModel, Field

from backend.config.settings import TierVideoConfig

_MAX_FRAMES = max(cfg["frame_count"] for cfg in TierVideoConfig.SETTINGS.values()) * 2


class SignRequest(BaseModel):
    """Request body containing the ordered sequence of base64-encoded webcam frames.

    Frames must be in chronological order (frame 0 = earliest).
    Max length is capped at 2x the highest per-tier frame count to allow flexibility.
    """

    frames: list[str] = Field(
        ...,
        min_length=1,
        max_length=_MAX_FRAMES,
        description="Ordered list of base64-encoded JPEG frames, earliest first",
    )


class ChannelFeedback(BaseModel):
    """Feedback for a single evaluation channel (hand, face, or body)."""

    correct: bool = Field(..., description="Whether the channel was executed correctly")
    feedback: str = Field(..., description="1-2 sentence specific, actionable feedback")


class FeedbackResponse(BaseModel):
    """Aggregated feedback across all three evaluation channels."""

    hand: ChannelFeedback = Field(..., description="Hand shape evaluation result")
    face: ChannelFeedback = Field(..., description="Facial expression / non-manual marker result")
    body: ChannelFeedback = Field(..., description="Body posture evaluation result")
