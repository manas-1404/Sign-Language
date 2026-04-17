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

  const currentSign = SIGNS[currentIndex];
  const isComplete = currentIndex >= TOTAL_SIGNS;

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
