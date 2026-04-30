/**
 * signApi — typed API client for the sign language analysis backend.
 *
 * All configuration (base URL) comes from environment variables.
 * This is the only file in the frontend that makes HTTP calls to the backend.
 */

import type { FeedbackResponse } from "@/types";

interface SignRequestBody {
  frames: string[];
}

/**
 * Send an ordered sequence of webcam frames to the backend for analysis.
 *
 * Routes through the Next.js proxy at /api/analyze — the Modal endpoint URL
 * and secrets never reach the browser.
 *
 * @param tier - Learning tier (1 = individual signs, 2 = short phrases)
 * @param contentId - Numeric ID of the sign or phrase within the tier
 * @param frames - Ordered base64-encoded JPEG frames, earliest first
 * @param turnstileToken - Single-use Cloudflare Turnstile token from the widget
 * @returns Structured feedback for hand, face, and body channels
 * @throws Error if the request fails or the response is not OK
 */
export const analyzeSign = async (
  tier: number,
  contentId: number,
  frames: string[],
  turnstileToken: string,
): Promise<FeedbackResponse> => {
  const body: SignRequestBody = { frames };
  const url = `/api/analyze?tier=${tier}&content_id=${contentId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Analysis request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<FeedbackResponse>;
};
