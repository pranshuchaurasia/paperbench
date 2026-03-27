// ================================================================
// FILE: src/components/layout/NavBar.tsx
// PURPOSE: Shared top navigation for non-live-exam pages.
// DEPENDENCIES: react, @tanstack/react-router, clsx, ThemeToggle
// ================================================================

import clsx from 'clsx';
import { Link, useRouterState } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import type { ThemePreference } from '../../types';

/**
 * NavBar renders the app shell header.
 */
export function NavBar({
  theme,
  onThemeChange,
}: {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const links = [
    { to: '/', label: 'Home', exact: true },
    { to: '/docs', label: 'Docs' },
    { to: '/history', label: 'History' },
    { to: '/metrics', label: 'Metrics' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--bg-base)]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]" to="/">
            <span className="text-[var(--accent)]">Paper</span> Bench
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = link.exact ? pathname === link.to : pathname.startsWith(link.to);
              return (
                <Link
                  className={clsx(
                    'rounded-[10px] border-b-2 border-transparent px-3 py-2 text-sm font-medium transition',
                    active ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <Link to="/upload">
            <Button type="button">
              Start Exam
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
