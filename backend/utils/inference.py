"""LLM client factory.

Reads the INFERENCE_MODE environment variable and returns the
appropriate LangChain chat model. This is the only file in the
entire codebase that is aware of which inference mode is active.

Supported modes:
    api   — Google AI Studio Gemma 4 API (requires GOOGLE_API_KEY)
    local — Local Gemma 4 weights (reserved for GPU deployment)
"""

import os
from langchain_core.language_models.chat_models import BaseChatModel


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
            model="gemma-4-31b-it",
            google_api_key=api_key,
            temperature=0.1,
        )

    @staticmethod
    def _create_local_client() -> BaseChatModel:
        """Build a local LLM client loading Gemma 4 weights from disk.

        Reserved for GPU deployment on Modal. Not used in API mode.

        Returns:
            Configured local LLM client.
        """
        # Placeholder for Modal GPU deployment path.
        # This would use langchain_community or a custom client
        # to load weights from the Modal Volume.
        raise NotImplementedError(
            "Local inference mode is reserved for Modal GPU deployment."
        )
