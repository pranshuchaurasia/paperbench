// ================================================================
// FILE: src/components/ui/Card.tsx
// PURPOSE: Shared card wrapper.
// DEPENDENCIES: react, clsx
// ================================================================

import clsx from 'clsx';
import type { HTMLAttributes, PropsWithChildren } from 'react';

/**
 * Card renders a padded surface container.
 */
export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx('surface rounded-2xl p-6 transition duration-150 ease-[var(--ease-out)]', className)} {...props}>
      {children}
    </div>
  );
}
