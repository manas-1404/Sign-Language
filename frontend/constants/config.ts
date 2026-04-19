/**
 * Per-tier video capture configuration.
 * Values are read from environment variables with hardcoded fallbacks.
 * Must stay in sync with TierVideoConfig in backend/config/settings.py.
 */

export interface TierVideoSettings {
  frameCount: number;
  frameIntervalMs: number;
  frameWidth: number;
  frameHeight: number;
}

export const TIER_VIDEO_CONFIG: Record<number, TierVideoSettings> = {
  1: {
    frameCount: Number(process.env.NEXT_PUBLIC_TIER1_FRAME_COUNT ?? 4),
    frameIntervalMs: Number(process.env.NEXT_PUBLIC_TIER1_FRAME_INTERVAL_MS ?? 667),
    frameWidth: Number(process.env.NEXT_PUBLIC_FRAME_WIDTH ?? 1280),
    frameHeight: Number(process.env.NEXT_PUBLIC_FRAME_HEIGHT ?? 720),
  },
  2: {
    frameCount: Number(process.env.NEXT_PUBLIC_TIER2_FRAME_COUNT ?? 8),
    frameIntervalMs: Number(process.env.NEXT_PUBLIC_TIER2_FRAME_INTERVAL_MS ?? 429),
    frameWidth: Number(process.env.NEXT_PUBLIC_FRAME_WIDTH ?? 1280),
    frameHeight: Number(process.env.NEXT_PUBLIC_FRAME_HEIGHT ?? 720),
  },
};
