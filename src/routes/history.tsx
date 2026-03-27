// ================================================================
// FILE: src/routes/history.tsx
// PURPOSE: Past-attempt list page with resume and backup actions.
// DEPENDENCIES: tanstack router, react, src/components/history/*
// ================================================================

import { createRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import type { ExamHistoryEntry, ExamSession } from '../types';
import { AttemptCard } from '../components/history/AttemptCard';
import { ActiveSessionBanner } from '../components/history/ActiveSessionBanner';
import { BackupDropdown } from '../components/history/BackupDropdown';
import { HistoryControls, type HistoryFilterValue, type HistorySortValue } from '../components/history/HistoryControls';
import { HistoryEmptyState } from '../components/history/HistoryEmptyState';
import { Button } from '../components/ui/Button';
import { rootRoute } from './__root';
import { useService } from '../services/ServiceProvider';
import { useExamStore } from '../store/examStore';
import { formatTime } from '../utils/formatTime';

function HistoryExportSurface({ entry }: { entry: ExamHistoryEntry }) {
  return (
    <div className="pointer-events-none fixed left-[-10000px] top-0 w-[960px] bg-[#09090b] p-8 text-white" id={`history-export-${entry.id}`}>
      <div className="space-y-6 rounded-[28px] border border-white/10 bg-[#0f0f12] p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-violet-300">Historical Attempt</p>
          <h2 className="mt-3 text-4xl font-semibold">{entry.examTitle}</h2>
          <p className="mt-3 text-sm text-slate-300">Taken on {new Date(entry.takenAt).toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Score</p><p className="mt-2 text-3xl font-semibold">{entry.result.totalScore}/{entry.result.totalPossibleScore}</p></div>
          <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Percent</p><p className="mt-2 text-3xl font-semibold">{entry.result.percentage}%</p></div>
          <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Time</p><p className="mt-2 text-3xl font-semibold">{formatTime(entry.result.timeTakenSeconds)}</p></div>
          <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p><p className="mt-2 text-3xl font-semibold">{entry.result.passed == null ? 'No threshold' : entry.result.passed ? 'Passed' : 'Failed'}</p></div>
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const navigate = useNavigate();
  const storage = useService().storage;
  const loadHistoryEntry = useExamStore((state) => state.loadHistoryEntry);
  const hydrateSession = useExamStore((state) => state.hydrateSession);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [entries, setEntries] = useState<ExamHistoryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<HistorySortValue>('date_desc');
  const [filter, setFilter] = useState<HistoryFilterValue>('all');
  const [deleteTarget, setDeleteTarget] = useState<ExamHistoryEntry | null>(null);

  useEffect(() => {
    storage.loadExamSession().then(setActiveSession).catch(() => undefined);
    storage.loadHistory().then(setEntries).catch(() => undefined);
  }, [storage]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let next = entries.filter((entry) => entry.examTitle.toLowerCase().includes(normalizedSearch));

    if (filter === 'passed') {
      next = next.filter((entry) => entry.result.passed === true);
    }
    if (filter === 'failed') {
      next = next.filter((entry) => entry.result.passed === false);
    }
    if (filter === 'no_threshold') {
      next = next.filter((entry) => entry.result.passed == null);
    }

    next = [...next].sort((a, b) => {
      switch (sort) {
        case 'date_asc':
          return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime();
        case 'score_desc':
          return b.result.percentage - a.result.percentage;
        case 'score_asc':
          return a.result.percentage - b.result.percentage;
        case 'title_asc':
          return a.examTitle.localeCompare(b.examTitle);
        case 'date_desc':
        default:
          return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
      }
    });

    return next;
  }, [entries, filter, search, sort]);

  const resumeSession = () => {
    if (!activeSession) {
      return;
    }
    hydrateSession(activeSession);
    navigate({ to: activeSession.status === 'in_progress' ? '/exam/live' : '/exam/setup' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await storage.deleteHistoryEntry(deleteTarget.id);
    setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-6 pb-12 pt-6" id="history-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">History</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Past exam attempts</h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">Find, review, and manage your completed exams.</p>
        </div>
        <BackupDropdown disabled={!entries.length} />
      </div>

      <HistoryControls
        filter={filter}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onSortChange={setSort}
        search={search}
        sort={sort}
      />

      {activeSession ? <ActiveSessionBanner onResume={resumeSession} session={activeSession} /> : null}

      {filteredEntries.length ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <AttemptCard
              entry={entry}
              key={entry.id}
              onDelete={() => setDeleteTarget(entry)}
              onView={() => {
                loadHistoryEntry(entry);
                navigate({ to: '/exam/results' });
              }}
            />
          ))}
        </div>
      ) : !entries.length && !activeSession ? (
        <HistoryEmptyState />
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-10 text-center text-sm text-[var(--text-secondary)]">
          No attempts match the current search or filter.
        </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="surface-strong w-full max-w-md rounded-[24px] p-6">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Delete this attempt?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setDeleteTarget(null)} type="button" variant="ghost">Cancel</Button>
              <Button onClick={() => void confirmDelete()} type="button" variant="danger">Delete</Button>
            </div>
          </div>
        </div>
      ) : null}

      {entries.map((entry) => <HistoryExportSurface entry={entry} key={`export-${entry.id}`} />)}
    </div>
  );
}

export const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'history',
  component: HistoryPage,
});
