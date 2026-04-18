"""Body posture evaluation subagent.

Analyzes upper body orientation, torso position, and arm placement.
Ignores hand shape and facial expression — those are handled by
HandAgent and FaceAgent respectively.
"""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.base_agent import BaseSignAgent
from backend.models.schemas import ChannelFeedback
from backend.utils.image_utils import ImageProcessor


_SYSTEM_PROMPT = """You are an expert ASL body posture and upper body orientation evaluator.

Your ONLY job is to evaluate the signer's upper body posture and positioning.
Do NOT comment on hand shape, finger positions, or facial expression — those are
evaluated by separate specialized agents.

Focus exclusively on:
  - Torso orientation (facing forward, angled, etc.)
  - Shoulder position and tension
  - Arm height and placement relative to the body
  - Overall body alignment appropriate for the sign

Feedback must be 1 to 2 sentences, specific and actionable about posture."""


class BodyAgent(BaseSignAgent):
    """Evaluates upper body posture and arm positioning for ASL signing."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the BodyAgent with a structured-output LLM.

        Args:
            llm: A shared multimodal LangChain chat model.
        """
        super().__init__(llm)

    async def analyze(self, frames: list[str], reference: str) -> ChannelFeedback:
        """Evaluate body posture across the recorded video frames.

        Args:
            frames: Ordered list of base64-encoded JPEG frames (earliest first).
            reference: Correct body posture description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and posture-specific feedback.
        """
        frame_images = [ImageProcessor.to_inline_data(f) for f in frames]
        frame_labels = "".join(
            f"\n[Frame {i + 1} of {len(frames)}]" for i in range(len(frames))
        )

        content: list = [
            {
                "type": "text",
                "text": (
                    f"Reference body posture: {reference}\n\n"
                    f"You are given {len(frames)} frames from a short video recording "
                    f"in chronological order (Frame 1 = earliest, Frame {len(frames)} = latest). "
                    "Each frame is labeled below. Evaluate whether the upper body posture and "
                    "arm positioning across these frames matches the reference. "
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
