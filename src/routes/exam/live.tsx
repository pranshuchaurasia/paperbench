// ================================================================
// FILE: src/routes/exam/live.tsx
// PURPOSE: Live timed or practice exam experience.
// DEPENDENCIES: tanstack router, react, src/components/exam/*, src/store
// ================================================================

import { createRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ExamHeader } from '../../components/exam/ExamHeader';
import { Palette } from '../../components/exam/Palette';
import { QuestionCard } from '../../components/exam/QuestionCard';
import { useExamNavigation } from '../../hooks/useExamNavigation';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useService } from '../../services/ServiceProvider';
import { useExamStore } from '../../store/examStore';
import { isAnswerFilled } from '../../utils/answers';
import { buildQuestionMap } from '../../utils/exam';
import { rootRoute } from '../__root';

export function LiveExamPage() {
  const navigate = useNavigate();
  const { timer, storage } = useService();
  const examConfig = useExamStore((state) => state.examConfig);
  const imageMap = useExamStore((state) => state.imageMap);
  const questionOrder = useExamStore((state) => state.questionOrder);
  const answers = useExamStore((state) => state.answers);
  const flaggedQuestions = useExamStore((state) => state.flaggedQuestions);
  const visitedQuestions = useExamStore((state) => state.visitedQuestions);
  const currentQuestionIndex = useExamStore((state) => state.currentQuestionIndex);
  const timeRemainingSeconds = useExamStore((state) => state.timeRemainingSeconds);
  const perQuestionRemainingSeconds = useExamStore((state) => state.perQuestionRemainingSeconds);
  const examStartedAt = useExamStore((state) => state.examStartedAt);
  const sessionMode = useExamStore((state) => state.sessionMode);
  const timeLimitSeconds = useExamStore((state) => state.timeLimitSeconds);
  const answerQuestion = useExamStore((state) => state.answerQuestion);
  const toggleFlag = useExamStore((state) => state.toggleFlag);
  const navigateToQuestion = useExamStore((state) => state.navigateTo);
  const setTimeRemaining = useExamStore((state) => state.setTimeRemaining);
  const setPerQuestionTimeRemaining = useExamStore((state) => state.setPerQuestionTimeRemaining);
  const submitExam = useExamStore((state) => state.submitExam);
  const { canGoNext, canGoPrevious, goNext, goPrevious, totalQuestions } = useExamNavigation();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const globalTimerStartedRef = useRef(false);

  const questionMap = useMemo(() => examConfig ? buildQuestionMap(examConfig) : {}, [examConfig]);
  const currentQuestionId = questionOrder[currentQuestionIndex];
  const currentEntry = currentQuestionId ? questionMap[currentQuestionId] : undefined;
  const timerMode = examConfig?.settings.timer_mode;
  const allowReview = examConfig?.settings.allow_review ?? true;
  const canUsePrevious = allowReview && canGoPrevious;

  const answeredCount = questionOrder.filter((questionId) => isAnswerFilled(answers[questionId])).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const flaggedCount = flaggedQuestions.length;

  const confirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await submitExam();
    navigate({ to: '/exam/results' });
  };

  const handleSubmitAttempt = async () => {
    if (unansweredCount > 0 || flaggedCount > 0) {
      setShowSubmitConfirm(true);
      return;
    }

    await confirmSubmit();
  };

  useEffect(() => {
    if (!examConfig || sessionMode !== 'timed' || timerMode !== 'global' || globalTimerStartedRef.current) {
      return;
    }

    globalTimerStartedRef.current = true;
    timer.start(useExamStore.getState().timeRemainingSeconds, setTimeRemaining, async () => {
      toast.warning('Time is up. Submitting session automatically.');
      await submitExam();
      navigate({ to: '/exam/results' });
    });

    return () => {
      timer.stop();
      globalTimerStartedRef.current = false;
    };
  }, [examConfig, navigate, sessionMode, setTimeRemaining, submitExam, timer, timerMode]);

  useEffect(() => {
    if (!examConfig || sessionMode !== 'timed' || timerMode !== 'per_question' || !currentQuestionId) {
      return;
    }

    const durationSeconds = useExamStore.getState().perQuestionRemainingSeconds[currentQuestionId] ?? 60;
    timer.start(durationSeconds, (remaining) => {
      setPerQuestionTimeRemaining(currentQuestionId, remaining);
    }, async () => {
      const state = useExamStore.getState();
      if (state.currentQuestionIndex < state.questionOrder.length - 1) {
        toast.warning('Question time expired. Moving to the next question.');
        state.navigateTo(state.currentQuestionIndex + 1);
        return;
      }
      toast.warning('Final question expired. Submitting session automatically.');
      await state.submitExam();
      navigate({ to: '/exam/results' });
    });

    return () => {
      timer.stop();
    };
  }, [currentQuestionId, examConfig, navigate, sessionMode, setPerQuestionTimeRemaining, timer, timerMode]);

  useEffect(() => {
    if (!examConfig || examStartedAt == null) {
      return;
    }

    const interval = window.setInterval(() => {
      const state = useExamStore.getState();
      storage.saveExamSession({
        id: 'active-session',
        examConfig: state.examConfig!,
        imageMap: state.imageMap,
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        visitedQuestions: state.visitedQuestions,
        questionOrder: state.questionOrder,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemainingSeconds: state.timeRemainingSeconds,
        perQuestionRemainingSeconds: state.perQuestionRemainingSeconds,
        examStartedAt: state.examStartedAt,
        status: 'in_progress',
        sessionMode: state.sessionMode,
        timeLimitSeconds: state.timeLimitSeconds,
      }).catch(() => undefined);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [examConfig, examStartedAt, storage]);

  useKeyboardShortcuts({
    onPrevious: () => canUsePrevious && goPrevious(),
    onNext: () => canGoNext && goNext(),
    onFlag: () => currentQuestionId && toggleFlag(currentQuestionId),
    onSubmit: handleSubmitAttempt,
    onSelectOption: (index) => {
      if (!currentEntry) {
        return;
      }
      if (currentEntry.question.type === 'single_choice') {
        const option = currentEntry.question.options[index];
        if (option) {
          answerQuestion(currentEntry.question.id, { type: 'single_choice', selectedOptionId: option.id });
        }
      }
    },
  });

  if (!examConfig || !currentEntry) {
    return null;
  }

  const currentRemainingSeconds = timerMode === 'per_question'
    ? perQuestionRemainingSeconds[currentQuestionId] ?? timeRemainingSeconds
    : timeRemainingSeconds;
  const totalTimerSeconds = timerMode === 'per_question'
    ? currentEntry.question.time_limit_seconds ?? 60
    : timeLimitSeconds ?? (examConfig.settings.total_time_minutes ?? 1) * 60;

  return (
    <>
      <div className="flex w-full flex-col gap-6 pb-28 pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
        <div className="mx-auto w-full max-w-[760px] space-y-6 lg:mx-0 lg:max-w-none">
          <ExamHeader
            currentQuestion={currentQuestionIndex + 1}
            remainingSeconds={currentRemainingSeconds}
            sectionName={currentEntry.section.name}
            sessionMode={sessionMode}
            totalQuestions={totalQuestions}
            totalSeconds={totalTimerSeconds}
          />
          <QuestionCard
            answer={answers[currentQuestionId]}
            flagged={flaggedQuestions.includes(currentQuestionId)}
            imageMap={imageMap}
            onAnswer={(answer) => answerQuestion(currentQuestionId, answer)}
            onFlag={() => toggleFlag(currentQuestionId)}
            positionLabel={`Q${currentQuestionIndex + 1} of ${totalQuestions}`}
            question={currentEntry.question}
          />
          <div className="flex flex-wrap justify-between gap-3">
            <Button disabled={!canUsePrevious} onClick={goPrevious} type="button" variant="ghost">Previous</Button>
            <div className="flex gap-3">
              <Button disabled={!canGoNext} onClick={goNext} type="button" variant="subtle">
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>

        <aside className="lg:pt-[72px]">
          <Card className="surface-strong sticky top-24 h-fit space-y-4 p-4">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Questions</h3>
              <p className="mt-1 text-xs leading-6 text-[var(--text-tertiary)]">
                {allowReview ? 'Jump through the question set using the palette.' : 'Review is disabled. Earlier questions stay locked.'}
              </p>
            </div>
            <Palette
              answers={answers}
              currentQuestionId={currentQuestionId}
              flaggedQuestions={flaggedQuestions}
              isDisabled={(index) => !allowReview && (index < currentQuestionIndex || index > currentQuestionIndex + 1)}
              onSelect={navigateToQuestion}
              questionOrder={questionOrder}
              visitedQuestions={visitedQuestions}
            />
          </Card>
        </aside>

        <div className="surface-strong fixed inset-x-4 bottom-4 z-30 rounded-[18px] px-4 py-3 shadow-[var(--shadow-lg)] sm:inset-x-6 lg:inset-x-auto lg:left-6 lg:right-6">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
            <div className="text-sm text-[var(--text-secondary)]">
              {sessionMode === 'practice' ? 'Practice mode' : 'Timed session'} <span className="mx-2">|</span> Answered: {answeredCount}/{totalQuestions} <span className="mx-2">|</span> Flagged: {flaggedQuestions.length}
            </div>
            <Button onClick={handleSubmitAttempt} type="button" variant="danger">
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {showSubmitConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md space-y-5 rounded-[24px] p-6 shadow-[var(--shadow-lg)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Submit exam?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">Once submitted, you cannot change your answers. Continue?</p>
            </div>

            <div className="space-y-2">
              {unansweredCount > 0 ? (
                <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-2 w-2 rounded-full bg-[var(--danger)]"
                  />
                  <p className="leading-6 text-[var(--text-secondary)]">
                    {`${unansweredCount} question${unansweredCount > 1 ? 's' : ''} not answered. These will be scored as incorrect.`}
                  </p>
                </div>
              ) : null}
              {flaggedCount > 0 ? (
                <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-2 w-2 rounded-full bg-[var(--warning)]"
                  />
                  <p className="leading-6 text-[var(--text-secondary)]">
                    {`${flaggedCount} question${flaggedCount > 1 ? 's' : ''} flagged for review.`}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                onClick={() => setShowSubmitConfirm(false)}
                type="button"
              >
                Go Back
              </button>
              <button
                className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                onClick={() => void confirmSubmit()}
                type="button"
              >
                Submit Anyway
              </button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

export const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'exam/live',
  beforeLoad: () => {
    if (useExamStore.getState().status !== 'in_progress') {
      throw redirect({ to: '/upload' });
    }
  },
  component: LiveExamPage,
});

