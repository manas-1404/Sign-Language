"""Central configuration for the sign language analysis backend.

All tuneable parameters live here. No other file should hardcode these values.
Adjust FRAME_COUNT, FRAME_INTERVAL_MS, and FRAME_RESOLUTION to experiment
with different capture strategies without touching any agent or API code.
"""


class VideoConfig:
    """Parameters controlling how the frontend records and samples video frames."""

    # Number of frames extracted from the recording and sent for analysis.
    FRAME_COUNT: int = 6

    # Gap between consecutive sampled frames in milliseconds.
    FRAME_INTERVAL_MS: int = 500

    # Target resolution for each frame (width, height) in pixels.
    # 1280x720 = 720p. Reduce to 640x360 to cut context window usage.
    FRAME_WIDTH: int = 1280
    FRAME_HEIGHT: int = 720

    # Total recording duration derived from the above — informational only.
    # Frontend uses FRAME_COUNT and FRAME_INTERVAL_MS directly.
    RECORDING_DURATION_MS: int = FRAME_COUNT * FRAME_INTERVAL_MS


class ApiConfig:
    """HTTP and request validation settings."""

    MIN_SIGN_ID: int = 1
    MAX_SIGN_ID: int = 10
