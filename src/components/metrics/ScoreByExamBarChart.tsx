// ================================================================
// FILE: src/components/metrics/ScoreByExamBarChart.tsx
// PURPOSE: Average-score-per-exam chart for the metrics page.
// DEPENDENCIES: recharts, src/components/ui/*
// ================================================================

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui/Card';

function barColor(value: number) {
  if (value >= 70) {
    return '#22c55e';
  }
  if (value >= 40) {
    return '#eab308';
  }
  return '#ef4444';
}

export function ScoreByExamBarChart({ data }: { data: Array<{ examTitle: string; averagePercentage: number; attempts: number; best: number }> }) {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--accent)]">By Exam</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Average score by test</h2>
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 12 }}>
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis domain={[0, 100]} stroke="#a1a1aa" type="number" />
            <YAxis dataKey="examTitle" stroke="#a1a1aa" type="category" width={160} tickFormatter={(value: string) => value.length > 20 ? `${value.slice(0, 20)}…` : value} />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Average']} labelFormatter={(_, payload) => payload?.[0]?.payload ? `${payload[0].payload.attempts} attempts · best ${payload[0].payload.best}%` : ''} />
            <Bar dataKey="averagePercentage" radius={12} shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return <rect fill={barColor(payload.averagePercentage)} height={height} rx={8} ry={8} width={width} x={x} y={y} />;
            }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
