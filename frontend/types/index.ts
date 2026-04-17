/**
 * Shared TypeScript types for the Sign Language Learning Companion.
 *
 * These interfaces exactly mirror the backend Pydantic schemas defined
 * in backend/models/schemas.py. Any change to one must be reflected in the other.
 */

/** Feedback for a single evaluation channel (hand, face, or body). */
export interface ChannelFeedback {
  /** Whether this channel was executed correctly. */
  correct: boolean;
  /** 1-2 sentence specific, actionable feedback. */
  feedback: string;
}

/** Aggregated feedback across all three evaluation channels from the backend. */
export interface FeedbackResponse {
  hand: ChannelFeedback;
  face: ChannelFeedback;
  body: ChannelFeedback;
}

/** Metadata for a single ASL sign in the lesson sequence. */
export interface SignMetadata {
  /** Unique numeric ID matching the key in backend/config/signs_config.json. */
  id: number;
  /** Display name of the sign (e.g. "hello"). */
  name: string;
  /** Short description of what the sign means or how to perform it. */
  description: string;
}

/** Possible states of the webcam permission flow. */
export type WebcamPermissionStatus = "idle" | "granted" | "denied" | "error";

/** Possible states of the sign analysis API call. */
export type AnalysisStatus = "idle" | "capturing" | "analyzing" | "done" | "error";
