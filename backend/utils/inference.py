"""LLM client factory and SGLang-based analyzer.

Reads the INFERENCE_MODE environment variable and returns the appropriate
inference backend. This is the only file aware of which inference mode is active.

Supported modes:
    api   — Google AI Studio Gemma 4 API via LangChain (requires GOOGLE_API_KEY)
    local — SGLang HTTP server running Gemma 4 26B on GPU (server_url passed in)
"""

import asyncio
import json
import os
import re
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel

_SHARED_SYSTEM_PROMPT = (
    "You are an expert American Sign Language (ASL) evaluator. "
    "You will be shown sequential frames of a learner's signing attempt."
)

_JSON_INSTRUCTION = (
    "\n\nRespond with ONLY this JSON object, no other text:\n"
    '{"correct": true, "feedback": "..."}\n'
    "Set correct to true if the sign matches the reference, false if not. "
    "Set feedback to 1-2 sentences of specific actionable feedback."
)


def _strip_b64_prefix(frame: str) -> str:
    return frame.split(",", 1)[1] if "," in frame else frame


def _build_messages(channel_prompt: str, ref_label: str, ref: str, frames: list[str]) -> list[dict]:
    """Build an OpenAI-compatible chat message list for one channel evaluation."""
    n = len(frames)
    text = (
        f"You are given {n} sequential frames of an ASL signing attempt "
        f"(Frame 1 = earliest, Frame {n} = latest).\n\n"
        f"{channel_prompt}\n\n"
        f"Reference {ref_label}: {ref}"
        f"{_JSON_INSTRUCTION}"
    )
    content: list[dict] = [{"type": "text", "text": text}]
    for frame in frames:
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{_strip_b64_prefix(frame)}"},
        })
    return [
        {"role": "system", "content": _SHARED_SYSTEM_PROMPT},
        {"role": "user", "content": content},
    ]


class SGLangAnalyzer:
    """Sends channel evaluation requests to a running SGLang HTTP server.

    The model server (launched as a subprocess in modal_app.py) exposes an
    OpenAI-compatible /v1/chat/completions endpoint.  All 3 channel requests
    are dispatched concurrently via asyncio.gather.
    """

    def __init__(self, server_url: str) -> None:
        from openai import AsyncOpenAI
        self._client = AsyncOpenAI(
            api_key="not-needed",
            base_url=f"{server_url.rstrip('/')}/v1",
        )

    async def analyze_all(
        self,
        frames: list[str],
        hand_ref: str,
        face_ref: str,
        body_ref: str,
    ) -> tuple[str, str, str]:
        """Dispatch 3 channel evaluations in parallel, return 3 raw JSON strings."""
        from backend.agents.hand_agent import _SYSTEM_PROMPT as _HAND_PROMPT
        from backend.agents.face_agent import _SYSTEM_PROMPT as _FACE_PROMPT
        from backend.agents.body_agent import _SYSTEM_PROMPT as _BODY_PROMPT

        async def _call(channel_prompt: str, ref_label: str, ref: str) -> str:
            response = await self._client.chat.completions.create(
                model="default",
                messages=_build_messages(channel_prompt, ref_label, ref, frames),
                max_tokens=200,
                temperature=0.1,
            )
            return response.choices[0].message.content

        hand_raw, face_raw, body_raw = await asyncio.gather(
            _call(_HAND_PROMPT, "hand shape", hand_ref),
            _call(_FACE_PROMPT, "facial expression", face_ref),
            _call(_BODY_PROMPT, "body posture", body_ref),
        )
        return hand_raw, face_raw, body_raw


def _parse_json_response(raw: str, schema: Any) -> Any:
    """Extract and validate a JSON object from a raw model response string."""
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise ValueError(f"Model did not return a JSON object. Response was:\n{raw}")
    data = json.loads(json_match.group())
    if hasattr(schema, "model_validate"):
        return schema.model_validate(data)
    return data


class InferenceClientFactory:
    """Factory that constructs the correct inference backend based on INFERENCE_MODE."""

    @staticmethod
    def create() -> BaseChatModel:
        """Return a LangChain chat model for API mode only."""
        mode = os.environ.get("INFERENCE_MODE", "api").lower()
        if mode == "api":
            return InferenceClientFactory._create_api_client()
        raise ValueError(
            f"InferenceClientFactory.create() is only valid for INFERENCE_MODE=api. "
            f"For local mode use SGLangAnalyzer directly. Got mode: '{mode}'"
        )

    @staticmethod
    def _create_api_client() -> BaseChatModel:
        """Build a ChatGoogleGenerativeAI client pointed at the Gemma 4 API."""
        from langchain_google_genai import ChatGoogleGenerativeAI

        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GOOGLE_API_KEY environment variable is required when INFERENCE_MODE=api"
            )
        return ChatGoogleGenerativeAI(
            model="gemma-4-31b-it",
            google_api_key=api_key,
            temperature=0.1,
        )
