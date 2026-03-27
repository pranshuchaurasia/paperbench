import { useShallow } from 'zustand/react/shallow';
import type { QuestionType } from '../../types';
import {
  selectFilterDiagnostic,
  selectFilteredQuestions,
  selectFilteredSections,
  selectFinalQuestionCount,
  useExamStore,
} from '../../store/examStore';
import { formatQuestionTypeLabel } from '../../utils/questionFilter';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyFilterDiagnostic } from './EmptyFilterDiagnostic';

export function ExamSummary({
  onReset,
  onStart,
}: {
  onReset: () => void;
  onStart: () => void;
}) {
  const sourceExamConfig = useExamStore((state) => state.sourceExamConfig ?? state.examConfig);
  const config = useExamStore((state) => state.config);
  const filtered = useExamStore(useShallow(selectFilteredQuestions));
  const finalCount = useExamStore(selectFinalQuestionCount);
  const sections = useExamStore(useShallow(selectFilteredSections));
  const diagnostic = useExamStore(useShallow(selectFilterDiagnostic));

  const poolCount = filtered.length;
  const isCustomCount = config.questionCountMode === 'custom';
  const poolPoints = filtered
    .filter((entry) => entry.question.type !== 'type_answer')
    .reduce((sum, entry) => sum + entry.question.points, 0);

  const difficultyCounts = {
    easy: filtered.filter((entry) => entry.question.difficulty === 'easy').length,
    medium: filtered.filter((entry) => entry.question.difficulty === 'medium').length,
    hard: filtered.filter((entry) => entry.question.difficulty === 'hard').length,
  };

  const typeCounts = {
    single_choice: filtered.filter((entry) => entry.question.type === 'single_choice').length,
    multiple_choice: filtered.filter((entry) => entry.question.type === 'multiple_choice').length,
    true_false: filtered.filter((entry) => entry.question.type === 'true_false').length,
    type_answer: filtered.filter((entry) => entry.question.type === 'type_answer').length,
  };

  const allManualReview = filtered.length > 0 && filtered.every((entry) => entry.question.type === 'type_answer');
  const yamlTimerLabel = sourceExamConfig?.settings.timer_mode === 'global'
    ? `${sourceExamConfig.settings.total_time_minutes ?? 0} min`
    : `${sourceExamConfig?.sections.flatMap((section) => section.questions)[0]?.time_limit_seconds ?? 60}s per question`;
  const timerText = config.sessionMode === 'practice'
    ? 'Practice (untimed)'
    : config.timeSource === 'yaml_default'
      ? yamlTimerLabel
      : config.timerType === 'global'
        ? `${config.customTotalMinutes} min`
        : `${config.customPerQuestionSeconds}s per question`;

  const sectionHeading = isCustomCount ? 'Sections in pool' : 'Sections included';
  const difficultyHeading = isCustomCount ? 'Pool difficulty mix' : 'Difficulty mix';
  const typeHeading = isCustomCount ? 'Pool question types' : 'Question types';
  const summaryLine = isCustomCount
    ? `${finalCount} random questions from a pool of ${poolCount} \u00B7 ${poolPoints} scorable points in pool \u00B7 ${timerText}`
    : `${poolCount} questions \u00B7 ${poolPoints} scorable points \u00B7 ${timerText}`;

  if (diagnostic) {
    return <EmptyFilterDiagnostic diagnostic={diagnostic} onReset={onReset} />;
  }

  return (
    <Card className="space-y-6 rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Your Session</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Configured exam summary</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{summaryLine}</p>
        </div>
        <Button disabled={filtered.length === 0} onClick={onStart} type="button">
          Start Exam
        </Button>
      </div>

      {allManualReview ? (
        <div className="rounded-2xl border border-amber-500/20 bg-[var(--warning-subtle)] px-4 py-3 text-sm text-[var(--warning)]">
          All selected questions are manually reviewed. Your score will be 0/0.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{sectionHeading}</h3>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            {sections.map((section) => (
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" key={section.name}>
                <span className="text-[var(--text-primary)]">{section.name}</span>
                <span>{`${section.questionCount} questions \u00B7 ${section.points} pts`}</span>
              </div>
            ))}
          </div>
          {isCustomCount ? (
            <p className="text-xs italic text-[var(--text-tertiary)]">{`${finalCount} questions will be randomly drawn from these sections.`}</p>
          ) : null}
        </div>

        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{difficultyHeading}</h3>
            <p className="mt-2">{`${difficultyCounts.easy} easy \u00B7 ${difficultyCounts.medium} medium \u00B7 ${difficultyCounts.hard} hard`}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{typeHeading}</h3>
            <p className="mt-2">
              {Object.entries(typeCounts)
                .filter(([, count]) => count > 0)
                .map(([type, count]) => `${count} ${formatQuestionTypeLabel(type as QuestionType).toLowerCase()}`)
                .join(' \u00B7 ')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
