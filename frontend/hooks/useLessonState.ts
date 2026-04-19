"use client";

/**
 * useLessonState — generic lesson progression hook.
 *
 * Tracks which item the user is currently on, provides nextItem() and
 * resetLesson(), and signals when the lesson is complete.
 * Works for any array of items — used by both Tier 1 (SignMetadata[])
 * and Tier 2 (PhraseMetadata[]).
 */

import { useState, useCallback } from "react";

interface UseLessonStateReturn<T> {
  currentItem: T;
  currentIndex: number;
  totalItems: number;
  isComplete: boolean;
  nextItem: () => void;
  resetLesson: () => void;
}

export const useLessonState = <T>(items: T[]): UseLessonStateReturn<T> => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const isComplete = currentIndex >= items.length;
  const currentItem = items[Math.min(currentIndex, items.length - 1)];

  const nextItem = useCallback((): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, items.length));
  }, [items.length]);

  const resetLesson = useCallback((): void => {
    setCurrentIndex(0);
  }, []);

  return { currentItem, currentIndex, totalItems: items.length, isComplete, nextItem, resetLesson };
};
