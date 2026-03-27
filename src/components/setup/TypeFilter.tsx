import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import type { QuestionType } from '../../types';
import { selectAvailableTypes, selectTypeCounts, useExamStore } from '../../store/examStore';
import { formatQuestionTypeLabel } from '../../utils/questionFilter';
import { FilterChip } from './FilterChip';

export function TypeFilter() {
  const available = useExamStore(useShallow(selectAvailableTypes));
  const selected = useExamStore((state) => state.config.selectedTypes);
  const counts = useExamStore(useShallow(selectTypeCounts));
  const setTypes = useExamStore((state) => state.setTypes);

  const handleToggle = (type: QuestionType) => {
    const isSelected = selected.includes(type);
    if (isSelected && selected.length === 1) {
      toast.error('At least one question type must be selected.');
      return;
    }

    const nextTypes = isSelected
      ? selected.filter((value) => value !== type)
      : [...selected, type];

    setTypes(nextTypes);
  };

  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Question Types</h3>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Include only the answer formats you want to practice.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((type) => {
          const count = counts[type] ?? 0;
          return (
            <FilterChip
              count={count}
              disabled={count === 0}
              key={type}
              label={formatQuestionTypeLabel(type)}
              onClick={() => handleToggle(type)}
              selected={selected.includes(type)}
            />
          );
        })}
      </div>
    </div>
  );
}
