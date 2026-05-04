"""Orchestrator: coordinates the three evaluation subagents.

In API mode (INFERENCE_MODE=api): runs hand, face, body agents concurrently
via asyncio.gather — each agent independently calls the Google AI API.

In local mode (INFERENCE_MODE=local): uses SGLangAnalyzer which sends 3
channel requests in parallel to the SGLang HTTP server via the OpenAI-
compatible /v1/chat/completions endpoint.
"""

import asyncio
import json
import os
from typing import Optional

from backend.models.schemas import ChannelFeedback, FeedbackResponse
from backend.config.settings import TierVideoConfig
from backend.utils.inference import SGLangAnalyzer, _parse_json_response


class SignAnalysisOrchestrator:
    """Coordinates evaluation of hand, face, and body channels.

    Instantiated once at container startup and reused across all requests.
    Routes to either SGLangAnalyzer (local mode) or LangChain agents (API mode)
    based on the INFERENCE_MODE environment variable.
    """

    def __init__(self, server_url: Optional[str] = None) -> None:
        """Initialize the orchestrator and pre-cache tier configs.

        Args:
            server_url: Base URL of the SGLang HTTP server. Required when INFERENCE_MODE=local.
        """
        self._mode = os.environ.get("INFERENCE_MODE", "api").lower()

        if self._mode == "local":
            if server_url is None:
                raise RuntimeError(
                    "server_url must be provided when INFERENCE_MODE=local"
                )
            self._sglang_analyzer = SGLangAnalyzer(server_url)
        else:
            from langchain_core.language_models.chat_models import BaseChatModel
            from backend.agents.hand_agent import HandAgent
            from backend.agents.face_agent import FaceAgent
            from backend.agents.body_agent import BodyAgent
            from backend.utils.inference import InferenceClientFactory

            llm: BaseChatModel = InferenceClientFactory.create()
            self._hand_agent = HandAgent(llm)
            self._face_agent = FaceAgent(llm)
            self._body_agent = BodyAgent(llm)

        self._tier_configs: dict[int, dict] = {
            tier: json.loads(path.read_text(encoding="utf-8"))
            for tier, path in TierVideoConfig.CONFIG_FILES.items()
        }

    async def analyze(self, tier: int, content_id: int, frames: list[str]) -> FeedbackResponse:
        """Run all three channel analyses and return aggregated feedback.

        Args:
            tier: Learning tier (1 or 2).
            content_id: Numeric content identifier within the tier config.
            frames: Ordered list of base64-encoded JPEG frames, earliest first.

        Returns:
            FeedbackResponse with hand, face, and body ChannelFeedback.

        Raises:
            KeyError: If content_id is not found in the tier config.
        """
        reference = self._load_reference(tier, content_id)

        if self._mode == "local":
            hand_raw, face_raw, body_raw = await self._sglang_analyzer.analyze_all(
                frames,
                reference["hand"],
                reference["face"],
                reference["body"],
            )
            hand = _parse_json_response(hand_raw, ChannelFeedback)
            face = _parse_json_response(face_raw, ChannelFeedback)
            body = _parse_json_response(body_raw, ChannelFeedback)
        else:
            hand, face, body = await asyncio.gather(
                self._hand_agent.analyze(frames, reference["hand"]),
                self._face_agent.analyze(frames, reference["face"]),
                self._body_agent.analyze(frames, reference["body"]),
            )

        return FeedbackResponse(hand=hand, face=face, body=body)

    def _load_reference(self, tier: int, content_id: int) -> dict:
        """Return the ground truth reference dict for a given tier and content ID.

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
