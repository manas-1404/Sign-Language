"use client";

/**
 * useLessonState — manages all lesson progression logic.
 *
 * This is the single source of truth for which sign the user is currently
 * practicing, how far through the lesson they are, and whether it is complete.
 * No other component or hook manages lesson state.
 */

import { useState, useCallback } from "react";
import { SIGNS, TOTAL_SIGNS } from "@/constants/signs";
import type { SignMetadata } from "@/types";

interface UseLessonStateReturn {
  currentSign: SignMetadata;
  currentIndex: number;
  totalSigns: number;
  isComplete: boolean;
  nextSign: () => void;
  resetLesson: () => void;
}

export const useLessonState = (): UseLessonStateReturn => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // isComplete is true when the index reaches the end.
  // currentSign is always clamped to the last valid entry so hooks that
  // depend on currentSign.id never receive undefined — even after the
  // lesson is complete and before the completion screen renders.
  const isComplete = currentIndex >= TOTAL_SIGNS;
  const currentSign = SIGNS[Math.min(currentIndex, TOTAL_SIGNS - 1)];

  const nextSign = useCallback((): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, TOTAL_SIGNS));
  }, []);

  const resetLesson = useCallback((): void => {
    setCurrentIndex(0);
  }, []);

  return {
    currentSign,
    currentIndex,
    totalSigns: TOTAL_SIGNS,
    isComplete,
    nextSign,
    resetLesson,
  };
};
