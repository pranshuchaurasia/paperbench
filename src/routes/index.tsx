// ================================================================
// FILE: src/routes/index.tsx
// PURPOSE: Minimal landing hero for the corrected page architecture.
// DEPENDENCIES: tanstack router, lucide-react, src/components/ui/*
// ================================================================

import { createRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { rootRoute } from './__root';

function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute inset-0 rounded-[32px] bg-[var(--accent)]/10 blur-3xl" />
      <div className="glass relative rotate-[2deg] rounded-[28px] border border-[var(--accent-border)] p-4 shadow-[var(--shadow-xl)]">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-[var(--text-tertiary)]">paperbench://frontend-assessment/live</span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_168px]">
            <div className="space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
                <span>Q5 of 25</span>
                <div className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)]">23:47</div>
              </div>
              <h3 className="text-lg font-semibold leading-snug">Which HTML landmark improves keyboard navigation for assistive technologies?</h3>
              <div className="rounded-2xl border border-[var(--border)] bg-[#111827] p-4 font-mono text-xs leading-6 text-slate-200">
                <div className="text-[var(--text-tertiary)]">&lt;header&gt;  &lt;main&gt;  &lt;footer&gt;</div>
                <div><span className="text-violet-300">const</span> answer = <span className="text-emerald-300">'main'</span>;</div>
              </div>
              <div className="space-y-2">
                {['<div>', '<h1>', '<main>', '<section>'].map((option, index) => (
                  <div
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${index === 2 ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                    key={option}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border ${index === 2 ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--text-tertiary)]'}`} />
                      <span>{option}</span>
                    </div>
                    <span className="rounded-md bg-black/20 px-2 py-1 text-[10px] text-[var(--text-tertiary)]">{String.fromCharCode(65 + index)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }).map((_, index) => (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${index === 4 ? 'border-[var(--accent)] text-[var(--text-primary)] ring-2 ring-[var(--accent-border)]' : index % 5 === 0 ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300' : index % 4 === 0 ? 'border-amber-500/30 bg-amber-500/12 text-amber-300' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                    key={index}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <section className="aurora flex min-h-[calc(100vh-92px)] w-full items-center py-8">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Offline Exam Engine</p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Run technical assessments that feel <span className="gradient-text">real</span>.
            </h1>
            <p className="max-w-[48ch] text-lg leading-8 text-[var(--text-secondary)]">
              Upload a YAML file. Start a timed session. Get instant results. All offline, all in the browser.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link to="/upload">
              <Button className="px-8 py-4 text-lg shadow-[var(--shadow-lg)]">
                Start Exam
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link className="text-sm text-[var(--text-tertiary)] transition hover:text-[var(--text-primary)] hover:underline" to="/docs">
              or read the docs
            </Link>
          </div>
        </div>
        <ProductMockup />
      </div>
    </section>
  );
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});



