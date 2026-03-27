// ================================================================
// FILE: src/routes/exam/setup.tsx
// PURPOSE: Pre-exam configuration and summary screen.
// DEPENDENCIES: tanstack router, react, sonner, src/components/setup/*, src/store
// ================================================================

import { createRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ConfigPanel } from '../../components/setup/ConfigPanel';
import { DifficultyFilter } from '../../components/setup/DifficultyFilter';
import { ExamSummary } from '../../components/setup/ExamSummary';
import { QuestionCountSelector } from '../../components/setup/QuestionCountSelector';
import { TimerModeSelector } from '../../components/setup/TimerModeSelector';
import { TopicFilter } from '../../components/setup/TopicFilter';
import { TypeFilter } from '../../components/setup/TypeFilter';
import { rootRoute } from '../__root';
import { useExamStore } from '../../store/examStore';

export function SetupPage() {
  const navigate = useNavigate();
  const sourceExamConfig = useExamStore((state) => state.sourceExamConfig ?? state.examConfig);
  const config = useExamStore((state) => state.config);
  const resetConfig = useExamStore((state) => state.resetConfig);
  const applyConfigAndStart = useExamStore((state) => state.applyConfigAndStart);
  const setSessionMode = useExamStore((state) => state.setSessionMode);
  const setTimerType = useExamStore((state) => state.setTimerType);
  const setTimeSource = useExamStore((state) => state.setTimeSource);
  const setCustomTotalMinutes = useExamStore((state) => state.setCustomTotalMinutes);
  const setCustomPerQuestionSeconds = useExamStore((state) => state.setCustomPerQuestionSeconds);

  useEffect(() => {
    if (config.sessionMode === 'practice' && sourceExamConfig?.settings.allow_review === false) {
      toast.info('Review navigation enabled for practice mode.');
    }
  }, [config.sessionMode, sourceExamConfig?.settings.allow_review]);

  if (!sourceExamConfig) {
    return null;
  }

  const firstQuestionSeconds = sourceExamConfig.sections.flatMap((section) => section.questions)[0]?.time_limit_seconds ?? 60;
  const yamlTimerLabel = sourceExamConfig.settings.timer_mode === 'global'
    ? `${sourceExamConfig.settings.total_time_minutes ?? 0} min`
    : `${firstQuestionSeconds}s per question`;

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-6 pb-12 pt-6">
      <ConfigPanel onReset={resetConfig}>
        <div className="grid gap-6 md:grid-cols-2">
          <DifficultyFilter />
          <TypeFilter />
        </div>

        <TopicFilter />

        <div className="grid gap-6 md:grid-cols-2">
          <QuestionCountSelector />
          <TimerModeSelector
            customPerQuestionSeconds={config.customPerQuestionSeconds}
            customTotalMinutes={config.customTotalMinutes}
            onCustomPerQuestionSecondsChange={setCustomPerQuestionSeconds}
            onCustomTotalMinutesChange={setCustomTotalMinutes}
            onSessionModeChange={setSessionMode}
            onTimerTypeChange={setTimerType}
            onTimeSourceChange={setTimeSource}
            sessionMode={config.sessionMode}
            timeSource={config.timeSource}
            timerType={config.timerType}
            yamlTimerLabel={yamlTimerLabel}
          />
        </div>
      </ConfigPanel>

      <ExamSummary
        onReset={resetConfig}
        onStart={() => {
          const started = applyConfigAndStart();
          if (!started) {
            toast.error('Your current configuration does not include any questions.');
            return;
          }
          navigate({ to: '/exam/live' });
        }}
      />
    </div>
  );
}

export const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'exam/setup',
  beforeLoad: () => {
    if (!useExamStore.getState().sourceExamConfig && !useExamStore.getState().examConfig) {
      throw redirect({ to: '/upload' });
    }
  },
  component: SetupPage,
});

