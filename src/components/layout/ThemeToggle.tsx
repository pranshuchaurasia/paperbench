// ================================================================
// FILE: src/components/layout/ThemeToggle.tsx
// PURPOSE: Theme preference switcher.
// DEPENDENCIES: react, lucide-react
// ================================================================

import { Monitor, MoonStar, SunMedium } from 'lucide-react';
import type { ThemePreference } from '../../types';

/**
 * ThemeToggle switches between dark, light, and system themes.
 */
export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}) {
  const order: ThemePreference[] = ['dark', 'light', 'system'];
  const nextTheme = order[(order.indexOf(theme) + 1) % order.length];

  return (
    <button
      className="surface flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      onClick={() => onChange(nextTheme)}
      title={`Theme: ${theme}`}
      type="button"
    >
      {theme === 'dark' ? <MoonStar className="h-4 w-4" /> : null}
      {theme === 'light' ? <SunMedium className="h-4 w-4" /> : null}
      {theme === 'system' ? <Monitor className="h-4 w-4" /> : null}
    </button>
  );
}
