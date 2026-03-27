// ================================================================
// FILE: src/hooks/useTheme.ts
// PURPOSE: Apply and persist theme preference.
// DEPENDENCIES: react, src/services/ServiceProvider
// ================================================================

import { useEffect, useState } from 'react';
import type { ThemePreference } from '../types';
import { useService } from '../services/ServiceProvider';

/**
 * Manage the active theme preference and root class.
 *
 * @returns Theme state and updater.
 */
export function useTheme(initialTheme: ThemePreference = 'system') {
  const { storage } = useService();
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    storage.loadThemePreference().then((savedTheme) => {
      if (savedTheme) {
        setTheme(savedTheme);
        setHasStoredPreference(true);
        return;
      }
      setTheme(initialTheme);
      setHasStoredPreference(false);
    }).catch(() => undefined);
  }, [initialTheme, storage]);

  useEffect(() => {
    if (!hasStoredPreference) {
      setTheme(initialTheme);
    }
  }, [hasStoredPreference, initialTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const resolvedTheme = theme === 'system' ? (prefersLight ? 'light' : 'dark') : theme;
    root.classList.toggle('light', resolvedTheme === 'light');
  }, [theme]);

  const updateTheme = (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    setHasStoredPreference(true);
    storage.saveThemePreference(nextTheme).catch(() => undefined);
  };

  return { theme, setTheme: updateTheme };
}
