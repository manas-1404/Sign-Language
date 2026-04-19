"use client";

/**
 * /practice-sign/tier-2 — short phrase practice.
 *
 * Each lesson item is a 2-3 sign ASL phrase. The user watches a 3-second
 * recording (8 frames) and receives feedback on the full phrase execution.
 */

import { useState, useCallback } from "react";
import { useLessonState } from "@/hooks/useLessonState";
import { analyzeSign } from "@/services/signApi";
import WebcamCapture from "@/components/WebcamCapture";
import FeedbackPanel from "@/components/FeedbackPanel";
import ProgressBar from "@/components/ProgressBar";
import { TIER2_PHRASES } from "@/constants/tier2Signs";
import { TIER_VIDEO_CONFIG } from "@/constants/config";
import type { AnalysisStatus, FeedbackResponse } from "@/types";

const TIER = 2;
const tierConfig = TIER_VIDEO_CONFIG[TIER];

export default function Tier2Page() {
  const { currentItem: currentPhrase, currentIndex, totalItems, isComplete, nextItem, resetLesson } =
    useLessonState(TIER2_PHRASES);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCapture = useCallback(
    async (frames: string[]): Promise<void> => {
      setAnalysisStatus("analyzing");
      setFeedback(null);
      setErrorMessage(null);

      try {
        const result = await analyzeSign(TIER, currentPhrase.id, frames);
        setFeedback(result);
        setAnalysisStatus("done");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
        setErrorMessage(message);
        setAnalysisStatus("error");
      }
    },
    [currentPhrase.id],
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <TierBadge tier={TIER} label="Short Phrases" />
        <ProgressBar currentIndex={currentIndex} totalSigns={totalItems} />
        <PhrasePrompt
          phrase={currentPhrase.phrase}
          aslOrder={currentPhrase.aslOrder}
          description={currentPhrase.description}
          phraseIndex={currentIndex}
          totalPhrases={totalItems}
        />

        <WebcamCapture
          isCameraOn={isCameraOn}
          onToggleCamera={handleToggleCamera}
          onCapture={handleCapture}
          isCapturing={analysisStatus === "capturing"}
          tierConfig={tierConfig}
        />

        <ActionBar
          status={analysisStatus}
          isCameraOn={isCameraOn}
          onStartCapture={handleStartCapture}
          onRetry={handleRetry}
          onNext={handleNext}
        />

        {analysisStatus === "analyzing" && <AnalyzingIndicator />}
        {analysisStatus === "error" && errorMessage && <ErrorBanner message={errorMessage} />}
        {analysisStatus === "done" && feedback && <FeedbackPanel feedback={feedback} />}
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TierBadge = ({ tier, label }: { tier: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold uppercase tracking-widest">
      Tier {tier}
    </span>
    <span className="text-slate-400 text-sm">{label}</span>
  </div>
);

interface PhrasePromptProps {
  phrase: string;
  aslOrder: string;
  description: string;
  phraseIndex: number;
  totalPhrases: number;
}

const PhrasePrompt = ({ phrase, aslOrder, description, phraseIndex, totalPhrases }: PhrasePromptProps) => (
  <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-center space-y-3">
    <p className="text-sm font-medium text-violet-300 uppercase tracking-widest">
      Phrase {phraseIndex + 1} of {totalPhrases}
    </p>
    <h2 className="text-2xl font-bold text-white leading-snug">{phrase}</h2>
    <div className="inline-block bg-slate-800/60 rounded-lg px-4 py-2">
      <p className="text-violet-300 text-sm font-mono tracking-wider">{aslOrder}</p>
    </div>
    <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">{description}</p>
  </div>
);

interface ActionBarProps {
  status: AnalysisStatus;
  isCameraOn: boolean;
  onStartCapture: () => void;
  onRetry: () => void;
  onNext: () => void;
}

const ActionBar = ({ status, isCameraOn, onStartCapture, onRetry, onNext }: ActionBarProps) => {
  if (!isCameraOn) {
    return (
      <button disabled className="w-full py-4 rounded-2xl bg-slate-800 font-semibold text-lg text-slate-500 cursor-not-allowed border border-slate-700">
        Turn on camera to start
      </button>
    );
  }

  if (status === "idle" || status === "error") {
    return (
      <button onClick={onStartCapture} className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 font-semibold text-lg transition-colors">
        {status === "error" ? "Try Again" : "Start Recording"}
      </button>
    );
  }

  if (status === "capturing" || status === "analyzing") {
    return (
      <button disabled className="w-full py-4 rounded-2xl bg-violet-800/50 font-semibold text-lg text-slate-400 cursor-not-allowed">
        {status === "capturing" ? "Recording in progress…" : "Analyzing…"}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button onClick={onRetry} className="flex-1 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 font-semibold text-lg transition-colors">
        Retry
      </button>
      <button onClick={onNext} className="flex-1 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 font-semibold text-lg transition-colors">
        Next Phrase →
      </button>
    </div>
  );
};

const AnalyzingIndicator = () => (
  <div className="flex items-center justify-center gap-3 py-4 text-violet-300">
    <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">Analyzing your phrase with Gemma 4…</span>
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
  <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-8">
    <div className="text-center space-y-6 max-w-md">
      <h1 className="text-4xl font-bold text-white">Tier {tier} Complete!</h1>
      <p className="text-slate-300 text-lg">You have practiced all phrases. Keep it up!</p>
      <button onClick={onReset} className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 font-semibold text-lg text-white transition-colors">
        Practice Again
      </button>
    </div>
  </main>
);
