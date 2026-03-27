// ================================================================
// FILE: src/components/exam/OptionCard.tsx
// PURPOSE: Clickable option surface for choice-based questions.
// DEPENDENCIES: react, clsx, lucide-react
// ================================================================

import clsx from 'clsx';
import { Check } from 'lucide-react';

type OptionTone = 'default' | 'correct' | 'incorrect';
type OptionMarker = 'radio' | 'checkbox' | 'tile';

/**
 * OptionCard renders one selectable answer option.
 */
export function OptionCard({
  label,
  selected,
  onClick,
  disabled = false,
  tone = 'default',
  shortcut,
  marker = 'radio',
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  tone?: OptionTone;
  shortcut?: string;
  marker?: OptionMarker;
}) {
  const borderClassName = tone === 'correct'
    ? 'border-emerald-500/35 bg-emerald-500/12'
    : tone === 'incorrect'
      ? 'border-red-500/35 bg-red-500/12'
      : selected
        ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)]'
        : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]';

  const indicatorClassName = tone === 'correct'
    ? 'border-emerald-400 bg-emerald-400 text-slate-950'
    : tone === 'incorrect'
      ? 'border-red-400 bg-red-400 text-white'
      : selected
        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
        : 'border-[var(--text-tertiary)] text-transparent';

  return (
    <button
      aria-disabled={disabled}
      className={clsx(
        'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition duration-150 ease-[var(--ease-out)]',
        marker === 'tile' && 'min-h-24 justify-center text-center text-lg font-medium',
        borderClassName,
        disabled && 'cursor-default',
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        {marker !== 'tile' ? (
          <span className={clsx(
            'flex h-[18px] w-[18px] items-center justify-center border-2 text-[10px]',
            marker === 'radio' ? 'rounded-full' : 'rounded-[4px]',
            indicatorClassName,
          )}>
            {(selected || tone !== 'default') ? <Check className="h-3 w-3" /> : null}
          </span>
        ) : null}
        <span className="text-[var(--text-primary)]">{label}</span>
      </div>
      {shortcut ? <span className="rounded-md bg-black/20 px-2 py-1 text-xs text-[var(--text-tertiary)]">{shortcut}</span> : null}
    </button>
  );
}
