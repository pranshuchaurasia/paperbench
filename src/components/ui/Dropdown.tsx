// ================================================================
// FILE: src/components/ui/Dropdown.tsx
// PURPOSE: Lightweight dropdown menu.
// DEPENDENCIES: react, lucide-react
// ================================================================

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DropdownOption {
  label: string;
  onSelect: () => void;
}

/**
 * Dropdown renders a button-triggered menu.
 */
export function Dropdown({ label, options }: { label: string; options: DropdownOption[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button className="surface inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]" onClick={() => setOpen((value) => !value)} type="button">
        {label}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="surface-strong absolute right-0 z-20 mt-2 min-w-48 rounded-2xl p-2 shadow-[var(--shadow-lg)]">
          {options.map((option) => (
            <button
              key={option.label}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              onClick={() => {
                option.onSelect();
                setOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
