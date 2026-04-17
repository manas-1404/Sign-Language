"""Facial expression and non-manual marker evaluation subagent.

Evaluates ASL non-manual markers: eyebrow position, mouth morphemes,
and head tilt. These are GRAMMATICAL elements in ASL, not aesthetic ones.
This agent understands their linguistic function.
"""

import json

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

Given an image of someone attempting an ASL sign and the reference description of the
correct non-manual markers, return a JSON object with exactly:
  - "correct": boolean — true if NMMs match the reference, false otherwise
  - "feedback": string — 1 to 2 sentences, specific about which facial feature
    is correct or needs adjustment and WHY it matters grammatically

Respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""


class FaceAgent(BaseSignAgent):
    """Evaluates facial expression and non-manual grammatical markers for ASL."""

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the FaceAgent.

        Args:
            llm: A shared multimodal LangChain chat model.
        """
        super().__init__(llm)

    async def analyze(self, image_base64: str, reference: str) -> ChannelFeedback:
        """Evaluate non-manual markers in the captured frame.

        Args:
            image_base64: Base64-encoded JPEG image from the webcam.
            reference: Correct facial expression / NMM description from signs_config.json.

        Returns:
            ChannelFeedback with correct flag and linguistically-grounded feedback.
        """
        user_content = [
            {
                "type": "text",
                "text": (
                    f"Reference non-manual markers: {reference}\n\n"
                    "Evaluate the facial expression and non-manual markers in this image."
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
