// ================================================================
// FILE: src/components/exam/ExamHeader.tsx
// PURPOSE: Header for the live exam page.
// DEPENDENCIES: react, Timer
// ================================================================

import type { SessionMode } from '../../types';
import { Timer } from './Timer';

/**
 * ExamHeader renders section context, timer or practice badge, and progress.
 */
export function ExamHeader({
  sectionName,
  remainingSeconds,
  totalSeconds,
  currentQuestion,
  totalQuestions,
  sessionMode,
}: {
  sectionName: string;
  remainingSeconds: number;
  totalSeconds: number;
  currentQuestion: number;
  totalQuestions: number;
  sessionMode: SessionMode;
}) {
  const progressPercent = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="sticky top-4 z-30 surface-strong flex flex-wrap items-center justify-between gap-4 rounded-[20px] px-4 py-3 shadow-[var(--shadow-md)]">
      <div className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
        {sectionName}
      </div>
      {sessionMode === 'practice' ? (
        <div className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-4 py-2 text-sm font-medium uppercase tracking-[0.1em] text-[var(--accent)]">
          Practice Mode
        </div>
      ) : (
        <Timer seconds={remainingSeconds} totalSeconds={totalSeconds} />
      )}
      <div className="min-w-[180px] max-w-[220px] flex-1 text-right">
        <div className="text-sm text-[var(--text-secondary)]">{currentQuestion}/{totalQuestions}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-hover)]">
          <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: 'var(--accent-gradient)' }} />
        </div>
      </div>
    </div>
  );
}
