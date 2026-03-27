// ================================================================
// FILE: src/components/ui/Badge.tsx
// PURPOSE: Small semantic label primitive.
// DEPENDENCIES: react, clsx
// ================================================================

import clsx from 'clsx';
import type { HTMLAttributes, PropsWithChildren } from 'react';

/**
 * Badge renders a small pill label.
 */
export function Badge({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]', className)} {...props}>
      {children}
    </span>
  );
}
