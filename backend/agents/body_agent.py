"""Body posture evaluation subagent.

Analyzes upper body orientation, torso position, and arm placement.
Ignores hand shape and facial expression — those are handled by
HandAgent and FaceAgent respectively.
"""

import json

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

Given an image of someone attempting an ASL sign and the reference description of
the correct body posture, return a JSON object with exactly:
  - "correct": boolean — true if posture matches the reference, false otherwise
  - "feedback": string — 1 to 2 sentences, specific and actionable about posture

Respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""


class BodyAgent(BaseSignAgent):
    """Evaluates upper body posture and arm positioning for ASL signing."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the BodyAgent.

        Args:
            llm: A shared multimodal LangChain chat model.
        """
        super().__init__(llm)

    async def analyze(self, image_base64: str, reference: str) -> ChannelFeedback:
        """Evaluate body posture in the captured frame.

        Args:
            image_base64: Base64-encoded JPEG image from the webcam.
            reference: Correct body posture description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and posture-specific feedback.
        """
        user_content = [
            {
                "type": "text",
                "text": (
                    f"Reference body posture: {reference}\n\n"
                    "Evaluate the body posture and upper body positioning in this image."
                ),
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

    Args:
        raw: Raw string response from the LLM.

    Returns:
        Parsed ChannelFeedback.
    """
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(cleaned)
    return ChannelFeedback(correct=bool(data["correct"]), feedback=str(data["feedback"]))
