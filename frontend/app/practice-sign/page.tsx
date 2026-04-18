"use client";

/**
 * /practice-sign page — the core learning experience.
 *
 * Owns the top-level lesson flow:
 *   1. Show current sign prompt
 *   2. Trigger webcam countdown capture
 *   3. Send frame to backend via signApi
 *   4. Display feedback in FeedbackPanel
 *   5. Allow retry or advance to next sign
 *
 * All lesson state lives in useLessonState. All webcam logic lives in WebcamCapture.
 */

import { useState, useCallback } from "react";
import { useLessonState } from "@/hooks/useLessonState";
import { analyzeSign } from "@/services/signApi";
import WebcamCapture from "@/components/WebcamCapture";
import FeedbackPanel from "@/components/FeedbackPanel";
import SignPrompt from "@/components/SignPrompt";
import ProgressBar from "@/components/ProgressBar";
import type { AnalysisStatus, FeedbackResponse } from "@/types";

export default function PracticeSignPage() {
  const { currentSign, currentIndex, totalSigns, isComplete, nextSign, resetLesson } =
    useLessonState();

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
        const result = await analyzeSign(currentSign.id, frames);
        setFeedback(result);
        setAnalysisStatus("done");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
        setErrorMessage(message);
        setAnalysisStatus("error");
      }
    },
    [currentSign.id],
  );

  const handleStartCapture = useCallback((): void => {
    setAnalysisStatus("capturing");
    setFeedback(null);
    setErrorMessage(null);
  }, []);

  const handleToggleCamera = useCallback((): void => {
    setIsCameraOn((prev) => {
      // Turning off mid-capture resets the flow back to idle.
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
    nextSign();
    setAnalysisStatus("idle");
    setFeedback(null);
    setErrorMessage(null);
  }, [nextSign]);

  if (isComplete) {
    return <LessonCompleteScreen onReset={resetLesson} />;
  }

  const isCapturing = analysisStatus === "capturing";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <ProgressBar currentIndex={currentIndex} totalSigns={totalSigns} />

        <SignPrompt sign={currentSign} signIndex={currentIndex} totalSigns={totalSigns} />

        <WebcamCapture
          isCameraOn={isCameraOn}
          onToggleCamera={handleToggleCamera}
          onCapture={handleCapture}
          isCapturing={isCapturing}
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
      <button
        disabled
        className="w-full py-4 rounded-2xl bg-slate-800 font-semibold text-lg text-slate-500 cursor-not-allowed border border-slate-700"
      >
        Turn on camera to start
      </button>
    );
  }

  if (status === "idle" || status === "error") {
    return (
      <button
        onClick={onStartCapture}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold text-lg transition-colors"
      >
        {status === "error" ? "Try Again" : "Start Recording"}
      </button>
    );
  }

  if (status === "capturing" || status === "analyzing") {
    return (
      <button
        disabled
        className="w-full py-4 rounded-2xl bg-indigo-800/50 font-semibold text-lg text-slate-400 cursor-not-allowed"
      >
        {status === "capturing" ? "Recording in progress…" : "Analyzing…"}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={onRetry}
        className="flex-1 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 font-semibold text-lg transition-colors"
      >
        Retry
      </button>
      <button
        onClick={onNext}
        className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-lg transition-colors"
      >
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
  onReset: () => void;
}

const LessonCompleteScreen = ({ onReset }: LessonCompleteScreenProps) => (
  <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-8">
    <div className="text-center space-y-6 max-w-md">
      <div className="text-7xl">🎉</div>
      <h1 className="text-4xl font-bold text-white">Lesson Complete!</h1>
      <p className="text-slate-300 text-lg">
        You&apos;ve practiced all 10 ASL signs. Keep it up!
      </p>
      <button
        onClick={onReset}
        className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-lg text-white transition-colors"
      >
        Practice Again
      </button>
    </div>
  </main>
);
