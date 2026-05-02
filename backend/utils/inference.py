"""LLM client factory.

Reads the INFERENCE_MODE environment variable and returns the
appropriate LangChain chat model. This is the only file in the
entire codebase that is aware of which inference mode is active.

Supported modes:
    api   — Google AI Studio Gemma 4 API (requires GOOGLE_API_KEY)
    local — Local Gemma 4 weights loaded from disk by modal_app.py
"""

import asyncio
import json
import os
import re
from typing import Any, Iterator, Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.outputs import ChatGeneration, ChatResult

# Module-level singletons. Set by modal_app.py before the first request arrives.
# Do not import or reference these directly outside of this module.
_local_model: Any = None
_local_processor: Any = None


class _LocalGemma4Model(BaseChatModel):
    """LangChain chat model wrapper around a locally loaded Gemma 4 instance.

    Reads _local_model and _local_processor from the module level, which are
    populated by modal_app.py's @modal.enter() before FastAPI starts serving.
    Supports multimodal message content (text + base64 images) and implements
    with_structured_output via JSON-schema prompting.
    """

    @property
    def _llm_type(self) -> str:
        return "local-gemma4"

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Run synchronous inference by delegating to the async path."""
        response_text = asyncio.get_event_loop().run_until_complete(
            self._ainvoke_raw(messages)
        )
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=response_text))])

    async def _agenerate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> ChatResult:
        response_text = await self._ainvoke_raw(messages)
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=response_text))])

    async def _ainvoke_raw(self, messages: list[BaseMessage]) -> str:
        """Convert LangChain messages to processor inputs and run inference."""
        import asyncio
        import base64
        import io

        import torch
        from PIL import Image as PILImage

        processor = _local_processor
        model = _local_model

        conversation: list[dict] = []
        pil_images: list[PILImage.Image] = []

        for msg in messages:
            role = "user" if msg.type == "human" else "assistant" if msg.type == "ai" else "system"
            if isinstance(msg.content, str):
                conversation.append({"role": role, "content": [{"type": "text", "text": msg.content}]})
            elif isinstance(msg.content, list):
                parts: list[dict] = []
                for part in msg.content:
                    if part.get("type") == "text":
                        parts.append({"type": "text", "text": part["text"]})
                    elif part.get("type") == "image_url":
                        image_url: str = part.get("image_url", "")
                        if isinstance(image_url, dict):
                            image_url = image_url.get("url", "")
                        raw = image_url.split(",", 1)[1] if "," in image_url else image_url
                        pil_images.append(PILImage.open(io.BytesIO(base64.b64decode(raw))).convert("RGB"))
                        parts.append({"type": "image"})
                conversation.append({"role": role, "content": parts})

        prompt = processor.apply_chat_template(
            conversation,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = processor(
            text=prompt,
            images=pil_images if pil_images else None,
            return_tensors="pt",
        ).to(model.device)

        def _generate() -> str:
            with torch.inference_mode():
                output_ids = model.generate(**inputs, max_new_tokens=512, do_sample=False)
            input_length = inputs["input_ids"].shape[1]
            new_tokens = output_ids[0][input_length:]
            return processor.decode(new_tokens, skip_special_tokens=True).strip()

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _generate)

    def with_structured_output(self, schema: Any, **kwargs: Any) -> Any:
        """Return a runnable that parses model output into the given Pydantic schema.

        Injects the JSON schema into the final system message so the model knows
        to return valid JSON matching the schema.
        """
        from langchain_core.runnables import RunnableLambda
        import inspect

        if hasattr(schema, "model_json_schema"):
            json_schema = schema.model_json_schema()
        else:
            json_schema = schema

        schema_str = json.dumps(json_schema, indent=2)

        async def _invoke_structured(messages: list[BaseMessage]) -> Any:
            format_instruction = (
                "\n\nRespond with ONLY this JSON object, no other text:\n"
                '{"correct": true, "feedback": "..."}\n'
                "Set correct to true if the sign matches the reference, false if not. "
                "Set feedback to 1-2 sentences of specific actionable feedback."
            )
            augmented = list(messages)
            # Append to the last HumanMessage — this is the final thing the model
            # sees before generating, making it much harder to ignore.
            from langchain_core.messages import HumanMessage
            for i in reversed(range(len(augmented))):
                if augmented[i].type == "human":
                    original = augmented[i].content
                    if isinstance(original, list):
                        new_content = list(original) + [{"type": "text", "text": format_instruction}]
                    else:
                        new_content = str(original) + format_instruction
                    augmented[i] = HumanMessage(content=new_content)
                    break

            raw = await self._ainvoke_raw(augmented)
            return _parse_json_response(raw, schema)

        return RunnableLambda(_invoke_structured)


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
    """Factory that constructs the correct LangChain LLM client based on INFERENCE_MODE."""

    @staticmethod
    def create() -> BaseChatModel:
        """Return a LangChain chat model configured for the active inference mode.

        Reads INFERENCE_MODE from the environment. Raises ValueError for
        unsupported modes. Raises EnvironmentError when required env vars
        are missing.

        Returns:
            A LangChain BaseChatModel instance ready for multimodal inference.
        """
        mode = os.environ.get("INFERENCE_MODE", "api").lower()

        if mode == "api":
            return InferenceClientFactory._create_api_client()
        if mode == "local":
            return InferenceClientFactory._create_local_client()

        raise ValueError(
            f"Unsupported INFERENCE_MODE '{mode}'. Expected 'api' or 'local'."
        )

    @staticmethod
    def _create_api_client() -> BaseChatModel:
        """Build a ChatGoogleGenerativeAI client pointed at the Gemma 4 API.

        Returns:
            Configured ChatGoogleGenerativeAI instance.

        Raises:
            EnvironmentError: If GOOGLE_API_KEY is not set.
        """
        from langchain_google_genai import ChatGoogleGenerativeAI

        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GOOGLE_API_KEY environment variable is required when INFERENCE_MODE=api"
            )

        return ChatGoogleGenerativeAI(
            model="gemma-4-e4b-it",
            google_api_key=api_key,
            temperature=0.1,
        )

    @staticmethod
    def _create_local_client() -> BaseChatModel:
        """Return a local Gemma 4 client backed by weights loaded at container startup.

        Requires _local_model and _local_processor to be set by modal_app.py's
        @modal.enter() before this is called.

        Returns:
            _LocalGemma4Model instance wrapping the pre-loaded weights.

        Raises:
            RuntimeError: If the model was not pre-loaded (modal_app.py not used).
        """
        if _local_model is None or _local_processor is None:
            raise RuntimeError(
                "Local model is not loaded. "
                "_local_model and _local_processor must be set by modal_app.py "
                "before InferenceClientFactory.create() is called."
            )
        return _LocalGemma4Model()
