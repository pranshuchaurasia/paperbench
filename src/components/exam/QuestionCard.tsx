// ================================================================
// FILE: src/components/exam/QuestionCard.tsx
// PURPOSE: Renders one exam question with answer input.
// DEPENDENCIES: src/components/exam/*, src/components/ui/*, src/types
// ================================================================

import type { Question, QuestionResult, UserAnswer } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { CodeBlock } from './CodeBlock';
import { FlagButton } from './FlagButton';
import { OptionCard } from './OptionCard';
import { QuestionImage } from './QuestionImage';
import { TypeAnswerInput } from './TypeAnswerInput';

function getDifficultyClassName(level: Question['difficulty']) {
  if (level === 'easy') {
    return 'bg-[var(--success-subtle)] text-[var(--success)] border-emerald-500/20';
  }
  if (level === 'medium') {
    return 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-500/20';
  }
  return 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-500/20';
}

function getOptionTone(
  question: Question,
  answer: UserAnswer | undefined,
  optionId: string,
  readOnly: boolean,
  showCorrectness: boolean,
) {
  if (!readOnly || !showCorrectness) {
    return 'default' as const;
  }

  if (question.type === 'single_choice') {
    if (optionId === question.correct_answer) {
      return 'correct' as const;
    }
    if (answer?.type === 'single_choice' && answer.selectedOptionId === optionId) {
      return 'incorrect' as const;
    }
  }

  if (question.type === 'multiple_choice') {
    if (question.correct_answers.includes(optionId)) {
      return 'correct' as const;
    }
    if (answer?.type === 'multiple_choice' && answer.selectedOptionIds.includes(optionId)) {
      return 'incorrect' as const;
    }
  }

  if (question.type === 'true_false') {
    if (optionId === question.correct_answer) {
      return 'correct' as const;
    }
    if (answer?.type === 'true_false' && answer.selectedValue === optionId) {
      return 'incorrect' as const;
    }
  }

  return 'default' as const;
}

/**
 * QuestionCard renders one exam question and its answer controls.
 */
export function QuestionCard({
  question,
  answer,
  imageMap,
  flagged,
  onAnswer,
  onFlag,
  readOnly = false,
  reviewResult,
  showCorrectness = true,
  positionLabel,
}: {
  question: Question;
  answer?: UserAnswer;
  imageMap: Record<string, string>;
  flagged: boolean;
  onAnswer: (answer: UserAnswer) => void;
  onFlag: () => void;
  readOnly?: boolean;
  reviewResult?: QuestionResult;
  showCorrectness?: boolean;
  positionLabel?: string;
}) {
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
          {positionLabel ? <span>{positionLabel}</span> : null}
          <Badge className={getDifficultyClassName(question.difficulty)}>{question.difficulty}</Badge>
          <Badge>{question.points} pts</Badge>
          {showCorrectness && reviewResult?.isCorrect != null ? (
            <Badge className={reviewResult.isCorrect ? 'border-emerald-500/20 bg-[var(--success-subtle)] text-[var(--success)]' : 'border-red-500/20 bg-[var(--danger-subtle)] text-[var(--danger)]'}>
              {reviewResult.isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          ) : null}
        </div>
        <FlagButton disabled={readOnly} flagged={flagged} onClick={onFlag} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium leading-8 text-[var(--text-primary)] sm:text-[1.35rem]">{question.question}</h2>
        {question.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        ) : null}
      </div>

      {renderImage('below_question')}
      {question.code_snippet ? <CodeBlock code={question.code_snippet.code} language={question.code_snippet.language} /> : null}
      {renderImage('below_code')}
      {renderImage('above_options')}

      {question.type === 'single_choice' ? (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <OptionCard
              disabled={readOnly}
              key={option.id}
              label={option.text}
              marker="radio"
              onClick={() => onAnswer({ type: 'single_choice', selectedOptionId: option.id })}
              selected={answer?.type === 'single_choice' && answer.selectedOptionId === option.id}
              shortcut={String.fromCharCode(65 + index)}
              tone={getOptionTone(question, answer, option.id, readOnly, showCorrectness)}
            />
          ))}
        </div>
      ) : null}

      {question.type === 'multiple_choice' ? (
        <div className="space-y-3">
          <p className="text-sm italic text-[var(--text-tertiary)]">Select all that apply.</p>
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const selected = answer?.type === 'multiple_choice' && answer.selectedOptionIds.includes(option.id);
              return (
                <OptionCard
                  disabled={readOnly}
                  key={option.id}
                  label={option.text}
                  marker="checkbox"
                  onClick={() => {
                    const selectedIds = answer?.type === 'multiple_choice' ? answer.selectedOptionIds : [];
                    onAnswer({
                      type: 'multiple_choice',
                      selectedOptionIds: selected
                        ? selectedIds.filter((id) => id !== option.id)
                        : [...selectedIds, option.id],
                    });
                  }}
                  selected={selected}
                  shortcut={String.fromCharCode(65 + index)}
                  tone={getOptionTone(question, answer, option.id, readOnly, showCorrectness)}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {question.type === 'true_false' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            disabled={readOnly}
            label="True"
            marker="tile"
            onClick={() => onAnswer({ type: 'true_false', selectedValue: 'true' })}
            selected={answer?.type === 'true_false' && answer.selectedValue === 'true'}
            tone={getOptionTone(question, answer, 'true', readOnly, showCorrectness)}
          />
          <OptionCard
            disabled={readOnly}
            label="False"
            marker="tile"
            onClick={() => onAnswer({ type: 'true_false', selectedValue: 'false' })}
            selected={answer?.type === 'true_false' && answer.selectedValue === 'false'}
            tone={getOptionTone(question, answer, 'false', readOnly, showCorrectness)}
          />
        </div>
      ) : null}

      {question.type === 'type_answer' ? (
        readOnly && showCorrectness ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">Your Answer</p>
              <div className="surface-strong min-h-[180px] rounded-2xl p-4 text-sm leading-7 text-[var(--text-secondary)] whitespace-pre-wrap">
                {answer?.type === 'type_answer' && answer.text ? answer.text : 'No answer submitted.'}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">Reference Answer</p>
              <div className="surface-strong min-h-[180px] rounded-2xl p-4 text-sm leading-7 text-[var(--text-secondary)] whitespace-pre-wrap">
                {question.reference_answer ?? 'No reference answer provided.'}
              </div>
            </div>
          </div>
        ) : (
          <TypeAnswerInput
            disabled={readOnly}
            maxLength={question.max_characters}
            onChange={(text) => onAnswer({ type: 'type_answer', text })}
            placeholder={question.placeholder}
            value={answer?.type === 'type_answer' ? answer.text : ''}
          />
        )
      ) : null}

      {readOnly && showCorrectness && question.explanation ? (
        <div className="rounded-xl border-l-[3px] border-[var(--accent)] bg-[var(--bg-elevated)] px-4 py-4 text-sm leading-7 text-[var(--text-secondary)]">
          {question.explanation}
        </div>
      ) : null}
    </Card>
  );
}
