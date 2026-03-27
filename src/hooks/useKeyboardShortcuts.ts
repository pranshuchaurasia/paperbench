// ================================================================
// FILE: src/hooks/useKeyboardShortcuts.ts
// PURPOSE: Keyboard shortcuts for exam navigation and answer selection.
// DEPENDENCIES: react
// ================================================================

import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  onSubmit: () => void;
  onSelectOption: (index: number) => void;
}

/**
 * Register live exam keyboard shortcuts.
 *
 * @param options - Shortcut callbacks.
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        options.onPrevious();
      }
      if (event.key === 'ArrowRight') {
        options.onNext();
      }
      if (event.key.toLowerCase() === 'f') {
        options.onFlag();
      }
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        options.onSubmit();
      }
      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= 6) {
        options.onSelectOption(numeric - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
