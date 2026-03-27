// ================================================================
// FILE: src/components/exam/FlagButton.tsx
// PURPOSE: Toggle question flags.
// DEPENDENCIES: lucide-react
// ================================================================

import { Flag } from 'lucide-react';

/**
 * FlagButton toggles a question flag state.
 */
export function FlagButton({ flagged, onClick, disabled = false }: { flagged: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm transition ${flagged ? 'border-amber-500/30 bg-[var(--warning-subtle)] text-[var(--warning)]' : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'} disabled:cursor-default disabled:opacity-70`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Flag className="h-4 w-4" />
      {flagged ? 'Flagged' : 'Flag for Review'}
    </button>
  );
}
