// ================================================================
// FILE: src/components/exam/Palette.tsx
// PURPOSE: Question palette for navigation and status visibility.
// DEPENDENCIES: react
// ================================================================

interface PaletteProps {
  questionOrder: string[];
  answers: Record<string, unknown>;
  visitedQuestions: string[];
  flaggedQuestions: string[];
  currentQuestionId?: string;
  onSelect: (index: number) => void;
  isDisabled?: (index: number, questionId: string) => boolean;
}

/**
 * Palette renders the exam navigation grid.
 */
export function Palette({
  questionOrder,
  answers,
  visitedQuestions,
  flaggedQuestions,
  currentQuestionId,
  onSelect,
  isDisabled,
}: PaletteProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {questionOrder.map((questionId, index) => {
          const answered = questionId in answers;
          const visited = visitedQuestions.includes(questionId);
          const flagged = flaggedQuestions.includes(questionId);
          const current = currentQuestionId === questionId;
          const disabled = isDisabled?.(index, questionId) ?? false;
          const className = current
            ? 'border-[var(--accent)] text-[var(--text-primary)] ring-2 ring-[var(--accent-border)]'
            : flagged
              ? 'border-amber-500/30 bg-[var(--warning-subtle)] text-[var(--warning)]'
              : answered
                ? 'border-emerald-500/30 bg-[var(--success-subtle)] text-[var(--success)]'
                : visited
                  ? 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  : 'border-[var(--text-tertiary)]/40 text-[var(--text-tertiary)]';

          return (
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition ${className} disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={disabled}
              key={questionId}
              onClick={() => onSelect(index)}
              type="button"
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-[var(--text-tertiary)]/40" />Not visited</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--bg-elevated)]" />Visited</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Answered</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Flagged</div>
      </div>
    </div>
  );
}
