// ================================================================
// FILE: src/components/history/HistoryEmptyState.tsx
// PURPOSE: Empty state for history with no sessions or attempts.
// DEPENDENCIES: react, tanstack router, lucide-react, src/components/ui/*
// ================================================================

import { Link } from '@tanstack/react-router';
import { FileSearch } from 'lucide-react';
import { Button } from '../ui/Button';

export function HistoryEmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] text-center">
      <FileSearch className="h-12 w-12 text-[var(--text-tertiary)]" />
      <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">No exams taken yet</p>
      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">Upload a YAML file to run your first exam.</p>
      <Link className="mt-5" to="/upload">
        <Button type="button">Start Exam -&gt;</Button>
      </Link>
    </div>
  );
}
