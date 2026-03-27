import type { DiagnosticMessage } from '../../types';
import { Button } from '../ui/Button';

export function EmptyFilterDiagnostic({
  diagnostic,
  onReset,
}: {
  diagnostic: DiagnosticMessage;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-red-500/25 bg-[var(--danger-subtle)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--danger)]">No Matching Questions</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">Your current filters do not match any questions.</h3>
      <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
        <p>{diagnostic.reason}</p>
        <p>{diagnostic.suggestion}</p>
      </div>
      <div className="mt-4 text-sm text-[var(--text-secondary)]">
        <p>Difficulty: {diagnostic.activeFilters.difficulties.join(', ')}</p>
        <p>Topics: {diagnostic.activeFilters.topics.join(', ')}</p>
        <p>Types: {diagnostic.activeFilters.types.join(', ')}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onReset} type="button" variant="ghost">Reset all filters</Button>
        <Button disabled type="button">Start Exam</Button>
      </div>
    </div>
  );
}
