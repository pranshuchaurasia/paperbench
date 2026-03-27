import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { CodeBlock } from '../exam/CodeBlock';
import { QuestionImage } from '../exam/QuestionImage';
import { ReviewOptionCard } from './ReviewOptionCard';
import type { Question, QuestionResult, UserAnswer } from '../../types';
import { isAnswerFilled } from '../../utils/answers';

function getDifficultyClassName(level: Question['difficulty']) {
  if (level === 'easy') {
    return 'bg-[var(--success-subtle)] text-[var(--success)] border-emerald-500/20';
  }
  if (level === 'medium') {
    return 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-500/20';
  }
  return 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-500/20';
}

function getStatusBadge(status: QuestionResult['status']) {
  if (status === 'correct') {
    return { label: 'CORRECT', className: 'bg-[var(--success-subtle)] text-[var(--success)] border-emerald-500/20' };
  }
  if (status === 'incorrect') {
    return { label: 'INCORRECT', className: 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-500/20' };
  }
  if (status === 'manual_review') {
    return { label: 'MANUAL REVIEW', className: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-500/20' };
  }
  return { label: 'SKIPPED', className: 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border-[var(--border)]' };
}

function formatCorrectAnswer(question: Question): string {
  switch (question.type) {
    case 'single_choice': {
      const option = question.options.find((item) => item.id === question.correct_answer);
      return option ? option.text : question.correct_answer;
    }
    case 'multiple_choice':
      return question.correct_answers
        .map((id) => question.options.find((item) => item.id === id)?.text ?? id)
        .join(', ');
    case 'true_false':
      return question.correct_answer === 'true' ? 'True' : 'False';
    case 'type_answer':
      return question.reference_answer ?? 'No reference answer provided.';
    default:
      return '';
  }
}

function renderChoiceOptions(question: Question, userAnswer: UserAnswer | null) {
  if (question.type !== 'single_choice' && question.type !== 'multiple_choice' && question.type !== 'true_false') {
    return null;
  }

  const selectedIds = new Set<string>();
  if (userAnswer?.type === 'single_choice') {
    selectedIds.add(userAnswer.selectedOptionId);
  }
  if (userAnswer?.type === 'multiple_choice') {
    userAnswer.selectedOptionIds.forEach((id) => selectedIds.add(id));
  }
  if (userAnswer?.type === 'true_false') {
    selectedIds.add(userAnswer.selectedValue);
  }

  const correctIds = new Set<string>();
  if (question.type === 'single_choice') {
    correctIds.add(question.correct_answer);
  } else if (question.type === 'multiple_choice') {
    question.correct_answers.forEach((id) => correctIds.add(id));
  } else {
    correctIds.add(question.correct_answer);
  }

  const options = question.type === 'true_false'
    ? [
        { id: 'true', text: 'True', keyboardHint: '1' },
        { id: 'false', text: 'False', keyboardHint: '2' },
      ]
    : question.options.map((option, index) => ({
        id: option.id,
        text: option.text,
        keyboardHint: String.fromCharCode(65 + index),
      }));

  return (
    <div className="my-4 space-y-2">
      {options.map((option) => (
        <ReviewOptionCard
          isCorrectOption={correctIds.has(option.id)}
          isUserSelected={selectedIds.has(option.id)}
          keyboardHint={option.keyboardHint}
          key={option.id}
          label={option.text}
        />
      ))}
    </div>
  );
}

function renderTypeAnswer(question: Question, userAnswer: UserAnswer | null, showCorrectness: boolean) {
  if (question.type !== 'type_answer') {
    return null;
  }

  const userText = userAnswer?.type === 'type_answer' ? userAnswer.text : '';
  const hasAnswer = userText.trim().length > 0;

  return (
    <div className="my-4 grid gap-4 lg:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Your answer</h4>
        {hasAnswer ? (
          <div className="surface-strong min-h-[160px] rounded-2xl p-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">{userText}</div>
        ) : (
          <div className="min-h-[160px] rounded-2xl border-2 border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-tertiary)]">
            No answer provided
          </div>
        )}
      </div>
      {showCorrectness ? (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Reference answer</h4>
          <div className="min-h-[160px] rounded-r-2xl border-l-[3px] border-[var(--accent)] bg-[var(--accent-subtle)] px-4 py-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
            {question.reference_answer ?? 'No reference answer provided.'}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReviewQuestionCard({
  displayIndex,
  imageMap,
  question,
  questionResult,
  showCorrectness,
  userAnswer,
}: {
  displayIndex: number;
  imageMap: Record<string, string>;
  question: Question;
  questionResult: QuestionResult | null;
  showCorrectness: boolean;
  userAnswer: UserAnswer | null;
}) {
  const status = question.type === 'type_answer' && isAnswerFilled(userAnswer)
    ? 'manual_review'
    : questionResult?.status ?? 'unanswered';
  const statusBadge = getStatusBadge(status);

  const renderImage = (position: 'below_question' | 'below_code' | 'above_options') => {
    const image = question.image;
    if (!image) {
      return null;
    }

    const shouldRender = image.position === position || (!image.position && position === 'below_question');
    return shouldRender ? <QuestionImage image={image} imageMap={imageMap} /> : null;
  };

  return (
    <Card className="space-y-6 rounded-[24px] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>{`Question ${displayIndex}`}</span>
          <Badge className={getDifficultyClassName(question.difficulty)}>{question.difficulty}</Badge>
          <Badge>{`${question.points} pts`}</Badge>
          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium leading-8 text-[var(--text-primary)] sm:text-[1.35rem]">{question.question}</h2>
        {question.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        ) : null}
      </div>

      {renderImage('below_question')}
      {question.code_snippet ? <CodeBlock code={question.code_snippet.code} language={question.code_snippet.language} /> : null}
      {renderImage('below_code')}
      {renderImage('above_options')}

      {question.type === 'type_answer' ? renderTypeAnswer(question, userAnswer, showCorrectness) : null}

      {question.type !== 'type_answer' ? (
        status === 'unanswered' ? (
          <div className="my-4 rounded-2xl border-2 border-dashed border-[var(--border)] p-4 text-center">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Not answered - no option was selected</p>
            {showCorrectness ? <p className="mt-2 text-sm text-[var(--success)]">{`Correct answer: ${formatCorrectAnswer(question)}`}</p> : null}
          </div>
        ) : renderChoiceOptions(question, userAnswer)
      ) : null}

      {showCorrectness && question.explanation ? (
        <div className="rounded-xl border-l-[3px] border-[var(--accent)] bg-[var(--bg-elevated)] px-4 py-4 text-sm leading-7 text-[var(--text-secondary)]">
          {question.explanation}
        </div>
      ) : null}
    </Card>
  );
}
