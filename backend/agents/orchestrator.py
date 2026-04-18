"""Orchestrator: coordinates the three evaluation subagents in parallel.

This class owns no LLM inference of its own. Its job is to:
  1. Load sign reference data from signs_config.json
  2. Instantiate the three subagents with the shared LLM client
  3. Run all three analyses concurrently via asyncio.gather
  4. Assemble the results into a FeedbackResponse
"""

import asyncio
import json
from pathlib import Path

from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.hand_agent import HandAgent
from backend.agents.face_agent import FaceAgent
from backend.agents.body_agent import BodyAgent
from backend.models.schemas import FeedbackResponse, ChannelFeedback
from backend.utils.inference import InferenceClientFactory

_CONFIG_PATH = Path(__file__).parent.parent / "config" / "signs_config.json"


class SignAnalysisOrchestrator:
    """Coordinates parallel evaluation of hand, face, and body channels.

    Instantiate once per request. The LLM client is created via
    InferenceClientFactory which reads INFERENCE_MODE from the environment.
    """

    def __init__(self) -> None:
        """Initialize the orchestrator and all three subagents with a shared LLM client."""
        llm: BaseChatModel = InferenceClientFactory.create()
        self._hand_agent = HandAgent(llm)
        self._face_agent = FaceAgent(llm)
        self._body_agent = BodyAgent(llm)

    async def analyze(self, sign_id: int, frames: list[str]) -> FeedbackResponse:
        """Run all three channel analyses concurrently and return aggregated feedback.

        Args:
            sign_id: Numeric sign identifier (1–10), must exist in signs_config.json.
            frames: Ordered list of base64-encoded JPEG frames (earliest first).

        Returns:
            FeedbackResponse with hand, face, and body ChannelFeedback.

        Raises:
            KeyError: If sign_id is not found in signs_config.json.
        """
        reference = self._load_reference(sign_id)

        hand_result, face_result, body_result = await asyncio.gather(
            self._hand_agent.analyze(frames, reference["hand"]),
            self._face_agent.analyze(frames, reference["face"]),
            self._body_agent.analyze(frames, reference["body"]),
        )

        return FeedbackResponse(hand=hand_result, face=face_result, body=body_result)

    def _load_reference(self, sign_id: int) -> dict:
        """Load the ground truth reference dict for a given sign.

        Args:
            sign_id: Numeric key to look up in signs_config.json.

        Returns:
            Dict with 'name', 'hand', 'face', and 'body' reference strings.

        Raises:
            KeyError: If sign_id is not in the config.
        """
        with _CONFIG_PATH.open("r", encoding="utf-8") as f:
            config: dict = json.load(f)

        key = str(sign_id)
        if key not in config:
            raise KeyError(f"Sign ID {sign_id} not found in signs_config.json")

        return config[key]
