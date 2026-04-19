/**
 * /practice-sign/tier-2 — server component.
 *
 * Fetches the tier-2 video slug→URL map from Vercel Blob at request time,
 * then passes it down to the interactive client component.
 */

import { list } from "@vercel/blob";
import Tier2Practice from "./Tier2Practice";

async function fetchVideoUrls(): Promise<Record<string, string>> {
  const prefix = "tier-2/";
  const { blobs } = await list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN });
  const slugToUrl: Record<string, string> = {};
  for (const blob of blobs) {
    const slug = blob.pathname.replace(prefix, "").replace(/\.mp4$/i, "");
    if (slug) slugToUrl[slug] = blob.url;
  }
  return slugToUrl;
}

export default async function Tier2Page() {
  const videoUrls = await fetchVideoUrls();
  return <Tier2Practice videoUrls={videoUrls} />;
}
