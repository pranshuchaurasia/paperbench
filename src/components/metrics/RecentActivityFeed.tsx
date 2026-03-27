// ================================================================
// FILE: src/components/metrics/RecentActivityFeed.tsx
// PURPOSE: Recent-attempt timeline feed for the metrics page.
// DEPENDENCIES: tanstack router, src/components/ui/*
// ================================================================

import { Link } from '@tanstack/react-router';
import type { ExamHistoryEntry } from '../../types';
import { Card } from '../ui/Card';

export function RecentActivityFeed({ entries }: { entries: ExamHistoryEntry[] }) {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--accent)]">Recent Activity</p>
      <div className="mt-5 space-y-4">
        {entries.map((entry) => (
          <div className="grid grid-cols-[14px_1fr] gap-3" key={entry.id}>
            <div className="flex justify-center pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono text-[var(--text-tertiary)]">{new Date(entry.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span className="text-[var(--text-primary)]">{entry.examTitle}</span>
              <span className="font-mono text-[var(--text-primary)]">{entry.result.percentage}%</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.result.passed ? 'bg-[var(--success-subtle)] text-[var(--success)]' : entry.result.passed === false ? 'bg-[var(--danger-subtle)] text-[var(--danger)]' : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'}`}>
                {entry.result.passed == null ? 'No threshold' : entry.result.passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline" to="/history">
        View full history -&gt;
      </Link>
    </Card>
  );
}
