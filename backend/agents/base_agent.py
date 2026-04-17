"""Abstract base class for all sign language evaluation subagents.

Each subagent is responsible for evaluating exactly one channel
(hand shape, facial expression, or body posture). All subagents
share the same LLM client instance provided by the Orchestrator.
"""

from abc import ABC, abstractmethod

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import Runnable

from backend.models.schemas import ChannelFeedback


class BaseSignAgent(ABC):
    """Abstract base for hand, face, and body evaluation agents.

    Wraps the shared LLM with with_structured_output(ChannelFeedback) so the
    Gemini API enforces the response schema natively — no parsing needed.
    Subclasses must implement the `analyze` method.
    """

    def __init__(self, llm: BaseChatModel) -> None:
        """Initialize the agent and bind structured output to the ChannelFeedback schema.

        Args:
            llm: A LangChain chat model capable of multimodal input.
        """
        self._structured_llm: Runnable = llm.with_structured_output(ChannelFeedback)

    @abstractmethod
    async def analyze(self, image_base64: str, reference: str) -> ChannelFeedback:
        """Evaluate a single channel from the captured webcam frame.

        Args:
            image_base64: Base64-encoded JPEG image from the webcam.
            reference: Ground truth description for this channel from signs_config.json.

        Returns:
            ChannelFeedback with a correct flag and 1-2 sentence feedback.
        """
        ...
