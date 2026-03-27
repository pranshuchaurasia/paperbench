// ================================================================
// FILE: src/components/docs/QuestionPreview.tsx
// PURPOSE: Non-interactive visual preview of a rendered question.
// DEPENDENCIES: react
// ================================================================

import type { ReactNode } from 'react';

export function QuestionPreview({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-strong rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)]">{eyebrow}</p>
      <h4 className="mt-2 text-base font-medium text-[var(--text-primary)]">{title}</h4>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}
