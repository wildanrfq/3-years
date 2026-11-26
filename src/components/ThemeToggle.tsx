import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { ThemeMode } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GENTLE_EASE } from '../lib/motion';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  theme,
  onToggle,
  showLabel = false,
  className = '',
}: ThemeToggleProps) {
  const reducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      aria-label={isDark ? 'switch to light mode' : 'switch to dark mode'}
      title={isDark ? 'light mode' : 'dark mode'}
      className={`focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-sage-200/90 bg-cream/90 text-sage-700 shadow-sage-sm transition duration-300 hover:bg-sage-100 ${
        showLabel ? 'px-3.5' : 'w-11'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotate: -25, scale: 0.85 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotate: 25, scale: 0.85 }}
          transition={{ duration: 0.35, ease: GENTLE_EASE }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-blush" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-sage-700" aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>

      {showLabel && (
        <span className="text-xs font-bold lowercase text-sage-800">
          {isDark ? 'light' : 'dark'}
        </span>
      )}
    </motion.button>
  );
}
