"""Hand shape evaluation subagent.

Analyzes only the hand configuration and finger positions in the image.
Ignores facial expression and body posture — those are handled by
FaceAgent and BodyAgent respectively.
"""

import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.base_agent import BaseSignAgent
from backend.models.schemas import ChannelFeedback
from backend.utils.image_utils import ImageProcessor


_SYSTEM_PROMPT = """You are an expert American Sign Language (ASL) hand shape evaluator.

Your ONLY job is to evaluate the signer's hand configuration and finger positions.
Do NOT comment on facial expression, eyebrow position, or body posture — those are
evaluated by separate specialized agents.

Given an image of someone attempting an ASL sign and the reference description of
the correct hand shape, you must return a JSON object with exactly these two fields:
  - "correct": boolean — true if the hand shape matches the reference, false otherwise
  - "feedback": string — 1 to 2 sentences maximum, specific and actionable

Focus on: finger positions, hand orientation, handshape accuracy, and movement direction.
Be precise and constructive. Do not include pleasantries or preamble.

Respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""


class HandAgent(BaseSignAgent):
    """Evaluates hand shape and finger configuration for a given ASL sign."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the HandAgent.

        Args:
            llm: A shared multimodal LangChain chat model.
        """
        super().__init__(llm)

    async def analyze(self, image_base64: str, reference: str) -> ChannelFeedback:
        """Evaluate the hand shape in the captured frame.

        Args:
            image_base64: Base64-encoded JPEG image from the webcam.
            reference: Correct hand shape description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and actionable feedback.
        """
        user_content = [
            {
                "type": "text",
                "text": f"Reference hand shape: {reference}\n\nEvaluate the hand shape in this image.",
            },
            ImageProcessor.to_inline_data(image_base64),
        ]

        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=user_content),
        ]

        response = await self._llm.ainvoke(messages)
        return _parse_channel_feedback(response.content)


def _parse_channel_feedback(raw: str) -> ChannelFeedback:
    """Parse the model's JSON response into a ChannelFeedback object.

    Strips markdown code fences if present before parsing.

    Args:
        raw: Raw string response from the LLM.

    Returns:
        Parsed ChannelFeedback.

    Raises:
        ValueError: If the response cannot be parsed as valid JSON.
    """
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(cleaned)
    return ChannelFeedback(correct=bool(data["correct"]), feedback=str(data["feedback"]))
