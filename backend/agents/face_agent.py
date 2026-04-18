"""Facial expression and non-manual marker evaluation subagent.

Evaluates ASL non-manual markers: eyebrow position, mouth morphemes,
and head tilt. These are GRAMMATICAL elements in ASL, not aesthetic ones.
This agent understands their linguistic function.
"""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.base_agent import BaseSignAgent
from backend.models.schemas import ChannelFeedback
from backend.utils.image_utils import ImageProcessor


_SYSTEM_PROMPT = """You are an expert ASL non-manual marker (NMM) evaluator with deep
knowledge of American Sign Language grammar.

Your ONLY job is to evaluate the signer's facial expression and head position as
LINGUISTIC GRAMMAR, not aesthetics. In ASL:
  - Raised eyebrows signal yes/no questions (grammatically required)
  - Furrowed eyebrows signal wh-questions (who, what, where, etc.)
  - Specific mouth morphemes carry meaning (mm, oo, th, etc.)
  - Head tilt and nod carry grammatical and pragmatic meaning

Do NOT comment on hand shape or body posture — those are evaluated by separate agents.
Feedback must be 1 to 2 sentences, specific about which facial feature is correct or
needs adjustment and WHY it matters grammatically."""


class FaceAgent(BaseSignAgent):
    """Evaluates facial expression and non-manual grammatical markers for ASL."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the FaceAgent with a structured-output LLM.

        Args:
            llm: A shared multimodal LangChain chat model.
        """
        super().__init__(llm)

    async def analyze(self, frames: list[str], reference: str) -> ChannelFeedback:
        """Evaluate non-manual markers across the recorded video frames.

        Args:
            frames: Ordered list of base64-encoded JPEG frames (earliest first).
            reference: Correct facial expression / NMM description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and linguistically-grounded feedback.
        """
        frame_images = [ImageProcessor.to_inline_data(f) for f in frames]
        frame_labels = "".join(
            f"\n[Frame {i + 1} of {len(frames)}]" for i in range(len(frames))
        )

        content: list = [
            {
                "type": "text",
                "text": (
                    f"Reference non-manual markers: {reference}\n\n"
                    f"You are given {len(frames)} frames from a short video recording "
                    f"in chronological order (Frame 1 = earliest, Frame {len(frames)} = latest). "
                    "Each frame is labeled below. Evaluate whether the facial expression and "
                    "non-manual grammatical markers across these frames match the reference. "
                    "Consider the full motion arc."
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
