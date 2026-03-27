import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import type { Difficulty } from '../../types';
import { selectAvailableDifficulties, selectDifficultyCounts, useExamStore } from '../../store/examStore';
import { FilterChip } from './FilterChip';

const labels: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function DifficultyFilter() {
  const available = useExamStore(useShallow(selectAvailableDifficulties));
  const selected = useExamStore((state) => state.config.selectedDifficulties);
  const counts = useExamStore(useShallow(selectDifficultyCounts));
  const setDifficulties = useExamStore((state) => state.setDifficulties);

  const handleToggle = (difficulty: Difficulty) => {
    const isSelected = selected.includes(difficulty);
    if (isSelected && selected.length === 1) {
      toast.error('At least one difficulty must be selected.');
      return;
    }

    const nextDifficulties = isSelected
      ? selected.filter((value) => value !== difficulty)
      : [...selected, difficulty];

    setDifficulties(nextDifficulties);
  };

  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Difficulty</h3>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Choose the difficulty levels to include.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((difficulty) => {
          const count = counts[difficulty] ?? 0;
          return (
            <FilterChip
              count={count}
              disabled={count === 0}
              key={difficulty}
              label={labels[difficulty]}
              onClick={() => handleToggle(difficulty)}
              selected={selected.includes(difficulty)}
            />
          );
        })}
      </div>
    </div>
  );
}
