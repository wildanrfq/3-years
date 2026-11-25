import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GENTLE_EASE } from '../lib/motion';

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
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.992 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
        transition={{
          duration: reducedMotion ? 0.25 : 0.58,
          ease: GENTLE_EASE,
        }}
        className="relative min-h-dvh w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
