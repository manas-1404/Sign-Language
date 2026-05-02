/**
 * signApi — typed API client for the sign language analysis backend.
 *
 * All configuration (base URL) comes from environment variables.
 * This is the only file in the frontend that makes HTTP calls to the backend.
 */

import type { FeedbackResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface SignRequestBody {
  frames: string[];
}

/**
 * Send an ordered sequence of webcam frames to the backend for analysis.
 *
 * @param tier - Learning tier (1 = individual signs, 2 = short phrases)
 * @param contentId - Numeric ID of the sign or phrase within the tier
 * @param frames - Ordered base64-encoded JPEG frames, earliest first
 * @returns Structured feedback for hand, face, and body channels
 * @throws Error if the request fails or the response is not OK
 */
export const analyzeSign = async (
  tier: number,
  contentId: number,
  frames: string[],
): Promise<FeedbackResponse> => {
  const body: SignRequestBody = { frames };
  const url = `${API_BASE_URL}?tier=${tier}&content_id=${contentId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Analysis request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<FeedbackResponse>;
};
