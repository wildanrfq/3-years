import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GENTLE_EASE } from '../lib/motion';

interface HintBubbleProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function HintBubble({ children, icon, className = '' }: HintBubbleProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={
        reducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: [0, -3, 0] }
      }
      transition={
        reducedMotion
          ? { duration: 0.35, ease: GENTLE_EASE }
          : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
      }
      className={`inline-flex items-center gap-2 rounded-pill border border-sage-200 bg-cream/95 px-3.5 py-1.5 text-xs font-semibold text-sage-700 shadow-sage-sm ${className}`}
    >
      {icon}
      <span>{children}</span>
    </motion.div>
  );
}
