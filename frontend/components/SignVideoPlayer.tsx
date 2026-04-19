"use client";

/**
 * Displays a looping reference video for the current ASL sign or phrase.
 * Receives the video URL as a prop — URL resolution happens server-side.
 */

const ANYSIGN_BASE = "https://www.anysign.app/en/dictionary";

interface SignVideoPlayerProps {
  videoUrl: string;
  attributionSlug: string;
}

export default function SignVideoPlayer({ videoUrl, attributionSlug }: SignVideoPlayerProps) {
  const attributionUrl = `${ANYSIGN_BASE}/${attributionSlug}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
      <div className="px-4 py-2 border-b border-white/10">
        <a
          href={attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-200 break-all"
        >
          {attributionUrl}
        </a>
      </div>
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full object-contain"
      />
    </div>
  );
}
