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
  distance: number;
  scale: number;
  delay: number;
  kind: 'heart' | 'petal' | 'dot';
  color: string;
}

const SHARD_COLORS = ['#DFA89B', '#F2CFC4', '#7F9C70', '#9CB38E', '#FBF8EF'];

const BURST_SHARDS: BurstShard[] = Array.from({ length: 24 }, (_, idx) => {
  const angleDeg = idx * 15 + (idx % 2 === 0 ? 4 : -4);
  const distance = 120 + (idx % 4) * 34;
  const kind: BurstShard['kind'] =
    idx % 3 === 0 ? 'heart' : idx % 3 === 1 ? 'petal' : 'dot';
  return {
    id: idx,
    angleDeg,
    distance,
    scale: 0.75 + (idx % 3) * 0.25,
    delay: (idx % 4) * 0.025,
    kind,
    color: SHARD_COLORS[idx % SHARD_COLORS.length],
  };
});

export function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('growing');

  useEffect(() => {
    const timers: number[] = [];

    if (reducedMotion) {
      timers.push(window.setTimeout(() => setPhase('exploded'), 750));
      timers.push(window.setTimeout(() => setPhase('leaving'), 1550));
      timers.push(window.setTimeout(onComplete, 1950));
      return () => timers.forEach((id) => window.clearTimeout(id));
    }

    const fireHeartExplosion = () => {
      try {
        const heartShape = confetti.shapeFromPath({
          path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        });
        confetti({
          particleCount: 55,
          spread: 110,
          startVelocity: 38,
          scalar: 1.25,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#DBA89B', '#F2CFC4', '#7F9C70', '#9CB38E', '#FBF8EF'],
          shapes: [heartShape, 'circle'],
        });
        timers.push(
          window.setTimeout(() => {
            confetti({
              particleCount: 32,
              spread: 140,
              startVelocity: 26,
              scalar: 0.95,
              origin: { x: 0.5, y: 0.45 },
              colors: ['#F2CFC4', '#7F9C70', '#FBF8EF'],
              shapes: [heartShape, 'circle'],
            });
          }, 140)
        );
      } catch {
        confetti({
          particleCount: 50,
          spread: 110,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#DBA89B', '#7F9C70', '#FBF8EF'],
        });
      }
    };

    timers.push(
      window.setTimeout(() => {
        setPhase('exploded');
        fireHeartExplosion();
      }, 2550)
    );

    timers.push(window.setTimeout(() => setPhase('leaving'), 3800));
    timers.push(window.setTimeout(onComplete, 4300));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [onComplete, reducedMotion]);

  return (
    <motion.div
      animate={phase === 'leaving' ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0.3 : 0.52, ease: GENTLE_EASE }}
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

      {/* Ambient radial glow */}
      <motion.div
        aria-hidden="true"
        animate={
          phase === 'exploded'
            ? { scale: 2.2, opacity: 0.7 }
            : phase === 'growing'
              ? { scale: [0.85, 1.35], opacity: [0.28, 0.58] }
              : { opacity: 0 }
        }
        transition={{ duration: phase === 'growing' ? 2.5 : 0.6, ease: GENTLE_EASE }}
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-blush/35 blur-3xl"
      />

      {/* Centerpiece growing & exploding heart stage */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        <AnimatePresence>
          {phase === 'growing' && (
            <>
              {/* Anticipation ripple ring */}
              {!reducedMotion && (
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0.4, opacity: 0.5 }}
                  animate={{ scale: [0.4, 1.5], opacity: [0.55, 0] }}
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
                        scale: [0.16, 0.56, 0.48, 0.92, 0.84, 1.38, 1.28, 1.72],
                        opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                        rotate: [0, -3, 2, -2, 2, -3, 3, 0],
                      }
                }
                exit={
                  reducedMotion
                    ? { opacity: 0, transition: { duration: 0.25 } }
                    : {
                        scale: 2.6,
                        opacity: 0,
                        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                      }
                }
                transition={{
                  duration: reducedMotion ? 0.35 : 2.5,
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

        {/* Radial explosion shockwave + scattered hearts & petals */}
        {phase !== 'growing' && !reducedMotion && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ duration: 0.72, ease: GENTLE_EASE }}
              className="absolute h-28 w-28 rounded-full border-4 border-blush"
            />
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: GENTLE_EASE }}
              className="absolute h-28 w-28 rounded-full border-2 border-sage-400"
            />

            {BURST_SHARDS.map((shard) => {
              const rad = (shard.angleDeg * Math.PI) / 180;
              const tx = Math.cos(rad) * shard.distance;
              const ty = Math.sin(rad) * shard.distance;
              return (
                <motion.span
                  key={shard.id}
                  aria-hidden="true"
                  initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
                  animate={{
                    x: tx,
                    y: ty + 18,
                    scale: [0.3, shard.scale, shard.scale * 0.6],
                    opacity: [1, 1, 0],
                    rotate: shard.angleDeg + 90,
                  }}
                  transition={{
                    duration: 1.05,
                    delay: shard.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute"
                >
                  {shard.kind === 'heart' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <path
                        d="M12 21s-7.5-4.7-7.5-10.3A4.5 4.5 0 0 1 9 6.2c1.4 0 2.4.7 3 1.7.6-1 1.6-1.7 3-1.7a4.5 4.5 0 0 1 4.5 4.5C19.5 16.3 12 21 12 21z"
                        fill={shard.color}
                      />
                    </svg>
                  ) : shard.kind === 'petal' ? (
                    <span
                      className="block h-3 w-2 rounded-full"
                      style={{ backgroundColor: shard.color }}
                    />
                  ) : (
                    <span
                      className="block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: shard.color }}
                    />
                  )}
                </motion.span>
              );
            })}
          </div>
        )}
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
        transition={{ duration: reducedMotion ? 0.25 : 0.72, delay: phase === 'growing' ? 0.2 : 0, ease: GENTLE_EASE }}
        className="relative z-10 mt-2 max-w-md font-display text-2xl font-semibold leading-snug text-sage-900 sm:text-3xl"
      >
        {content.welcomeSplash.dedicationText}
      </motion.p>
    </motion.div>
  );
}
