"""Central configuration for the sign language analysis backend.

All tuneable parameters live here. No other file should hardcode these values.
"""

from pathlib import Path

_CONFIG_DIR = Path(__file__).parent


class TierVideoConfig:
    """Per-tier recording parameters controlling frame count and sampling interval.

    Tier 1 — individual signs: 4 frames over ~2 seconds.
    Tier 2 — short phrases: 8 frames over ~3 seconds.
    """

    SETTINGS: dict[int, dict[str, int]] = {
        1: {"frame_count": 4, "frame_interval_ms": 667},
        2: {"frame_count": 8, "frame_interval_ms": 429},
    }

    CONFIG_FILES: dict[int, Path] = {
        1: _CONFIG_DIR / "tier1_config.json",
        2: _CONFIG_DIR / "tier2_config.json",
    }

    # Shared resolution for all tiers.
    FRAME_WIDTH: int = 1280
    FRAME_HEIGHT: int = 720


class ApiConfig:
    """HTTP and request validation settings."""

    MIN_TIER: int = 1
    MAX_TIER: int = 2  # Tier 3 not yet implemented.
    MIN_CONTENT_ID: int = 1
