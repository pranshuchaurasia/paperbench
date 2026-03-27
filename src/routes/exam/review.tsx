// ================================================================
// FILE: src/routes/exam/review.tsx
// PURPOSE: Read-only answer review screen.
// DEPENDENCIES: tanstack router, src/components/*, src/store
// ================================================================

import { createRoute, redirect } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ExportDropdown } from '../../components/results/ExportDropdown';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ReviewQuestionCard } from '../../components/review/ReviewQuestionCard';
import { rootRoute } from '../__root';
import { useExamStore } from '../../store/examStore';

export function ReviewPage() {
  const examConfig = useExamStore((state) => state.examConfig);
  const imageMap = useExamStore((state) => state.imageMap);
  const answers = useExamStore((state) => state.answers);
  const results = useExamStore((state) => state.results);
  const questionOrder = useExamStore((state) => state.questionOrder);
  const [sortMode, setSortMode] = useState<'exam' | 'section'>('exam');

  const resultMap = useMemo(
    () => Object.fromEntries((results?.questionResults ?? []).map((item) => [item.questionId, item])),
    [results],
  );

  const sortedQuestions = useMemo(() => {
    if (!examConfig) {
      return [];
    }

    const allQuestions: Array<{
      question: (typeof examConfig.sections)[number]['questions'][number];
      sectionName: string;
      sectionIndex: number;
      questionIndexInSection: number;
    }> = [];

    examConfig.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndexInSection) => {
        allQuestions.push({
          question,
          sectionName: section.name,
          sectionIndex,
          questionIndexInSection,
        });
      });
    });

    const sessionQuestionIds = new Set(questionOrder);
    const sessionQuestions = allQuestions.filter((item) => sessionQuestionIds.has(item.question.id));

    if (sortMode === 'exam') {
      return [...sessionQuestions].sort((left, right) => questionOrder.indexOf(left.question.id) - questionOrder.indexOf(right.question.id));
    }

    return [...sessionQuestions].sort((left, right) => {
      if (left.sectionIndex !== right.sectionIndex) {
        return left.sectionIndex - right.sectionIndex;
      }
      return left.questionIndexInSection - right.questionIndexInSection;
    });
  }, [examConfig, questionOrder, sortMode]);

  if (!examConfig || !results) {
    return null;
  }

  const showCorrectness = examConfig.settings.show_correct_after_submit ?? true;

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-6 pb-12 pt-6" id="review-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Review</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.02em]">{examConfig.exam.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="surface flex gap-1 rounded-xl p-1">
            <Button onClick={() => setSortMode('exam')} type="button" variant={sortMode === 'exam' ? 'primary' : 'ghost'}>Exam Order</Button>
            <Button onClick={() => setSortMode('section')} type="button" variant={sortMode === 'section' ? 'primary' : 'ghost'}>Section Order</Button>
          </div>
          <ExportDropdown answers={answers} config={examConfig} imageMap={imageMap} result={results} targetElementId="review-page" />
        </div>
      </div>

      {!showCorrectness ? (
        <Card className="surface-strong p-4 text-sm leading-7 text-[var(--text-secondary)]">
          Correct answers and explanations are hidden for this exam after submission.
        </Card>
      ) : null}

      <div className="space-y-6">
        {sortedQuestions.map((item, index) => {
          const questionResult = resultMap[item.question.id] ?? null;
          const previous = sortedQuestions[index - 1];
          const shouldShowSectionHeader = index === 0 || previous?.sectionName !== item.sectionName;

          return (
            <div className="space-y-3" key={item.question.id}>
              {shouldShowSectionHeader ? (
                <div className="flex items-center justify-between px-1 py-2" data-testid="review-section-header">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)]">{item.sectionName}</p>
                    <p className="mt-1 text-sm text-[var(--text-tertiary)]">{`Question ${index + 1}`}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{item.question.type.replace('_', ' ')}</span>
                </div>
              ) : null}

              <ReviewQuestionCard
                displayIndex={index + 1}
                imageMap={imageMap}
                question={item.question}
                questionResult={questionResult}
                showCorrectness={showCorrectness}
                userAnswer={questionResult?.userAnswer ?? null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'exam/review',
  beforeLoad: () => {
    if (!useExamStore.getState().results) {
      throw redirect({ to: '/' });
    }
  },
  component: ReviewPage,
});


