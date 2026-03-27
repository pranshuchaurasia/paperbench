// ================================================================
// FILE: src/hooks/useExamNavigation.ts
// PURPOSE: Derived navigation helpers for the live exam experience.
// DEPENDENCIES: src/store/examStore
// ================================================================

import { useMemo } from 'react';
import { useExamStore } from '../store/examStore';

/**
 * Provide next/previous navigation helpers for the active exam.
 *
 * @returns Navigation state and callbacks.
 */
export function useExamNavigation() {
  const currentQuestionIndex = useExamStore((state) => state.currentQuestionIndex);
  const questionOrder = useExamStore((state) => state.questionOrder);
  const navigateTo = useExamStore((state) => state.navigateTo);

  return useMemo(() => ({
    currentQuestionIndex,
    totalQuestions: questionOrder.length,
    canGoPrevious: currentQuestionIndex > 0,
    canGoNext: currentQuestionIndex < questionOrder.length - 1,
    goPrevious: () => navigateTo(currentQuestionIndex - 1),
    goNext: () => navigateTo(currentQuestionIndex + 1),
  }), [currentQuestionIndex, navigateTo, questionOrder.length]);
}
