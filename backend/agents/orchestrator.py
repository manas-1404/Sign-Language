"""Orchestrator: coordinates the three evaluation subagents in parallel.

This class owns no LLM inference of its own. Its job is to:
  1. Load sign/phrase reference data from the correct tier config file
  2. Instantiate the three subagents with the shared LLM client
  3. Run all three analyses concurrently via asyncio.gather
  4. Assemble the results into a FeedbackResponse
"""

import asyncio
import json

from langchain_core.language_models.chat_models import BaseChatModel

from backend.agents.hand_agent import HandAgent
from backend.agents.face_agent import FaceAgent
from backend.agents.body_agent import BodyAgent
from backend.config.settings import TierVideoConfig
from backend.models.schemas import FeedbackResponse
from backend.utils.inference import InferenceClientFactory


class SignAnalysisOrchestrator:
    """Coordinates parallel evaluation of hand, face, and body channels.

    Instantiated once at container startup (injected into app._shared_orchestrator)
    and reused across all requests. The LLM client is created via
    InferenceClientFactory which reads INFERENCE_MODE from the environment.
    """

    def __init__(self) -> None:
        """Initialize the orchestrator, all three subagents, and pre-cache tier configs."""
        llm: BaseChatModel = InferenceClientFactory.create()
        self._hand_agent = HandAgent(llm)
        self._face_agent = FaceAgent(llm)
        self._body_agent = BodyAgent(llm)
        # Load all tier configs once at construction — eliminates per-request file I/O.
        self._tier_configs: dict[int, dict] = {
            tier: json.loads(path.read_text(encoding="utf-8"))
            for tier, path in TierVideoConfig.CONFIG_FILES.items()
        }

    async def analyze(self, tier: int, content_id: int, frames: list[str]) -> FeedbackResponse:
        """Run all three channel analyses concurrently and return aggregated feedback.

        Args:
            tier: Learning tier (1 or 2). Determines which config file is loaded.
            content_id: Numeric content identifier within the tier config.
            frames: Ordered list of base64-encoded JPEG frames, earliest first.

        Returns:
            FeedbackResponse with hand, face, and body ChannelFeedback.

        Raises:
            KeyError: If content_id is not found in the tier config.
        """
        reference = self._load_reference(tier, content_id)

        hand_result, face_result, body_result = await asyncio.gather(
            self._hand_agent.analyze(frames, reference["hand"]),
            self._face_agent.analyze(frames, reference["face"]),
            self._body_agent.analyze(frames, reference["body"]),
        )

        return FeedbackResponse(hand=hand_result, face=face_result, body=body_result)

    def _load_reference(self, tier: int, content_id: int) -> dict:
        """Return the ground truth reference dict for a given tier and content ID.

        Args:
            tier: Learning tier (1 or 2).
            content_id: Numeric key to look up in the cached tier config.

        Returns:
            Dict with 'name', 'hand', 'face', and 'body' reference strings.

        Raises:
            KeyError: If tier or content_id is not found in the cached config.
        """
        config = self._tier_configs.get(tier)
        if config is None:
            raise KeyError(f"Unknown tier {tier}")

        key = str(content_id)
        if key not in config:
            raise KeyError(f"Content ID {content_id} not found in tier {tier} config")

        return config[key]
