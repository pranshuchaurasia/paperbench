// ================================================================
// FILE: src/components/layout/PageTransition.tsx
// PURPOSE: Animated page transition wrapper.
// DEPENDENCIES: react, framer-motion
// ================================================================

import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

/**
 * PageTransition animates page entry and exit.
 */
export function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
