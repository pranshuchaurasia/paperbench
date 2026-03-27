import { CheckCircle2, Circle, XCircle } from 'lucide-react';

export function ReviewOptionCard({
  label,
  isUserSelected,
  isCorrectOption,
  keyboardHint,
}: {
  label: string;
  isUserSelected: boolean;
  isCorrectOption: boolean;
  keyboardHint?: string;
}) {
  let containerClass = 'border border-[var(--border)] bg-[var(--bg-surface)] opacity-60';
  let icon = <Circle className="h-5 w-5 text-[var(--text-tertiary)]" />;
  let helperLabel: string | null = null;
  let reviewState = 'neutral';

  if (isUserSelected && isCorrectOption) {
    containerClass = 'border-2 border-emerald-500/40 bg-[var(--success-subtle)]';
    icon = <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />;
    reviewState = 'selected-correct';
  } else if (isUserSelected && !isCorrectOption) {
    containerClass = 'border-2 border-red-500/40 bg-[var(--danger-subtle)]';
    icon = <XCircle className="h-5 w-5 text-[var(--danger)]" />;
    reviewState = 'selected-wrong';
  } else if (!isUserSelected && isCorrectOption) {
    containerClass = 'border-2 border-dashed border-emerald-500/35 bg-emerald-500/5';
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-400/80" />;
    helperLabel = 'Correct answer';
    reviewState = 'correct-unselected';
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${containerClass}`} data-testid={`review-option-${reviewState}`}>
      {icon}
      <span className="flex-1 text-sm text-[var(--text-primary)]">{label}</span>
      {helperLabel ? <span className="text-xs font-medium text-[var(--success)]">&larr; {helperLabel}</span> : null}
      {keyboardHint ? <span className="w-5 text-center font-mono text-xs text-[var(--text-tertiary)]">{keyboardHint}</span> : null}
    </div>
  );
}
