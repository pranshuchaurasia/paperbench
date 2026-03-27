// ================================================================
// FILE: src/components/history/ActiveSessionBanner.tsx
// PURPOSE: Highlight a resumable active exam session.
// DEPENDENCIES: react, src/components/ui/*
// ================================================================

import type { ExamSession } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatTime } from '../../utils/formatTime';

export function ActiveSessionBanner({ session, onResume }: { session: ExamSession; onResume: () => void }) {
  return (
    <Card className="border-amber-500/25 bg-[var(--warning-subtle)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--warning)]">In Progress</p>
          <p className="mt-2 text-lg font-medium text-[var(--text-primary)]">{session.examConfig.exam.title}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Started {session.examStartedAt ? new Date(session.examStartedAt).toLocaleString() : 'recently'} · {formatTime(session.timeRemainingSeconds)} remaining
          </p>
        </div>
        <Button onClick={onResume} type="button">Resume Exam -&gt;</Button>
      </div>
    </Card>
  );
}
