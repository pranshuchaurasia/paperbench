// ================================================================
// FILE: src/components/results/ManualReviewCard.tsx
// PURPOSE: Highlight open-ended answers that require manual review.
// DEPENDENCIES: react, src/types
// ================================================================

import type { QuestionResult, UserAnswer } from '../../types';
import { Card } from '../ui/Card';

/**
 * ManualReviewCard lists free-text answers for manual grading.
 */
export function ManualReviewCard({
  results,
  answers,
}: {
  results: QuestionResult[];
  answers: Record<string, UserAnswer>;
}) {
  const manualQuestions = results.filter((result) => result.pointsEarned == null);

  if (!manualQuestions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-secondary)]">
        No manual-review questions in this attempt.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {manualQuestions.map((question) => {
        const answer = answers[question.questionId];
        const text = answer?.type === 'type_answer' ? answer.text : 'No answer submitted.';

        return (
          <Card className="surface-strong" key={question.questionId}>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--warning)]">Manual review</p>
            <h3 className="mt-2 text-lg font-medium text-[var(--text-primary)]">{question.questionText}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
          </Card>
        );
      })}
    </div>
  );
}
