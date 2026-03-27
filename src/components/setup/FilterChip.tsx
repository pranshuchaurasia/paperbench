import { Check } from 'lucide-react';
import clsx from 'clsx';

export function FilterChip({
  label,
  count,
  selected,
  onClick,
  disabled = false,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition duration-150',
        disabled
          ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-tertiary)] opacity-60'
          : selected
            ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]'
            : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]',
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {selected ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : null}
      <span>{label} ({count})</span>
    </button>
  );
}
