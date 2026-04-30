/**
 * POST /api/analyze?tier=<n>&content_id=<n>
 *
 * Proxy between the browser and the Modal GPU backend.
 * Validates the Cloudflare Turnstile token, then forwards the frame payload
 * to Modal with the shared API secret header.
 *
 * Neither the Modal endpoint URL nor the secrets ever reach the browser.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const verifyTurnstileToken = async (token: string, remoteIp: string | null): Promise<boolean> => {
  const params = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
    ...(remoteIp ? { remoteip: remoteIp } : {}),
  });

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = (await res.json()) as { success: boolean };
  return data.success;
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const turnstileToken = request.headers.get("x-turnstile-token");
  if (!turnstileToken) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 403 });
  }

  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const verified = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  }

  const tier = request.nextUrl.searchParams.get("tier");
  const contentId = request.nextUrl.searchParams.get("content_id");
  if (!tier || !contentId) {
    return NextResponse.json({ error: "Missing tier or content_id" }, { status: 400 });
  }

  const modalUrl = `${process.env.MODAL_API_URL}/analyze?tier=${tier}&content_id=${contentId}`;
  const body = await request.text();

  const modalResponse = await fetch(modalUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Secret": process.env.MODAL_PROXY_API_SECRET!,
    },
    body,
  });

  const data = await modalResponse.json();
  return NextResponse.json(data, { status: modalResponse.status });
};
