// ================================================================
// FILE: src/components/ui/Modal.tsx
// PURPOSE: Minimal modal overlay component.
// DEPENDENCIES: react, framer-motion
// ================================================================

import { AnimatePresence, motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

/**
 * Modal renders children in a centered overlay when open.
 */
export function Modal({ children, open, onClose }: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
