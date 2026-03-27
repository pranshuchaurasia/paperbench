// ================================================================
// FILE: src/components/exam/QuestionImage.tsx
// PURPOSE: Render question images with optional lightbox support.
// DEPENDENCIES: react, src/hooks/useImageResolver, Lightbox
// ================================================================

import { useState } from 'react';
import type { QuestionImage as QuestionImageType } from '../../types';
import { useImageResolver } from '../../hooks/useImageResolver';
import { Lightbox } from '../ui/Lightbox';

/**
 * QuestionImage renders an exam image or a fallback placeholder.
 */
export function QuestionImage({ image, imageMap }: { image: QuestionImageType; imageMap: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const resolved = useImageResolver(image.src, imageMap);

  if (!resolved.src) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-[var(--text-secondary)]">
        {image.alt}
      </div>
    );
  }

  return (
    <>
      <button className="block w-full text-left" onClick={() => setOpen(true)} type="button">
        <img
          alt={image.alt}
          className="w-full rounded-2xl object-cover"
          src={resolved.src}
          style={{ maxWidth: image.width ? `${image.width}px` : '100%' }}
        />
        {image.caption ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{image.caption}</p> : null}
      </button>
      <Lightbox alt={image.alt} onClose={() => setOpen(false)} open={open} src={resolved.src} />
    </>
  );
}
