import type { SessionMode, TimerMode } from '../../types';

export function TimerModeSelector({
  sessionMode,
  timerType,
  timeSource,
  customTotalMinutes,
  customPerQuestionSeconds,
  yamlTimerLabel,
  onSessionModeChange,
  onTimerTypeChange,
  onTimeSourceChange,
  onCustomTotalMinutesChange,
  onCustomPerQuestionSecondsChange,
}: {
  sessionMode: SessionMode;
  timerType: TimerMode;
  timeSource: 'yaml_default' | 'custom';
  customTotalMinutes: number;
  customPerQuestionSeconds: number;
  yamlTimerLabel: string;
  onSessionModeChange: (mode: SessionMode) => void;
  onTimerTypeChange: (type: TimerMode) => void;
  onTimeSourceChange: (source: 'yaml_default' | 'custom') => void;
  onCustomTotalMinutesChange: (minutes: number) => void;
  onCustomPerQuestionSecondsChange: (seconds: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Timer Mode</h3>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Switch between timed delivery and untimed practice mode.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-wrap gap-6 text-sm text-[var(--text-primary)]">
          <label className="flex items-center gap-2">
            <input checked={sessionMode === 'timed'} name="session-mode" onChange={() => onSessionModeChange('timed')} type="radio" />
            Timed
          </label>
          <label className="flex items-center gap-2">
            <input checked={sessionMode === 'practice'} name="session-mode" onChange={() => onSessionModeChange('practice')} type="radio" />
            Practice (untimed)
          </label>
        </div>

        {sessionMode === 'timed' ? (
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <div className="flex flex-wrap gap-6 text-sm text-[var(--text-primary)]">
              <label className="flex items-center gap-2">
                <input checked={timeSource === 'yaml_default'} name="time-source" onChange={() => onTimeSourceChange('yaml_default')} type="radio" />
                Use YAML default ({yamlTimerLabel})
              </label>
              <label className="flex items-center gap-2">
                <input checked={timeSource === 'custom'} name="time-source" onChange={() => onTimeSourceChange('custom')} type="radio" />
                Custom time
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-6 text-sm text-[var(--text-primary)]">
                <label className="flex items-center gap-2">
                  <input checked={timerType === 'global'} name="timer-type" onChange={() => onTimerTypeChange('global')} type="radio" />
                  Global countdown
                </label>
                <label className="flex items-center gap-2">
                  <input checked={timerType === 'per_question'} name="timer-type" onChange={() => onTimerTypeChange('per_question')} type="radio" />
                  Per-question
                </label>
              </div>

              {timerType === 'global' && timeSource === 'custom' ? (
                <label className="grid gap-2 text-sm text-[var(--text-primary)]">
                  <span>Custom total time (minutes)</span>
                  <input
                    className="w-32 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    min={1}
                    onChange={(event) => onCustomTotalMinutesChange(Number(event.target.value))}
                    type="number"
                    value={customTotalMinutes}
                  />
                </label>
              ) : null}

              {timerType === 'per_question' ? (
                <label className="grid gap-2 text-sm text-[var(--text-primary)]">
                  <span>Per-question time (seconds)</span>
                  <input
                    className="w-32 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    min={5}
                    onChange={(event) => onCustomPerQuestionSecondsChange(Number(event.target.value))}
                    type="number"
                    value={customPerQuestionSeconds}
                  />
                </label>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
