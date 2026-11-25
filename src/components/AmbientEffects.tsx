import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  kind: 'sparkle' | 'heart';
}

const FLOATING_LEAVES = [
  { left: '8%', top: '16%', delay: 0, duration: 11, scale: 0.9 },
  { left: '82%', top: '22%', delay: 2.1, duration: 13, scale: 1.05 },
  { left: '14%', top: '68%', delay: 1.2, duration: 12, scale: 0.8 },
  { left: '88%', top: '72%', delay: 3.4, duration: 10, scale: 0.95 },
  { left: '52%', top: '12%', delay: 4.5, duration: 14, scale: 0.75 },
];

export function AmbientEffects() {
  const reducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    let nextId = 1;
    let lastSparkleAt = 0;
    const isFine = window.matchMedia('(pointer: fine)').matches;

    const addParticle = (x: number, y: number, kind: 'sparkle' | 'heart') => {
      const id = nextId++;
      setParticles((prev) => [...prev.slice(-14), { id, x, y, kind }]);
      window.setTimeout(() => {
        setParticles((prev) => prev.filter((item) => item.id !== id));
      }, 720);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isFine || e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastSparkleAt < 85) return;
      lastSparkleAt = now;
      addParticle(e.clientX, e.clientY, 'sparkle');
    };

    const handlePointerDown = (e: PointerEvent) => {
      addParticle(e.clientX, e.clientY, 'heart');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [reducedMotion]);

  return (
    <>
      <div className="paper-grain pointer-events-none fixed inset-0 z-40" aria-hidden="true" />

      {!reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {FLOATING_LEAVES.map((leaf, index) => (
            <motion.svg
              key={index}
              viewBox="0 0 32 32"
              className="absolute h-7 w-7 text-sage-300/60"
              style={{ left: leaf.left, top: leaf.top, scale: leaf.scale }}
              animate={{
                y: [0, -18, 6, 0],
                x: [0, 10, -8, 0],
                rotate: [0, 14, -10, 0],
              }}
              transition={{
                duration: leaf.duration,
                delay: leaf.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M7 23 C8 12 16 7 25 7 C25 16 20 24 7 23 Z"
                fill="currentColor"
              />
              <path
                d="M9 22 Q16 15 23 9"
                stroke="#FBF8EF"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
            </motion.svg>
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {particles.map((item) =>
            item.kind === 'sparkle' ? (
              <motion.svg
                key={item.id}
                viewBox="0 0 20 20"
                className="absolute h-3.5 w-3.5 text-sage-500"
                style={{ left: item.x - 7, top: item.y - 7 }}
                initial={{ opacity: 0.75, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.15, y: -12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                <path
                  d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                  fill="currentColor"
                />
              </motion.svg>
            ) : (
              <motion.div
                key={item.id}
                className="absolute flex items-center justify-center"
                style={{ left: item.x - 16, top: item.y - 16, width: 32, height: 32 }}
                initial={{ opacity: 0.85, scale: 0.45 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                <span className="absolute h-7 w-7 rounded-full border-2 border-sage-400/60" />
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -translate-y-2 text-blush">
                  <path
                    d="M12 21s-7-4.6-7-10.2A4.3 4.3 0 0 1 9.3 6.5c1.2 0 2.2.6 2.7 1.5.5-.9 1.5-1.5 2.7-1.5A4.3 4.3 0 0 1 19 10.8C19 16.4 12 21 12 21z"
                    fill="#F2CFC4"
                    stroke="#7F9C70"
                    strokeWidth="1.4"
                  />
                </svg>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
