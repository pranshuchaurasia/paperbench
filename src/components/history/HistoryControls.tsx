// ================================================================
// FILE: src/components/history/HistoryControls.tsx
// PURPOSE: Search, sort, and filter controls for history.
// DEPENDENCIES: react
// ================================================================

export type HistorySortValue = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'title_asc';
export type HistoryFilterValue = 'all' | 'passed' | 'failed' | 'no_threshold';

export function HistoryControls({
  search,
  sort,
  filter,
  onSearchChange,
  onSortChange,
  onFilterChange,
}: {
  search: string;
  sort: HistorySortValue;
  filter: HistoryFilterValue;
  onSearchChange: (value: string) => void;
  onSortChange: (value: HistorySortValue) => void;
  onFilterChange: (value: HistoryFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        className="surface min-w-[260px] flex-1 rounded-[10px] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-hover)]"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by exam title..."
        type="text"
        value={search}
      />
      <select
        className="surface rounded-[10px] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
        onChange={(event) => onSortChange(event.target.value as HistorySortValue)}
        value={sort}
      >
        <option value="date_desc">Date (newest first)</option>
        <option value="date_asc">Date (oldest first)</option>
        <option value="score_desc">Score (highest)</option>
        <option value="score_asc">Score (lowest)</option>
        <option value="title_asc">Title (A-Z)</option>
      </select>
      <select
        className="surface rounded-[10px] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
        onChange={(event) => onFilterChange(event.target.value as HistoryFilterValue)}
        value={filter}
      >
        <option value="all">All</option>
        <option value="passed">Passed only</option>
        <option value="failed">Failed only</option>
        <option value="no_threshold">No threshold set</option>
      </select>
    </div>
  );
}
