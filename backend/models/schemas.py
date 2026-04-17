"""Pydantic schemas for request and response validation.

These models are the single source of truth for the API contract.
The frontend TypeScript types must exactly mirror this structure.
"""

from pydantic import BaseModel, Field


class SignRequest(BaseModel):
    """Request body containing the base64-encoded webcam frame."""

    image_base64: str = Field(..., description="Base64-encoded JPEG image from the webcam")


class ChannelFeedback(BaseModel):
    """Feedback for a single evaluation channel (hand, face, or body)."""

    correct: bool = Field(..., description="Whether the channel was executed correctly")
    feedback: str = Field(..., description="1-2 sentence specific, actionable feedback")


class FeedbackResponse(BaseModel):
    """Aggregated feedback across all three evaluation channels."""

    hand: ChannelFeedback = Field(..., description="Hand shape evaluation result")
    face: ChannelFeedback = Field(..., description="Facial expression / non-manual marker result")
    body: ChannelFeedback = Field(..., description="Body posture evaluation result")
