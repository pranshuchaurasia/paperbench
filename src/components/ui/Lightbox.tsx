// ================================================================
// FILE: src/components/ui/Lightbox.tsx
// PURPOSE: Image lightbox wrapper.
// DEPENDENCIES: react, src/components/ui/Modal
// ================================================================

import { Modal } from './Modal';

/**
 * Lightbox displays an image at larger size.
 */
export function Lightbox({ open, onClose, src, alt }: { open: boolean; onClose: () => void; src: string; alt: string }) {
  return (
    <Modal open={open} onClose={onClose}>
      <img alt={alt} className="w-full rounded-2xl object-contain" src={src} />
    </Modal>
  );
}
