// ================================================================
// FILE: src/components/metrics/StatsGrid.tsx
// PURPOSE: High-level metric stat cards for the metrics dashboard.
// DEPENDENCIES: react, src/components/ui/*
// ================================================================

import { Card } from '../ui/Card';

export interface MetricStat {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  tooltip?: string;
}

export function StatsGrid({ stats }: { stats: MetricStat[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card className="surface-strong p-5" key={stat.label}>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)]" title={stat.tooltip}>{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
          {stat.delta ? (
            <p className={`mt-2 text-xs ${stat.delta.positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {stat.delta.positive ? '?' : '?'} {stat.delta.value}
            </p>
          ) : null}
        </Card>
      ))}
    </section>
  );
}
