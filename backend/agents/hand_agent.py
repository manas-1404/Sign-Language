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

    async def analyze(self, frames: list[str], reference: str) -> ChannelFeedback:
        """Evaluate hand shape across the recorded video frames.

        Args:
            frames: Ordered list of base64-encoded JPEG frames (earliest first).
            reference: Correct hand shape description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and actionable feedback.
        """
        frame_images = [ImageProcessor.to_inline_data(f) for f in frames]
        frame_labels = "".join(
            f"\n[Frame {i + 1} of {len(frames)}]" for i in range(len(frames))
        )

        content: list = [
            {
                "type": "text",
                "text": (
                    f"Reference hand shape: {reference}\n\n"
                    f"You are given {len(frames)} frames from a short video recording "
                    f"in chronological order (Frame 1 = earliest, Frame {len(frames)} = latest). "
                    "Each frame is labeled below. Evaluate whether the hand shape across "
                    "these frames matches the reference. Consider the full motion arc."
                    f"{frame_labels}"
                ),
            }
        ]

        for i, frame_image in enumerate(frame_images):
            content.append({"type": "text", "text": f"Frame {i + 1}:"})
            content.append(frame_image)

        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=content),
        ]

        return await self._structured_llm.ainvoke(messages)
