// ================================================================
// FILE: src/components/results/DifficultyChart.tsx
// PURPOSE: Difficulty score distribution chart.
// DEPENDENCIES: recharts, src/types
// ================================================================

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { QuestionResult } from '../../types';

/**
 * DifficultyChart aggregates earned points by difficulty level.
 */
export function DifficultyChart({ results }: { results: QuestionResult[] }) {
  const data = ['easy', 'medium', 'hard'].map((difficulty) => ({
    difficulty,
    earned: results
      .filter((result) => result.difficulty === difficulty)
      .reduce((sum, result) => sum + (result.pointsEarned ?? 0), 0),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="difficulty" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip />
          <Bar dataKey="earned" fill="#6366f1" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
