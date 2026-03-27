import { toast } from 'sonner';
import { selectAllUniqueTopics, selectTopicCounts, useExamStore } from '../../store/examStore';
import { FilterChip } from './FilterChip';

export function TopicFilter() {
  const selectedTopics = useExamStore((state) => state.config.selectedTopics);
  const setTopics = useExamStore((state) => state.setTopics);
  const topicCounts = useExamStore(selectTopicCounts);
  const allTopics = useExamStore(selectAllUniqueTopics);

  const handleToggle = (topic: string) => {
    const isSelected = selectedTopics.includes(topic);

    if (isSelected && selectedTopics.length <= 1) {
      toast.error('At least one topic must be selected.');
      return;
    }

    const updatedTopics = isSelected
      ? selectedTopics.filter((value) => value !== topic)
      : [...selectedTopics, topic];

    setTopics(updatedTopics);
  };

  const handleSelectAll = () => {
    setTopics([...allTopics]);
  };

  const handleDeselectAll = () => {
    toast.error('At least one topic must be selected.');
  };

  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Topics</h3>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Topic tags come from the YAML and drive question filtering.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <button className="text-[var(--accent)] hover:underline" onClick={handleSelectAll} type="button">Select All</button>
          <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline" onClick={handleDeselectAll} type="button">Deselect All</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTopics.map((topic) => {
          const count = topicCounts[topic] ?? 0;
          const isSelected = selectedTopics.includes(topic);

          return (
            <FilterChip
              count={count}
              disabled={count === 0 && !isSelected}
              key={topic}
              label={topic}
              onClick={() => handleToggle(topic)}
              selected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
