import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface PageTransitionProps {
  screenKey: string;
  children: ReactNode;
}

export function PageTransition({ screenKey, children }: PageTransitionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.85 }}
        className="relative min-h-dvh w-full"
      >
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 1, originX: 1 }}
            animate={{ scaleX: 0, originX: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-0 z-30 bg-sage-200/55"
          />
        )}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
