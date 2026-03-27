// ================================================================
// FILE: src/routes/exam/results.tsx
// PURPOSE: Score dashboard after exam submission.
// DEPENDENCIES: tanstack router, src/components/results/*
// ================================================================

import { createRoute, redirect, Link } from '@tanstack/react-router';
import { CheckCircle2, CircleDashed, Clock3, Target, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ScoreDonut } from '../../components/results/ScoreDonut';
import { SectionBarChart } from '../../components/results/SectionBarChart';
import { DifficultyChart } from '../../components/results/DifficultyChart';
import { TagRadar } from '../../components/results/TagRadar';
import { ManualReviewCard } from '../../components/results/ManualReviewCard';
import { ExportDropdown } from '../../components/results/ExportDropdown';
import { rootRoute } from '../__root';
import { useExamStore } from '../../store/examStore';
import { formatTime } from '../../utils/formatTime';

function ResultsPage() {
  const examConfig = useExamStore((state) => state.examConfig);
  const imageMap = useExamStore((state) => state.imageMap);
  const answers = useExamStore((state) => state.answers);
  const results = useExamStore((state) => state.results);
  const sessionMode = useExamStore((state) => state.sessionMode);

  if (!examConfig || !results) {
    return null;
  }

  const answeredCount = results.questionResults.filter((item) => item.wasAnswered).length;
  const correctCount = results.questionResults.filter((item) => item.isCorrect === true).length;
  const wrongCount = results.questionResults.filter((item) => item.isCorrect === false).length;
  const skippedCount = results.questionResults.filter((item) => !item.wasAnswered).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const heroStats = [
    { icon: Clock3, label: 'Time Taken', value: formatTime(results.timeTakenSeconds) },
    { icon: Target, label: 'Accuracy', value: `${accuracy}%` },
    { icon: CheckCircle2, label: 'Answered', value: `${answeredCount}/${results.questionResults.length}` },
    { icon: CheckCircle2, label: 'Correct', value: String(correctCount) },
    { icon: XCircle, label: 'Wrong', value: String(wrongCount) },
    { icon: CircleDashed, label: 'Skipped', value: String(skippedCount) },
  ];

  const resultBadge = results.passed == null
    ? { label: 'No threshold', className: 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]' }
    : results.passed
      ? { label: 'Passed', className: 'border border-emerald-500/20 bg-[var(--success-subtle)] text-[var(--success)]' }
      : { label: 'Failed', className: 'border border-red-500/20 bg-[var(--danger-subtle)] text-[var(--danger)]' };

  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-6 pb-12 pt-6" id="results-dashboard">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Results</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.02em]">{examConfig.exam.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{sessionMode === 'practice' ? 'Practice mode' : 'Timed session'}</p>
        </div>
        <ExportDropdown answers={answers} config={examConfig} imageMap={imageMap} result={results} targetElementId="results-dashboard" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="surface-strong flex flex-col items-center justify-center gap-4 p-8 text-center">
          <ScoreDonut percentage={results.percentage} possible={results.totalPossibleScore} score={results.totalScore} />
          <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${resultBadge.className}`}>
            {resultBadge.label}
          </span>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {heroStats.map((stat) => (
            <Card className="surface-strong p-5" key={stat.label}>
              <stat.icon className="h-5 w-5 text-[var(--accent)]" />
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-medium">Section Breakdown</h2>
          <SectionBarChart data={results.sectionScores} />
        </Card>
        <Card>
          <h2 className="text-xl font-medium">Difficulty Breakdown</h2>
          <DifficultyChart results={results.questionResults} />
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-medium">Tag Performance</h2>
          <TagRadar results={results.questionResults} />
        </Card>
        <Card className="surface-strong border-amber-500/20 bg-[var(--warning-subtle)]">
          <h2 className="text-xl font-medium">Questions Requiring Manual Review</h2>
          <div className="mt-4">
            <ManualReviewCard answers={answers} results={results.questionResults} />
          </div>
        </Card>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/exam/review">
          <Card className="px-4 py-3 hover:border-[var(--border-hover)]">Review Answers</Card>
        </Link>
        <Link to="/history">
          <Card className="px-4 py-3 hover:border-[var(--border-hover)]">Open History</Card>
        </Link>
      </div>
    </div>
  );
}

export const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'exam/results',
  beforeLoad: () => {
    if (!useExamStore.getState().results) {
      throw redirect({ to: '/upload' });
    }
  },
  component: ResultsPage,
});
