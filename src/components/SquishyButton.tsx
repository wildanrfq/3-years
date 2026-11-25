import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

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
          : { scale: 1.025, rotate: [0, -1, 1, 0], transition: { duration: 0.35 } }
      }
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 450, damping: 24 }}
      className={`focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-pill px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
