// ================================================================
// FILE: src/components/metrics/DifficultyBreakdownChart.tsx
// PURPOSE: Difficulty-level aggregate score chart.
// DEPENDENCIES: recharts, src/components/ui/*
// ================================================================

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui/Card';

export function DifficultyBreakdownChart({ data }: { data: Array<{ difficulty: string; percentage: number; fill: string }> }) {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--accent)]">By Difficulty</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Score by difficulty level</h2>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="difficulty" stroke="#a1a1aa" />
            <YAxis domain={[0, 100]} stroke="#a1a1aa" />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
            <Bar dataKey="percentage" radius={10}>
              {data.map((entry) => <Cell fill={entry.fill} key={entry.difficulty} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
