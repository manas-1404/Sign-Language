/**
 * signApi — typed API client for the sign language analysis backend.
 *
 * All configuration (base URL) comes from environment variables.
 * This is the only file in the frontend that makes HTTP calls to the backend.
 */

import type { FeedbackResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface SignRequestBody {
  image_base64: string;
}

/**
 * Send a webcam frame to the backend for analysis and return structured feedback.
 *
 * @param signId - Numeric sign identifier (1–10), must match signs_config.json
 * @param imageBase64 - Base64-encoded JPEG image captured from the webcam
 * @returns Structured feedback for hand, face, and body channels
 * @throws Error if the request fails or the response is not OK
 */
export const analyzeSign = async (
  signId: number,
  imageBase64: string,
): Promise<FeedbackResponse> => {
  const body: SignRequestBody = { image_base64: imageBase64 };

  const response = await fetch(`${API_BASE_URL}/analyze/${signId}`, {
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
