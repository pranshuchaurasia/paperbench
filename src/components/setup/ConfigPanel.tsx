import { Settings2, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card } from '../ui/Card';

export function ConfigPanel({
  children,
  onReset,
}: {
  children: ReactNode;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="space-y-6 rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-3 text-[var(--accent)]">
            <Settings2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Configure Your Session</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Customize which questions to include and how the session runs.</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Defaults keep everything selected and use the YAML timer, so you can still run the full exam as-is.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] transition hover:text-[var(--text-primary)]" onClick={onReset} type="button">
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </button>
          <button className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]" onClick={() => setOpen((current) => !current)} type="button">
            {open ? 'Hide' : 'Show'} panel
          </button>
        </div>
      </div>
      {open ? children : null}
    </Card>
  );
}
