import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Delete, HelpCircle, Lock, LockOpen } from 'lucide-react';
import { Mascot, MascotMood } from '../../components/Mascot';
import { HintBubble } from '../../components/HintBubble';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GENTLE_EASE } from '../../lib/motion';
import { ThemeMode } from '../../hooks/useTheme';
import { verifyPin } from '../../lib/pin';

const AmbientScene = lazy(() => import('../../three/AmbientScene'));

interface PinGateProps {
  partnerName: string;
  pinLength: number;
  pinHash: string;
  pinHint: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onAuthSuccess: () => void;
  onUnlock: () => void;
}

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
] as const;

export function PinGate({
  partnerName,
  pinLength,
  pinHash,
  pinHint,
  theme,
  onToggleTheme,
  onAuthSuccess,
  onUnlock,
}: PinGateProps) {
  const reducedMotion = useReducedMotion();
  const [digits, setDigits] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'unlocked'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const fireHeartBurst = useCallback(() => {
    if (reducedMotion) return;
    try {
      const heart = confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
      });
      confetti({
        particleCount: 38,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#7F9C70', '#9CB38E', '#F2CFC4', '#FBF8EF'],
        shapes: [heart, 'circle'],
        scalar: 1.1,
      });
    } catch {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#7F9C70', '#9CB38E', '#F2CFC4'],
      });
    }
  }, [reducedMotion]);

  const submitPin = useCallback(
    async (candidate: string) => {
      setStatus('checking');
      const ok = await verifyPin(candidate, pinHash);
      if (ok) {
        setStatus('unlocked');
        onAuthSuccess();
        fireHeartBurst();
        window.setTimeout(() => {
          onUnlock();
        }, reducedMotion ? 280 : 1080);
      } else {
        setStatus('error');
        setErrorCount((c) => c + 1);
        setShowHint(true);
        window.setTimeout(() => {
          setDigits('');
          setStatus('idle');
        }, 480);
      }
    },
    [fireHeartBurst, onAuthSuccess, onUnlock, pinHash, reducedMotion]
  );

  const handleDigit = useCallback(
    (num: string) => {
      if (status === 'checking' || status === 'unlocked') return;
      setDigits((prev) => {
        if (prev.length >= pinLength) return prev;
        const next = prev + num;
        if (next.length === pinLength) {
          void submitPin(next);
        }
        return next;
      });
    },
    [pinLength, status, submitPin]
  );

  const handleBackspace = useCallback(() => {
    if (status === 'checking' || status === 'unlocked') return;
    setDigits((prev) => prev.slice(0, -1));
  }, [status]);

  const handleClear = useCallback(() => {
    if (status === 'checking' || status === 'unlocked') return;
    setDigits('');
  }, [status]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackspace, handleClear, handleDigit]);

  const mood: MascotMood =
    status === 'unlocked'
      ? 'excited'
      : status === 'error'
      ? 'sad'
      : 'sleepy';

  const mascotMessage =
    status === 'unlocked'
      ? 'Yeay, kebuka!'
      : status === 'error'
      ? 'Ups, bukan itu kodenya'
      : errorCount > 0
      ? 'Coba lihat petunjuknya ya'
      : undefined;

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-b from-sage-100 via-sage-50 to-sage-100 px-4 py-8">
      <Suspense fallback={null}>
        <AmbientScene theme={theme} variant="gate" />
      </Suspense>

      <div className="pt-safe fixed right-3 top-3 z-40 sm:right-5 sm:top-5">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} showLabel />
      </div>
      {/* Lingkaran cahaya lembut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sage-200/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-4 h-72 w-72 rounded-full bg-blush/35 blur-3xl"
      />

      {/* Efek riak sage saat PIN benar */}
      <AnimatePresence>
        {status === 'unlocked' && (
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0.65 }}
            animate={{ scale: 28, opacity: 0.95 }}
            transition={{ duration: reducedMotion ? 0.25 : 1.15, ease: GENTLE_EASE }}
            className="pointer-events-none fixed left-1/2 top-1/2 z-40 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage-300/90"
          />
        )}
      </AnimatePresence>

      <motion.section
        aria-label="Gerbang PIN"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.25 : 0.72, ease: GENTLE_EASE }}
        className="relative z-10 w-full max-w-[360px] rounded-[32px] border border-sage-200/90 bg-cream/95 p-6 text-center shadow-sage-lg"
      >
        <div className="flex flex-col items-center">
          <Mascot mood={mood} size="md" message={mascotMessage} />

          {/* Ikon gembok animasi */}
          <motion.div
            animate={
              status === 'unlocked'
                ? { scale: [1, 1.2, 1], rotate: [0, -8, 6, 0] }
                : status === 'error'
                ? { x: [0, -6, 6, -4, 4, 0] }
                : undefined
            }
            transition={{ duration: 0.4 }}
            className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-700 shadow-sage-sm"
            aria-hidden="true"
          >
            {status === 'unlocked' ? (
              <LockOpen className="h-5 w-5 text-sage-700" />
            ) : (
              <Lock className="h-5 w-5 text-sage-700" />
            )}
          </motion.div>

          <h1 className="mt-3 font-display text-2xl font-semibold text-sage-900">
            Hai, {partnerName}
          </h1>
          <p className="mt-1 text-sm text-sage-700">
            Masukkan {pinLength} angka rahasia kita dulu ya.
          </p>
        </div>

        {/* Titik PIN */}
        <motion.div
          animate={
            status === 'error' && !reducedMotion
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.42 }}
          className="mt-5 flex items-center justify-center gap-3"
          role="status"
          aria-live="polite"
          aria-label={`Sudah terisi ${digits.length} dari ${pinLength} angka`}
        >
          {Array.from({ length: pinLength }).map((_, idx) => {
            const filled = idx < digits.length;
            const isError = status === 'error';
            return (
              <motion.span
                key={idx}
                animate={
                  filled
                    ? { scale: [0.85, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.35, ease: GENTLE_EASE }}
                className={`h-4 w-4 rounded-full border-2 transition-colors duration-300 ${
                  isError
                    ? 'border-rose-400 bg-blush'
                    : filled
                    ? 'border-sage-600 bg-sage-600'
                    : 'border-sage-300 bg-sage-50'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Petunjuk saat salah atau diminta */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.45, ease: GENTLE_EASE }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-sage-200 bg-sage-100/80 px-3.5 py-2 text-xs font-semibold text-sage-800">
                Petunjuk: {pinHint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keypad custom di layar */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {KEYPAD_ROWS.flat().map((key) => {
            if (key === 'clear') {
              return (
                <button
                  key="clear"
                  type="button"
                  onClick={handleClear}
                  disabled={digits.length === 0 || status === 'unlocked'}
                  className="focus-ring flex min-h-[54px] items-center justify-center rounded-2xl bg-sage-100/80 text-xs font-bold text-sage-700 transition hover:bg-sage-200/70 active:scale-95 disabled:opacity-40"
                >
                  Ulang
                </button>
              );
            }

            if (key === 'backspace') {
              return (
                <button
                  key="backspace"
                  type="button"
                  onClick={handleBackspace}
                  disabled={digits.length === 0 || status === 'unlocked'}
                  aria-label="Hapus satu angka"
                  className="focus-ring flex min-h-[54px] items-center justify-center rounded-2xl bg-sage-100/80 text-sage-700 transition hover:bg-sage-200/70 active:scale-95 disabled:opacity-40"
                >
                  <Delete className="h-5 w-5" aria-hidden="true" />
                </button>
              );
            }

            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => handleDigit(key)}
                disabled={status === 'unlocked'}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                transition={{ duration: 0.22, ease: GENTLE_EASE }}
                className="focus-ring flex min-h-[54px] items-center justify-center rounded-2xl border border-sage-200/90 bg-sage-50 font-display text-2xl font-semibold text-sage-900 shadow-sage-sm transition hover:bg-sage-100 active:bg-sage-200/70"
              >
                {key}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill px-3 text-xs font-semibold text-sage-600 transition hover:bg-sage-100 hover:text-sage-800"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lupa kodenya? Lihat petunjuk</span>
            </button>
          ) : (
            <HintBubble>Ketuk angka di atas untuk membuka</HintBubble>
          )}
        </div>
      </motion.section>
    </div>
  );
}
