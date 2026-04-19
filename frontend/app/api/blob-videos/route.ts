/**
 * GET /api/blob-videos?tier=1|2
 *
 * Lists all blobs under the given tier prefix in Vercel Blob storage and
 * returns a slug-to-URL map. Uses BLOB_READ_WRITE_TOKEN automatically via
 * the @vercel/blob SDK.
 */

import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tier = request.nextUrl.searchParams.get("tier");

  if (tier !== "1" && tier !== "2") {
    return NextResponse.json(
      { error: "tier query param must be 1 or 2" },
      { status: 400 },
    );
  }

  const prefix = `tier-${tier}/`;
  const { blobs } = await list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN });

  const slugToUrl: Record<string, string> = {};
  for (const blob of blobs) {
    const filename = blob.pathname.replace(prefix, "").replace(/\.mp4$/i, "");
    if (filename) slugToUrl[filename] = blob.url;
  }

  return NextResponse.json(slugToUrl);
}
