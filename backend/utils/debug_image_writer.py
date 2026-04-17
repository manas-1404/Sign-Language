"""Debug image persistence utility.

Controlled by the SAVE_DEBUG_IMAGES environment variable.
When enabled, saves every incoming webcam frame to disk so you can
inspect what the model is actually seeing.

Usage:
    Set SAVE_DEBUG_IMAGES=true in your .env file.
    Images are written to backend/debug_images/{sign_id}_{timestamp}.jpg
"""

import os
from datetime import datetime
from pathlib import Path

from backend.utils.image_utils import ImageProcessor

_OUTPUT_DIR = Path(__file__).parent.parent / "debug_images"


class DebugImageWriter:
    """Saves incoming frames to disk when SAVE_DEBUG_IMAGES is enabled.

    All methods are static — no state, no instantiation needed.
    """

    @staticmethod
    def is_enabled() -> bool:
        """Return True if debug image saving is turned on.

        Reads the SAVE_DEBUG_IMAGES environment variable.
        Accepts 'true', '1', or 'yes' (case-insensitive).

        Returns:
            True if saving is enabled, False otherwise.
        """
        return os.environ.get("SAVE_DEBUG_IMAGES", "false").strip().lower() in ("true", "1", "yes")

    @staticmethod
    def save(sign_id: int, image_base64: str) -> Path | None:
        """Save a base64-encoded image to disk if debug saving is enabled.

        Creates the output directory if it does not exist.
        Filename format: {sign_id}_{YYYYMMDD_HHMMSS_ffffff}.jpg

        Args:
            sign_id: The sign being practiced — included in the filename for filtering.
            image_base64: Base64-encoded JPEG from the webcam request.

        Returns:
            The Path where the file was saved, or None if saving is disabled.
        """
        if not DebugImageWriter.is_enabled():
            return None

        _OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"sign{sign_id}_{timestamp}.jpg"
        output_path = _OUTPUT_DIR / filename

        raw_bytes = ImageProcessor.decode_base64(image_base64)
        output_path.write_bytes(raw_bytes)

        print(f"[DebugImageWriter] Saved: {output_path}")
        return output_path
