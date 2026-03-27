// ================================================================
// FILE: src/components/history/AttemptCard.tsx
// PURPOSE: Card-row presentation for a single attempt.
// DEPENDENCIES: react, src/components/ui/*, src/components/results/*
// ================================================================

import type { ExamHistoryEntry } from '../../types';
import { Button } from '../ui/Button';
import { ExportDropdown } from '../results/ExportDropdown';
import { formatTime } from '../../utils/formatTime';

export function AttemptCard({
  entry,
  onView,
  onDelete,
}: {
  entry: ExamHistoryEntry;
  onView: () => void;
  onDelete: () => void;
}) {
  const answeredCount = entry.result.questionResults.filter((item) => item.wasAnswered).length;
  const correctCount = entry.result.questionResults.filter((item) => item.isCorrect === true).length;
  const thresholdLabel = entry.result.passed == null ? 'No threshold' : entry.result.passed ? 'Passed' : 'Failed';
  const badgeClassName = entry.result.passed == null
    ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
    : entry.result.passed
      ? 'bg-[var(--success-subtle)] text-[var(--success)]'
      : 'bg-[var(--danger-subtle)] text-[var(--danger)]';

  return (
    <div className="surface flex flex-col gap-4 rounded-2xl px-5 py-4 transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="truncate text-base font-medium text-[var(--text-primary)]">{entry.examTitle}</p>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{new Date(entry.takenAt).toLocaleString()}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span className="font-mono font-medium text-[var(--text-primary)]">{entry.result.percentage}%</span>
          <span>·</span>
          <span>{correctCount}/{answeredCount || entry.result.questionResults.length} correct</span>
          <span>·</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassName}`}>{thresholdLabel}</span>
          <span>·</span>
          <span>{formatTime(entry.result.timeTakenSeconds)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button onClick={onView} type="button" variant="subtle">View Results</Button>
        <ExportDropdown
          answers={entry.answers}
          config={entry.config}
          imageMap={entry.imageMap}
          result={entry.result}
          targetElementId={`history-export-${entry.id}`}
        />
        <Button aria-label="Delete attempt" onClick={onDelete} type="button" variant="ghost">??</Button>
      </div>
    </div>
  );
}
