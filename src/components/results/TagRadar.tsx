// ================================================================
// FILE: src/components/results/TagRadar.tsx
// PURPOSE: Tag-based performance radar chart.
// DEPENDENCIES: recharts, src/types
// ================================================================

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { QuestionResult } from '../../types';

/**
 * TagRadar visualizes points grouped by tag.
 */
export function TagRadar({ results }: { results: QuestionResult[] }) {
  const grouped = new Map<string, number>();
  results.forEach((result) => {
    result.tags.forEach((tag) => {
      grouped.set(tag, (grouped.get(tag) ?? 0) + (result.pointsEarned ?? 0));
    });
  });
  const data = [...grouped.entries()].map(([tag, score]) => ({ tag, score }));

  if (data.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">No tags available for radar view.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.14)" />
          <PolarAngleAxis dataKey="tag" stroke="#a1a1aa" />
          <Radar dataKey="score" fill="#8b5cf6" fillOpacity={0.25} stroke="#8b5cf6" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
