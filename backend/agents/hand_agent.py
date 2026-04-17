"""Hand shape evaluation subagent.

Analyzes only the hand configuration and finger positions in the image.
Ignores facial expression and body posture — those are handled by
FaceAgent and BodyAgent respectively.
"""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.base_agent import BaseSignAgent
from backend.models.schemas import ChannelFeedback
from backend.utils.image_utils import ImageProcessor


_SYSTEM_PROMPT = """You are an expert American Sign Language (ASL) hand shape evaluator.

Your ONLY job is to evaluate the signer's hand configuration and finger positions.
Do NOT comment on facial expression, eyebrow position, or body posture — those are
evaluated by separate specialized agents.

Focus on: finger positions, hand orientation, handshape accuracy, and movement direction.
Be precise and constructive. Feedback must be 1 to 2 sentences maximum."""


class HandAgent(BaseSignAgent):
    """Evaluates hand shape and finger configuration for a given ASL sign."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the HandAgent with a structured-output LLM.

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
        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=[
                {
                    "type": "text",
                    "text": f"Reference hand shape: {reference}\n\nEvaluate the hand shape in this image.",
                },
                ImageProcessor.to_inline_data(image_base64),
            ]),
        ]

        return await self._structured_llm.ainvoke(messages)
