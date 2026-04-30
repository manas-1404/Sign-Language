"use client";

/**
 * Interactive tier-1 practice UI.
 *
 * Receives a pre-fetched videoUrls map (slug → blob URL) from the server
 * component and renders the full lesson flow including the reference video.
 */

import { useState, useCallback } from "react";
import Turnstile from "@marsidev/react-turnstile";
import { useLessonState } from "@/hooks/useLessonState";
import { useTurnstile } from "@/hooks/useTurnstile";
import { analyzeSign } from "@/services/signApi";
import WebcamCapture from "@/components/WebcamCapture";
import FeedbackPanel from "@/components/FeedbackPanel";
import SignPrompt from "@/components/SignPrompt";
import ProgressBar from "@/components/ProgressBar";
import SignVideoPlayer from "@/components/SignVideoPlayer";
import { TIER1_SIGNS } from "@/constants/signs";
import { TIER_VIDEO_CONFIG } from "@/constants/config";
import type { AnalysisStatus, FeedbackResponse } from "@/types";

const TIER = 1;
const tierConfig = TIER_VIDEO_CONFIG[TIER];

interface Tier1PracticeProps {
  videoUrls: Record<string, string>;
}

export default function Tier1Practice({ videoUrls }: Tier1PracticeProps) {
  const { currentItem: currentSign, currentIndex, totalItems, isComplete, nextItem, resetLesson } =
    useLessonState(TIER1_SIGNS);

  const { token: turnstileToken, widgetKey, onVerified, reset: resetTurnstile } = useTurnstile();

  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCapture = useCallback(
    async (frames: string[]): Promise<void> => {
      if (!turnstileToken) return;
      setAnalysisStatus("analyzing");
      setFeedback(null);
      setErrorMessage(null);

      try {
        const result = await analyzeSign(TIER, currentSign.id, frames, turnstileToken);
        setFeedback(result);
        setAnalysisStatus("done");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
        setErrorMessage(message);
        setAnalysisStatus("error");
      } finally {
        resetTurnstile();
      }
    },
    [currentSign.id, turnstileToken, resetTurnstile],
  );

  const handleStartCapture = useCallback((): void => {
    setAnalysisStatus("capturing");
    setFeedback(null);
    setErrorMessage(null);
  }, []);

  const handleToggleCamera = useCallback((): void => {
    setIsCameraOn((prev) => {
      if (prev) {
        setAnalysisStatus("idle");
        setFeedback(null);
        setErrorMessage(null);
      }
      return !prev;
    });
  }, []);

  const handleRetry = useCallback((): void => {
    setAnalysisStatus("idle");
    setFeedback(null);
    setErrorMessage(null);
  }, []);

  const handleNext = useCallback((): void => {
    nextItem();
    setAnalysisStatus("idle");
    setFeedback(null);
    setErrorMessage(null);
  }, [nextItem]);

  if (isComplete) {
    return <LessonCompleteScreen tier={TIER} onReset={resetLesson} />;
  }

  const currentVideoUrl = videoUrls[currentSign.videoSlug];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <TierBadge tier={TIER} label="Individual Signs" />
          <ProgressBar currentIndex={currentIndex} totalSigns={totalItems} />
        </div>

        {/* Side-by-side: left = camera, right = reference video */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Left column: sign prompt + webcam + controls */}
          <div className="flex flex-col gap-3">
            <SignPrompt sign={currentSign} signIndex={currentIndex} totalSigns={totalItems} />
            <WebcamCapture
              isCameraOn={isCameraOn}
              onToggleCamera={handleToggleCamera}
              onCapture={handleCapture}
              isCapturing={analysisStatus === "capturing"}
              tierConfig={tierConfig}
              className="w-full"
            />
            <ActionBar
              status={analysisStatus}
              isCameraOn={isCameraOn}
              isVerified={!!turnstileToken}
              onStartCapture={handleStartCapture}
              onRetry={handleRetry}
              onNext={handleNext}
            />
            <Turnstile
              key={widgetKey}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={onVerified}
              options={{ size: "compact" }}
            />
            {analysisStatus === "analyzing" && <AnalyzingIndicator />}
            {analysisStatus === "error" && errorMessage && <ErrorBanner message={errorMessage} />}
          </div>

          {/* Right column: reference video at natural aspect ratio */}
          <div className="flex flex-col gap-3">
            {currentVideoUrl && (
              <SignVideoPlayer
                videoUrl={currentVideoUrl}
                attributionSlug={currentSign.videoSlug}
              />
            )}
          </div>
        </div>

        {/* Feedback panel below both columns */}
        {analysisStatus === "done" && feedback && <FeedbackPanel feedback={feedback} />}
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TierBadge = ({ tier, label }: { tier: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold uppercase tracking-widest">
      Tier {tier}
    </span>
    <span className="text-slate-400 text-sm">{label}</span>
  </div>
);

interface ActionBarProps {
  status: AnalysisStatus;
  isCameraOn: boolean;
  isVerified: boolean;
  onStartCapture: () => void;
  onRetry: () => void;
  onNext: () => void;
}

const ActionBar = ({ status, isCameraOn, isVerified, onStartCapture, onRetry, onNext }: ActionBarProps) => {
  if (!isCameraOn) {
    return (
      <button disabled className="w-full py-4 rounded-2xl bg-slate-800 font-semibold text-lg text-slate-500 cursor-not-allowed border border-slate-700">
        Turn on camera to start
      </button>
    );
  }

  if (status === "idle" || status === "error") {
    return (
      <button
        onClick={isVerified ? onStartCapture : undefined}
        disabled={!isVerified}
        className={`w-full py-4 rounded-2xl font-semibold text-lg transition-colors ${isVerified ? "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700" : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"}`}
      >
        {!isVerified ? "Verifying…" : status === "error" ? "Try Again" : "Start Recording"}
      </button>
    );
  }

  if (status === "capturing" || status === "analyzing") {
    return (
      <button disabled className="w-full py-4 rounded-2xl bg-indigo-800/50 font-semibold text-lg text-slate-400 cursor-not-allowed">
        {status === "capturing" ? "Recording in progress…" : "Analyzing…"}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button onClick={onRetry} className="flex-1 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 font-semibold text-lg transition-colors">
        Retry
      </button>
      <button onClick={onNext} className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-lg transition-colors">
        Next Sign →
      </button>
    </div>
  );
};

const AnalyzingIndicator = () => (
  <div className="flex items-center justify-center gap-3 py-4 text-indigo-300">
    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">Analyzing your sign with Gemma 4…</span>
  </div>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-red-300 text-sm">
    {message}
  </div>
);

interface LessonCompleteScreenProps {
  tier: number;
  onReset: () => void;
}

const LessonCompleteScreen = ({ tier, onReset }: LessonCompleteScreenProps) => (
  <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-8">
    <div className="text-center space-y-6 max-w-md">
      <h1 className="text-4xl font-bold text-white">Tier {tier} Complete!</h1>
      <p className="text-slate-300 text-lg">You have practiced all signs. Keep it up!</p>
      <button onClick={onReset} className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-lg text-white transition-colors">
        Practice Again
      </button>
    </div>
  </main>
);
