// ================================================================
// FILE: src/components/ui/DropZone.tsx
// PURPOSE: Drag-drop uploader for YAML bundles.
// DEPENDENCIES: react, src/components/ui/Button
// ================================================================

import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from './Button';

/**
 * DropZone handles drag-drop or click-to-upload interactions.
 */
export function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className={`surface aurora relative overflow-hidden rounded-[24px] border border-dashed p-8 transition ${dragging ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--accent-border)]'}`}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDrop={handleDrop}
    >
      <div className="relative flex min-h-72 flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Primary Action</p>
            <h2 className="max-w-xl text-3xl font-semibold leading-[1.15] text-[var(--text-primary)]">Drop a YAML exam, YAML plus images, or a ZIP bundle.</h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              The browser validates the package, resolves local media, and moves you into the exam briefing flow without leaving the app.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-tertiary)]">
            <span className="rounded-full border border-[var(--border)] px-3 py-1">YAML / YML</span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1">ZIP with assets</span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1">Offline-first media</span>
          </div>
          <Button onClick={() => inputRef.current?.click()} type="button">
            Choose Files
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        accept=".yaml,.yml,.zip,.png,.jpg,.jpeg,.gif,.svg,.webp"
        className="hidden"
        multiple
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
        type="file"
      />
    </div>
  );
}
