// ================================================================
// FILE: src/components/results/SectionBarChart.tsx
// PURPOSE: Section score comparison chart.
// DEPENDENCIES: recharts
// ================================================================

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SectionScore } from '../../types';

/**
 * SectionBarChart compares earned versus possible section scores.
 */
export function SectionBarChart({ data }: { data: SectionScore[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="sectionName" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip />
          <Bar dataKey="earned" fill="#8b5cf6" radius={8} />
          <Bar dataKey="possible" fill="#27272a" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
