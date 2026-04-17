"""Image preprocessing utilities for the sign language analysis pipeline.

Handles base64 decoding and any preprocessing required before
passing image data to the vision model.
"""

import base64
from typing import Optional


class ImageProcessor:
    """Handles decoding and preprocessing of webcam frame images."""

    @staticmethod
    def decode_base64(image_base64: str) -> bytes:
        """Decode a base64 string to raw image bytes.

        Strips any data URI prefix (e.g. 'data:image/jpeg;base64,')
        before decoding, so both raw base64 and data URIs are accepted.

        Args:
            image_base64: Base64-encoded image string, with or without data URI prefix.

        Returns:
            Raw image bytes.
        """
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]
        return base64.b64decode(image_base64)

    @staticmethod
    def extract_mime_type(image_base64: str) -> str:
        """Extract MIME type from a data URI prefix.

        Defaults to 'image/jpeg' if no prefix is present.

        Args:
            image_base64: Base64 string, optionally prefixed with a data URI.

        Returns:
            MIME type string (e.g. 'image/jpeg').
        """
        if image_base64.startswith("data:"):
            mime_part = image_base64.split(";")[0]
            return mime_part.replace("data:", "")
        return "image/jpeg"

    @staticmethod
    def to_inline_data(image_base64: str) -> dict:
        """Convert a base64 image to the inline_data dict expected by the Gemini API.

        Args:
            image_base64: Base64-encoded image string.

        Returns:
            Dict with 'mime_type' and 'data' keys for use in LangChain message content.
        """
        mime_type = ImageProcessor.extract_mime_type(image_base64)
        raw_b64 = image_base64.split(",", 1)[1] if "," in image_base64 else image_base64
        return {"type": "image_url", "image_url": f"data:{mime_type};base64,{raw_b64}"}
