/**
 * Frontend mirror of backend/config/settings.py VideoConfig.
 *
 * These values must stay in sync with VideoConfig in the backend.
 * Change them here to experiment with frame count and resolution
 * without touching any component or hook code.
 */

export const VIDEO_CONFIG = {
  /** Number of frames to capture during recording. */
  FRAME_COUNT: 6,

  /** Gap between consecutive captured frames in milliseconds. */
  FRAME_INTERVAL_MS: 500,

  /** Target frame width in pixels sent to the backend. */
  FRAME_WIDTH: 1280,

  /** Target frame height in pixels sent to the backend. */
  FRAME_HEIGHT: 720,
} as const;
