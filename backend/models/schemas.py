"""Pydantic schemas for request and response validation.

These models are the single source of truth for the API contract.
The frontend TypeScript types must exactly mirror this structure.
"""

from pydantic import BaseModel, Field

from backend.config.settings import VideoConfig


class SignRequest(BaseModel):
    """Request body containing the ordered sequence of base64-encoded webcam frames.

    Frames must be in chronological order (frame 0 = earliest).
    The expected count is defined by VideoConfig.FRAME_COUNT, but the backend
    accepts any non-empty list to allow flexibility during development.
    """

    frames: list[str] = Field(
        ...,
        min_length=1,
        max_length=VideoConfig.FRAME_COUNT * 2,
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
