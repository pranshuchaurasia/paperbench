// ================================================================
// FILE: src/components/results/ScoreDonut.tsx
// PURPOSE: Primary score summary visual.
// DEPENDENCIES: react, ProgressRing
// ================================================================

import { ProgressRing } from '../ui/ProgressRing';

/**
 * ScoreDonut renders the top-level percentage widget.
 */
export function ScoreDonut({ percentage, score, possible }: { percentage: number; score: number; possible: number }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProgressRing value={percentage} />
      <div>
        <p className="text-3xl font-semibold text-[var(--text-primary)]">{score}/{possible}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Auto-scored points</p>
      </div>
    </div>
  );
}
