// ================================================================
// FILE: src/routes/metrics.tsx
// PURPOSE: Aggregate analytics dashboard for completed attempts.
// DEPENDENCIES: tanstack router, react, lucide-react, src/components/metrics/*
// ================================================================

import { createRoute, Link } from '@tanstack/react-router';
import { BarChart3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ExamHistoryEntry } from '../types';
import { DifficultyBreakdownChart } from '../components/metrics/DifficultyBreakdownChart';
import { PerformanceLineChart } from '../components/metrics/PerformanceLineChart';
import { RecentActivityFeed } from '../components/metrics/RecentActivityFeed';
import { ScoreByExamBarChart } from '../components/metrics/ScoreByExamBarChart';
import { StatsGrid } from '../components/metrics/StatsGrid';
import { Button } from '../components/ui/Button';
import { rootRoute } from './__root';
import { useService } from '../services/ServiceProvider';

function formatTotalTime(totalSeconds: number) {
  if (totalSeconds >= 3600) {
    return `${(totalSeconds / 3600).toFixed(1)} hrs`;
  }
  return `${Math.round(totalSeconds / 60)} min`;
}

function MetricsPage() {
  const storage = useService().storage;
  const [entries, setEntries] = useState<ExamHistoryEntry[]>([]);

  useEffect(() => {
    storage.loadHistory().then(setEntries).catch(() => undefined);
  }, [storage]);

  const metrics = useMemo(() => {
    const totalAttempts = entries.length;
    const totalScore = entries.reduce((sum, entry) => sum + entry.result.percentage, 0);
    const averageScore = totalAttempts > 0 ? Number((totalScore / totalAttempts).toFixed(1)) : 0;
    const thresholdAttempts = entries.filter((entry) => entry.result.passed != null);
    const passRate = thresholdAttempts.length > 0
      ? Number(((thresholdAttempts.filter((entry) => entry.result.passed).length / thresholdAttempts.length) * 100).toFixed(1))
      : null;
    const totalTimeSpent = entries.reduce((sum, entry) => sum + entry.result.timeTakenSeconds, 0);

    const latest = entries[0];
    const previous = entries[1];
    const averageDelta = latest && previous
      ? { value: `${Math.abs(Number((latest.result.percentage - previous.result.percentage).toFixed(1)))}% vs last attempt`, positive: latest.result.percentage >= previous.result.percentage }
      : undefined;

    const trendData = [...entries].reverse().map((entry) => ({
      label: new Date(entry.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      percentage: entry.result.percentage,
      title: entry.examTitle,
      date: new Date(entry.takenAt).toLocaleString(),
    }));

    const examMap = entries.reduce<Record<string, { examTitle: string; total: number; attempts: number; best: number }>>((accumulator, entry) => {
      const current = accumulator[entry.examTitle] ?? { examTitle: entry.examTitle, total: 0, attempts: 0, best: 0 };
      current.total += entry.result.percentage;
      current.attempts += 1;
      current.best = Math.max(current.best, entry.result.percentage);
      accumulator[entry.examTitle] = current;
      return accumulator;
    }, {});

    const byExam = Object.values(examMap).map((item) => ({
      examTitle: item.examTitle,
      attempts: item.attempts,
      averagePercentage: Number((item.total / item.attempts).toFixed(1)),
      best: item.best,
    }));

    const difficultySource = entries.flatMap((entry) => entry.result.questionResults.filter((item) => item.pointsPossible != null));
    const difficultyBreakdown = ['easy', 'medium', 'hard'].map((difficulty) => {
      const items = difficultySource.filter((item) => item.difficulty === difficulty);
      const earned = items.reduce((sum, item) => sum + (item.pointsEarned ?? 0), 0);
      const possible = items.reduce((sum, item) => sum + (item.pointsPossible ?? 0), 0);
      return {
        difficulty: difficulty[0].toUpperCase() + difficulty.slice(1),
        percentage: possible > 0 ? Number(((earned / possible) * 100).toFixed(1)) : 0,
        fill: difficulty === 'easy' ? '#22c55e' : difficulty === 'medium' ? '#eab308' : '#ef4444',
      };
    }).filter((item) => item.percentage > 0 || difficultySource.some((result) => result.difficulty.toLowerCase() === item.difficulty.toLowerCase()));

    return {
      stats: [
        { label: 'Total Attempts', value: String(totalAttempts), delta: totalAttempts > 1 ? { value: '+1 from previous', positive: true } : undefined },
        { label: 'Average Score', value: totalAttempts ? `${averageScore}%` : '—', delta: averageDelta },
        { label: 'Pass Rate', value: passRate == null ? '—' : `${passRate}%`, tooltip: passRate == null ? 'No exams had a pass threshold set.' : undefined },
        { label: 'Total Time Spent', value: totalAttempts ? formatTotalTime(totalTimeSpent) : '—' },
      ],
      trendData,
      byExam,
      difficultyBreakdown,
      recentEntries: entries.slice(0, 10),
    };
  }, [entries]);

  if (!entries.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] flex-col items-center justify-center text-center">
        <BarChart3 className="h-12 w-12 text-[var(--text-tertiary)]" />
        <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">No data yet</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Complete your first exam to start tracking performance.</p>
        <Link className="mt-5" to="/upload">
          <Button type="button">Start Exam -&gt;</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-12 pt-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Metrics</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Performance overview</h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">Track your progress across all exam attempts.</p>
      </div>

      <StatsGrid stats={metrics.stats} />

      <section className="grid gap-6 xl:grid-cols-2">
        <PerformanceLineChart data={metrics.trendData} />
        <ScoreByExamBarChart data={metrics.byExam} />
      </section>

      {metrics.difficultyBreakdown.length ? <DifficultyBreakdownChart data={metrics.difficultyBreakdown} /> : null}

      <RecentActivityFeed entries={metrics.recentEntries} />
    </div>
  );
}

export const metricsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'metrics',
  component: MetricsPage,
});
