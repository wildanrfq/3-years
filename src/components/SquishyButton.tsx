import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GENTLE_EASE } from '../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'blush';

interface SquishyButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> {
  children: ReactNode;
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-sage-600 text-[#FBF8EF] hover:bg-sage-500 shadow-sage-md border border-sage-700/20',
  secondary:
    'bg-cream text-sage-800 hover:bg-sage-100 shadow-sage-sm border border-sage-200',
  ghost:
    'bg-transparent text-sage-700 hover:bg-sage-100/80 border border-transparent',
  blush:
    'bg-blush text-[#2B3827] hover:brightness-95 shadow-sage-sm border border-sage-300/40',
};

export function SquishyButton({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}: SquishyButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={
        reducedMotion || disabled
          ? undefined
          : { scale: 1.02 }
      }
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.32, ease: GENTLE_EASE }}
      className={`focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-pill px-6 py-3 font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
