import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  kind: 'ribbon' | 'flower' | 'sparkle' | 'heart';
  driftX: number;
  spin: number;
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

const FLOATING_LEAVES = [
  { left: '8%', top: '16%', delay: 0, duration: 11, scale: 0.9 },
  { left: '82%', top: '22%', delay: 2.1, duration: 13, scale: 1.05 },
  { left: '14%', top: '68%', delay: 1.2, duration: 12, scale: 0.8 },
  { left: '88%', top: '72%', delay: 3.4, duration: 10, scale: 0.95 },
  { left: '52%', top: '12%', delay: 4.5, duration: 14, scale: 0.75 },
];

const RIBBON_LIFETIME_MS = 380;

export function AmbientEffects() {
  const reducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const ribbonPathRef = useRef<SVGPathElement | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const trailRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let nextId = 1;
    let charmIdx = 0;
    let lastCharmAt = 0;

    const addParticle = (
      x: number,
      y: number,
      kind: Particle['kind'],
      driftX = 0,
      spin = 0
    ) => {
      const id = nextId++;
      setParticles((prev) => [...prev.slice(-9), { id, x, y, kind, driftX, spin }]);
      window.setTimeout(() => {
        setParticles((prev) => prev.filter((item) => item.id !== id));
      }, 860);
    };

    const drawRibbon = () => {
      const pathEl = ribbonPathRef.current;
      const now = performance.now();
      const filtered = trailRef.current.filter((pt) => now - pt.t < RIBBON_LIFETIME_MS);
      trailRef.current = filtered;

      if (!pathEl || filtered.length < 2) {
        if (pathEl) {
          pathEl.setAttribute('d', '');
          pathEl.style.opacity = '0';
        }
        trailRafRef.current = null;
        return;
      }

      let d = `M ${filtered[0].x.toFixed(1)} ${filtered[0].y.toFixed(1)}`;
      for (let i = 1; i < filtered.length - 1; i += 1) {
        const mx = ((filtered[i].x + filtered[i + 1].x) / 2).toFixed(1);
        const my = ((filtered[i].y + filtered[i + 1].y) / 2).toFixed(1);
        d += ` Q ${filtered[i].x.toFixed(1)} ${filtered[i].y.toFixed(1)} ${mx} ${my}`;
      }
      const last = filtered[filtered.length - 1];
      d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

      const freshness = Math.max(0, 1 - (now - last.t) / RIBBON_LIFETIME_MS);
      pathEl.setAttribute('d', d);
      pathEl.style.opacity = (freshness * 0.55).toFixed(3);

      trailRafRef.current = requestAnimationFrame(drawRibbon);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();

      const pts = trailRef.current;
      const prev = pts[pts.length - 1];
      const dist = prev ? Math.hypot(e.clientX - prev.x, e.clientY - prev.y) : 999;

      if (dist >= 5) {
        pts.push({ x: e.clientX, y: e.clientY, t: now });
        if (pts.length > 16) {
          pts.shift();
        }
        if (trailRafRef.current === null) {
          trailRafRef.current = requestAnimationFrame(drawRibbon);
        }
      }

      if (now - lastCharmAt < 145) return;
      lastCharmAt = now;

      const cycle: Array<'ribbon' | 'flower' | 'sparkle'> = ['ribbon', 'sparkle', 'flower'];
      const kind = cycle[charmIdx % cycle.length];
      charmIdx += 1;
      const driftX = (charmIdx % 2 === 0 ? 1 : -1) * (8 + (charmIdx % 3) * 4);
      const spin = (charmIdx % 2 === 0 ? 1 : -1) * 14;
      addParticle(e.clientX, e.clientY, kind, driftX, spin);
    };

    const handlePointerDown = (e: PointerEvent) => {
      addParticle(e.clientX, e.clientY, 'heart', 0, 0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (trailRafRef.current !== null) {
        cancelAnimationFrame(trailRafRef.current);
        trailRafRef.current = null;
      }
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

      {/* Pita tipis lembut mengikuti gerakan kursor */}
      {!reducedMotion && (
        <svg
          className="pointer-events-none fixed inset-0 z-50 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cursor-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9CB38E" />
              <stop offset="55%" stopColor="#E5BFB3" />
              <stop offset="100%" stopColor="#7F9C70" />
            </linearGradient>
          </defs>
          <path
            ref={ribbonPathRef}
            fill="none"
            stroke="url(#cursor-ribbon-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0 }}
          />
        </svg>
      )}

      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {particles.map((item) => {
            if (item.kind === 'ribbon') {
              return (
                <motion.svg
                  key={item.id}
                  viewBox="0 0 28 24"
                  className="absolute h-4 w-5"
                  style={{ left: item.x - 10, top: item.y - 8 }}
                  initial={{ opacity: 0.85, scale: 0.55, rotate: -6 }}
                  animate={{
                    opacity: 0,
                    scale: 1.05,
                    x: item.driftX,
                    y: -14,
                    rotate: item.spin,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.82, ease: 'easeOut' }}
                >
                  <path
                    d="M14 11 C9 5 3 6 4 11 C5 15 10 14 14 12 C18 14 23 15 24 11 C25 6 19 5 14 11 Z"
                    fill="#F2CFC4"
                    stroke="#647F57"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 13 L9 21 M15 13 L19 21"
                    stroke="#647F57"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="11.5" r="2.2" fill="#FBF8EF" stroke="#647F57" strokeWidth="1.2" />
                </motion.svg>
              );
            }

            if (item.kind === 'flower') {
              return (
                <motion.svg
                  key={item.id}
                  viewBox="0 0 24 24"
                  className="absolute h-4 w-4"
                  style={{ left: item.x - 8, top: item.y - 8 }}
                  initial={{ opacity: 0.8, scale: 0.5, rotate: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.05,
                    x: item.driftX,
                    y: -16,
                    rotate: item.spin * 1.4,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <circle cx="12" cy="7" r="3.1" fill="#F2CFC4" />
                  <circle cx="17" cy="12" r="3.1" fill="#F2CFC4" />
                  <circle cx="12" cy="17" r="3.1" fill="#F2CFC4" />
                  <circle cx="7" cy="12" r="3.1" fill="#F2CFC4" />
                  <circle cx="12" cy="12" r="2.5" fill="#7F9C70" />
                </motion.svg>
              );
            }

            if (item.kind === 'sparkle') {
              return (
                <motion.svg
                  key={item.id}
                  viewBox="0 0 20 20"
                  className="absolute h-3.5 w-3.5 text-sage-500"
                  style={{ left: item.x - 7, top: item.y - 7 }}
                  initial={{ opacity: 0.78, scale: 0.5, rotate: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.1,
                    x: item.driftX,
                    y: -14,
                    rotate: item.spin,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.72, ease: 'easeOut' }}
                >
                  <path
                    d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                    fill="currentColor"
                  />
                </motion.svg>
              );
            }

            return (
              <motion.div
                key={item.id}
                className="absolute flex items-center justify-center"
                style={{ left: item.x - 16, top: item.y - 16, width: 32, height: 32 }}
                initial={{ opacity: 0.85, scale: 0.45 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.68, ease: 'easeOut' }}
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
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
