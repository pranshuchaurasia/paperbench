// ================================================================
// FILE: src/components/exam/TypeAnswerInput.tsx
// PURPOSE: Free-text answer input.
// DEPENDENCIES: react
// ================================================================

/**
 * TypeAnswerInput renders the textarea for open-ended questions.
 */
export function TypeAnswerInput({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}) {
  const length = value.length;
  const nearingLimit = maxLength != null && length >= maxLength * 0.85;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-500/20 bg-[var(--warning-subtle)] px-4 py-3 text-sm text-[var(--warning)]">
        This question is reviewed manually and not auto-scored.
      </div>
      <textarea
        className="surface min-h-[160px] w-full rounded-2xl px-4 py-4 text-base outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-subtle)] disabled:cursor-default disabled:opacity-80"
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {maxLength ? (
        <p className={`text-right text-xs ${nearingLimit ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'}`}>
          {length} / {maxLength}
        </p>
      ) : null}
    </div>
  );
}
