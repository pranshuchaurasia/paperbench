// ================================================================
// FILE: src/components/ui/Button.tsx
// PURPOSE: Shared button primitive with variants.
// DEPENDENCIES: react, clsx
// ================================================================

import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
}

/**
 * Button renders the app's primary interactive button styles.
 */
export function Button({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition duration-150 ease-[var(--ease-out)] hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'border border-transparent text-white shadow-[var(--shadow-md)]',
        variant === 'secondary' && 'border border-[var(--accent-border)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent-subtle)]',
        variant === 'ghost' && 'border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        variant === 'danger' && 'border border-red-500/25 bg-[var(--danger-subtle)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
        variant === 'subtle' && 'surface text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]',
        className,
      )}
      style={variant === 'primary' ? { background: 'var(--accent-gradient)' } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
