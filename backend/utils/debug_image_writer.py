"""Debug image persistence utility.

Controlled by the SAVE_DEBUG_IMAGES environment variable.
When enabled, saves every incoming frame sequence to disk so you can
inspect exactly what the model is seeing for each request.

Usage:
    Set SAVE_DEBUG_IMAGES=true in your .env file.
    Each request creates a subdirectory:
        backend/debug_images/sign{id}_{timestamp}/
            frame_01.jpg
            frame_02.jpg
            ...
            frame_06.jpg
"""

import os
from datetime import datetime
from pathlib import Path

from backend.utils.image_utils import ImageProcessor

_OUTPUT_DIR = Path(__file__).parent.parent / "debug_images"


class DebugImageWriter:
    """Saves incoming frame sequences to disk when SAVE_DEBUG_IMAGES is enabled.

    Each call to save_frames() creates one subdirectory per request containing
    one JPEG per frame, in the order they were sent to the agents.

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
    def save_frames(sign_id: int, frames: list[str]) -> Path | None:
        """Save all frames from a single request to a dedicated subdirectory.

        Directory name format: sign{id}_{YYYYMMDD_HHMMSS_ffffff}
        File name format: frame_01.jpg, frame_02.jpg, …

        Args:
            sign_id: The sign being practiced — included in the directory name.
            frames: Ordered list of base64-encoded JPEG frames, earliest first.

        Returns:
            The Path of the created subdirectory, or None if saving is disabled.
        """
        if not DebugImageWriter.is_enabled():
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        request_dir = _OUTPUT_DIR / f"sign{sign_id}_{timestamp}"
        request_dir.mkdir(parents=True, exist_ok=True)

        for index, frame_base64 in enumerate(frames, start=1):
            filename = f"frame_{index:02d}.jpg"
            raw_bytes = ImageProcessor.decode_base64(frame_base64)
            (request_dir / filename).write_bytes(raw_bytes)

        print(f"[DebugImageWriter] Saved {len(frames)} frames → {request_dir}")
        return request_dir
