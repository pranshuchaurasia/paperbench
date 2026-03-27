import { selectFilteredQuestions, useExamStore } from '../../store/examStore';

export function QuestionCountSelector() {
  const matchingCount = useExamStore((state) => selectFilteredQuestions(state).length);
  const mode = useExamStore((state) => state.config.questionCountMode);
  const customCount = useExamStore((state) => state.config.customQuestionCount);
  const setMode = useExamStore((state) => state.setQuestionCountMode);
  const setCount = useExamStore((state) => state.setCustomQuestionCount);

  const clampedCount = Math.min(customCount, matchingCount);
  const showClampWarning = mode === 'custom' && customCount > matchingCount;

  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Number of Questions</h3>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Use all matches or pick a custom number from the filtered pool.</p>
      </div>
      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <label className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
          <input checked={mode === 'all'} name="question-count" onChange={() => setMode('all')} type="radio" />
          <span>All matching ({matchingCount})</span>
        </label>
        <label className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-primary)]">
          <input checked={mode === 'custom'} name="question-count" onChange={() => setMode('custom')} type="radio" />
          <span>Custom</span>
          <input
            className="w-24 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
            disabled={mode !== 'custom'}
            min={1}
            onChange={(event) => setCount(Number(event.target.value))}
            type="number"
            value={mode === 'custom' ? customCount : clampedCount || matchingCount}
          />
        </label>
        {showClampWarning ? (
          <p className="text-xs text-[var(--warning)]">Only {matchingCount} questions match your filters. All will be included.</p>
        ) : null}
      </div>
    </div>
  );
}
