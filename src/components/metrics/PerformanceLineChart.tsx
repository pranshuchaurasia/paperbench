// ================================================================
// FILE: src/components/metrics/PerformanceLineChart.tsx
// PURPOSE: Score-over-time trend chart for the metrics page.
// DEPENDENCIES: recharts, src/components/ui/*
// ================================================================

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui/Card';

export function PerformanceLineChart({ data }: { data: Array<{ label: string; percentage: number; title: string; date: string }> }) {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--accent)]">Trend</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Performance over time</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Across all tracked exams</p>
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" stroke="#a1a1aa" />
            <YAxis domain={[0, 100]} stroke="#a1a1aa" />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} labelFormatter={(_, payload) => payload?.[0]?.payload ? `${payload[0].payload.title} · ${payload[0].payload.date}` : ''} />
            <Line dataKey="percentage" dot={{ fill: '#8b5cf6', r: 4 }} stroke="#8b5cf6" strokeWidth={2} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length <= 1 ? <p className="text-sm text-[var(--text-tertiary)]">Take more exams to see trends.</p> : null}
    </Card>
  );
}
