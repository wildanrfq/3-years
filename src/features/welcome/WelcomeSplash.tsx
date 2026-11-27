import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { content } from '../../config/content';
import { GreenFlower } from '../../components/GreenFlower';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GENTLE_EASE } from '../../lib/motion';

interface WelcomeSplashProps {
  onComplete: () => void;
}

type Phase = 'growing' | 'exploded' | 'leaving';

interface BurstShard {
  id: number;
  angleDeg: number;
  distanceVmax: number;
  sizePx: number;
  delay: number;
  duration: number;
  driftY: number;
  spin: number;
  kind: 'heart' | 'petal' | 'dot';
  color: string;
}

const SHARD_COLORS = ['#DFA89B', '#F2CFC4', '#E6A99C', '#7F9C70', '#9CB38E', '#FBF8EF'];

const BURST_SHARDS: BurstShard[] = Array.from({ length: 48 }, (_, idx) => {
  const ring = idx < 24 ? 0 : 1;
  const angleDeg = (idx % 24) * 15 + (ring === 1 ? 7.5 : 0) + ((idx % 3) - 1) * 4;
  const distanceVmax = ring === 0 ? 34 + (idx % 4) * 11 : 54 + (idx % 5) * 13;
  const kind: BurstShard['kind'] =
    idx % 2 === 0 ? 'heart' : idx % 3 === 1 ? 'petal' : 'dot';
  return {
    id: idx,
    angleDeg,
    distanceVmax,
    sizePx: kind === 'heart' ? 18 + (idx % 4) * 6 : 10 + (idx % 3) * 4,
    delay: ring * 0.14 + (idx % 5) * 0.04,
    duration: 2.3 + (idx % 4) * 0.35,
    driftY: 36 + (idx % 5) * 18,
    spin: (idx % 2 === 0 ? 1 : -1) * (120 + (idx % 4) * 45),
    kind,
    color: SHARD_COLORS[idx % SHARD_COLORS.length],
  };
});

export function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('growing');
  const [viewportMax, setViewportMax] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(window.innerWidth, window.innerHeight) : 900
  );

  useEffect(() => {
    const updateSize = () => {
      setViewportMax(Math.max(window.innerWidth, window.innerHeight));
    };
    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const timers: number[] = [];

    if (reducedMotion) {
      timers.push(window.setTimeout(() => setPhase('exploded'), 900));
      timers.push(window.setTimeout(() => setPhase('leaving'), 2300));
      timers.push(window.setTimeout(onComplete, 2700));
      return () => timers.forEach((id) => window.clearTimeout(id));
    }

    const fireHeartExplosion = () => {
      try {
        const heartShape = confetti.shapeFromPath({
          path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        });
        const colors = ['#DBA89B', '#F2CFC4', '#E6A99C', '#7F9C70', '#9CB38E', '#FBF8EF'];

        // Main center full-screen radial burst
        confetti({
          particleCount: 90,
          spread: 180,
          startVelocity: 52,
          decay: 0.92,
          gravity: 0.52,
          ticks: 280,
          scalar: 1.35,
          origin: { x: 0.5, y: 0.45 },
          colors,
          shapes: [heartShape, 'circle'],
        });

        // Secondary wide side bursts to fill the entire viewport
        timers.push(
          window.setTimeout(() => {
            confetti({
              particleCount: 45,
              angle: 60,
              spread: 95,
              startVelocity: 46,
              decay: 0.92,
              gravity: 0.5,
              ticks: 260,
              scalar: 1.2,
              origin: { x: 0.15, y: 0.55 },
              colors,
              shapes: [heartShape, 'circle'],
            });
            confetti({
              particleCount: 45,
              angle: 120,
              spread: 95,
              startVelocity: 46,
              decay: 0.92,
              gravity: 0.5,
              ticks: 260,
              scalar: 1.2,
              origin: { x: 0.85, y: 0.55 },
              colors,
              shapes: [heartShape, 'circle'],
            });
          }, 260)
        );

        // Lingering top shower so hearts drift across the screen longer
        timers.push(
          window.setTimeout(() => {
            confetti({
              particleCount: 45,
              spread: 160,
              startVelocity: 28,
              decay: 0.93,
              gravity: 0.42,
              ticks: 240,
              scalar: 1.05,
              origin: { x: 0.5, y: 0.18 },
              colors: ['#F2CFC4', '#DBA89B', '#7F9C70', '#FBF8EF'],
              shapes: [heartShape, 'circle'],
            });
          }, 850)
        );
      } catch {
        confetti({
          particleCount: 80,
          spread: 160,
          startVelocity: 45,
          ticks: 240,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#DBA89B', '#7F9C70', '#FBF8EF'],
        });
      }
    };

    timers.push(
      window.setTimeout(() => {
        setPhase('exploded');
        fireHeartExplosion();
      }, 2750)
    );

    timers.push(window.setTimeout(() => setPhase('leaving'), 6150));
    timers.push(window.setTimeout(onComplete, 6700));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [onComplete, reducedMotion]);

  return (
    <motion.div
      animate={phase === 'leaving' ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0.3 : 0.55, ease: GENTLE_EASE }}
      onClick={() => {
        if (phase !== 'growing') onComplete();
      }}
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sage-100 via-sage-50 to-sage-100 px-6 text-center"
    >
      {/* Subtle botanical ornaments */}
      <GreenFlower
        variant="sprig"
        className="pointer-events-none absolute -left-4 top-10 h-20 w-20 -rotate-12 opacity-25 sm:left-8 sm:h-24 sm:w-24"
      />
      <GreenFlower
        variant="rosette"
        className="pointer-events-none absolute -right-4 bottom-12 h-20 w-20 rotate-12 opacity-25 sm:right-10 sm:h-24 sm:w-24"
      />

      {/* Ambient radial glow expanding across the whole screen on burst */}
      <motion.div
        aria-hidden="true"
        animate={
          phase === 'exploded'
            ? { scale: 6, opacity: [0.65, 0.42, 0.2] }
            : phase === 'growing'
              ? { scale: [0.85, 1.55], opacity: [0.28, 0.62] }
              : { opacity: 0 }
        }
        transition={{ duration: phase === 'growing' ? 2.7 : 2.2, ease: GENTLE_EASE }}
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-blush/35 blur-3xl"
      />

      {/* Full-screen explosion waves & viewport-spanning heart shards */}
      {phase !== 'growing' && !reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center overflow-hidden">
          {/* Soft screen-wide radial burst flash */}
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0.1, opacity: 0.55 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.6, ease: GENTLE_EASE }}
            className="absolute h-[130vmax] w-[130vmax] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(242,207,196,0.48) 0%, rgba(156,179,142,0.18) 45%, transparent 72%)',
            }}
          />

          {/* Multiple shockwave rings sweeping past screen edges */}
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.08, opacity: 0.9 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[130vmax] w-[130vmax] rounded-full border-4 border-blush/80"
          />
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.06, opacity: 0.75 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 2.1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[130vmax] w-[130vmax] rounded-full border-2 border-sage-400/75"
          />
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.05, opacity: 0.6 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 2.35, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[130vmax] w-[130vmax] rounded-full border-2 border-blush/60"
          />

          {BURST_SHARDS.map((shard) => {
            const rad = (shard.angleDeg * Math.PI) / 180;
            const distPx = (shard.distanceVmax / 100) * viewportMax;
            const tx = Math.cos(rad) * distPx;
            const ty = Math.sin(rad) * distPx;
            return (
              <motion.span
                key={shard.id}
                aria-hidden="true"
                initial={{ x: 0, y: 0, scale: 0.25, opacity: 1, rotate: 0 }}
                animate={{
                  x: tx,
                  y: ty + shard.driftY,
                  scale: [0.25, 1.15, 0.95, 0.55],
                  opacity: [1, 1, 0.9, 0],
                  rotate: shard.spin,
                }}
                transition={{
                  duration: shard.duration,
                  delay: shard.delay,
                  ease: [0.14, 1, 0.32, 1],
                }}
                className="absolute"
              >
                {shard.kind === 'heart' ? (
                  <svg
                    viewBox="0 0 24 24"
                    style={{ width: shard.sizePx, height: shard.sizePx }}
                  >
                    <path
                      d="M12 21s-7.5-4.7-7.5-10.3A4.5 4.5 0 0 1 9 6.2c1.4 0 2.4.7 3 1.7.6-1 1.6-1.7 3-1.7a4.5 4.5 0 0 1 4.5 4.5C19.5 16.3 12 21 12 21z"
                      fill={shard.color}
                    />
                  </svg>
                ) : shard.kind === 'petal' ? (
                  <span
                    className="block rounded-full"
                    style={{
                      width: shard.sizePx * 0.72,
                      height: shard.sizePx * 1.1,
                      backgroundColor: shard.color,
                    }}
                  />
                ) : (
                  <span
                    className="block rounded-full"
                    style={{
                      width: shard.sizePx * 0.65,
                      height: shard.sizePx * 0.65,
                      backgroundColor: shard.color,
                    }}
                  />
                )}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Centerpiece growing heart */}
      <div className="relative z-10 flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        <AnimatePresence>
          {phase === 'growing' && (
            <>
              {/* Anticipation ripple ring */}
              {!reducedMotion && (
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0.4, opacity: 0.5 }}
                  animate={{ scale: [0.4, 1.55], opacity: [0.55, 0] }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: 'easeOut' }}
                  className="pointer-events-none absolute h-36 w-36 rounded-full border-2 border-blush/60"
                />
              )}

              {/* Big Love growing from tiny to huge */}
              <motion.div
                key="growing-heart"
                initial={reducedMotion ? { scale: 0.85, opacity: 0 } : { scale: 0.14, opacity: 0 }}
                animate={
                  reducedMotion
                    ? { scale: 1, opacity: 1 }
                    : {
                        scale: [0.16, 0.56, 0.48, 0.94, 0.86, 1.42, 1.32, 1.85],
                        opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                        rotate: [0, -3, 2, -2, 2, -3, 3, 0],
                      }
                }
                exit={
                  reducedMotion
                    ? { opacity: 0, transition: { duration: 0.25 } }
                    : {
                        scale: 3.2,
                        opacity: 0,
                        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                      }
                }
                transition={{
                  duration: reducedMotion ? 0.35 : 2.7,
                  times: reducedMotion ? undefined : [0, 0.18, 0.28, 0.48, 0.58, 0.78, 0.88, 1],
                  ease: 'easeInOut',
                }}
                className="relative flex items-center justify-center drop-shadow-[0_14px_30px_rgba(219,168,155,0.45)]"
              >
                <svg
                  viewBox="0 0 120 110"
                  className="h-32 w-32 sm:h-36 sm:w-36"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="welcomeHeartGrad" cx="38%" cy="32%" r="70%">
                      <stop offset="0%" stopColor="#FADDD5" />
                      <stop offset="55%" stopColor="#E6A99C" />
                      <stop offset="100%" stopColor="#C97F72" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M60 100 C60 100 10 68 10 34 C10 17 24 6 39 6 C49 6 56 12 60 20 C64 12 71 6 81 6 C96 6 110 17 110 34 C110 68 60 100 60 100 Z"
                    fill="url(#welcomeHeartGrad)"
                    stroke="#647F57"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M27 31 C28 22 35 17 43 18"
                    stroke="#FBF8EF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.7"
                    fill="none"
                  />
                </svg>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Dedication message */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={
          phase === 'exploded'
            ? { opacity: 1, y: 0, scale: 1.03 }
            : phase === 'leaving'
              ? { opacity: 0, y: -6 }
              : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{
          duration: reducedMotion ? 0.25 : 0.72,
          delay: phase === 'growing' ? 0.2 : 0,
          ease: GENTLE_EASE,
        }}
        className="relative z-30 mt-2 max-w-md font-display text-2xl font-semibold leading-snug text-sage-900 sm:text-3xl"
      >
        {content.welcomeSplash.dedicationText}
      </motion.p>
    </motion.div>
  );
}
