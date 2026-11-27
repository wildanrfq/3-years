import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Disc3, Pause, Sparkles, X } from 'lucide-react';
import { content, RewindSlide, SECTION_ORDER, SectionId } from '../../config/content';
import { assetUrl } from '../../lib/assets';
import { getElapsedSince } from '../../lib/date';
import { GENTLE_EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SquishyButton } from '../../components/SquishyButton';
import { GreenFlower } from '../../components/GreenFlower';

interface RewindSectionProps {
  onBackToHub: () => void;
  onNavigateSection: (next: SectionId) => void;
}

const SLIDE_DURATION_MS = 15000;

const SLIDE_BACKGROUNDS = [
  'from-sage-100 via-sage-50 to-sage-200',
  'from-sage-200/80 via-sage-100 to-blush/35',
  'from-sage-100 via-cream to-sage-200/85',
  'from-sage-200/75 via-sage-50 to-sage-300/60',
  'from-blush/35 via-sage-100 to-sage-200/80',
  'from-sage-100 via-sage-200/70 to-sage-50',
  'from-sage-200/85 via-cream to-blush/40',
  'from-sage-100 via-blush/30 to-sage-200',
];

export default function RewindSection({
  onBackToHub,
  onNavigateSection,
}: RewindSectionProps) {
  const reducedMotion = useReducedMotion();
  const slides = content.rewind;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isHeldPaused, setIsHeldPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);

  const progressRef = useRef(0);
  const holdTimerRef = useRef<number | null>(null);
  const didHoldRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const isPaused = isHeldPaused || manualPaused || reducedMotion;
  const currentSlide = slides[index];
  const totalDays = useMemo(() => getElapsedSince(content.startDate, new Date()).totalDays, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
    progressRef.current = 0;
    setProgress(0);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev > 0 ? prev - 1 : 0));
    progressRef.current = 0;
    setProgress(0);
  }, []);

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (isPaused || index >= slides.length - 1) return;

    let lastTs = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = now - lastTs;
      lastTs = now;
      const nextProgress = Math.min(1, progressRef.current + dt / SLIDE_DURATION_MS);
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        goNext();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [goNext, index, isPaused, slides.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setManualPaused((p) => !p);
      } else if (e.key === 'Escape') {
        onBackToHub();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onBackToHub]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    didHoldRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    holdTimerRef.current = window.setTimeout(() => {
      didHoldRef.current = true;
      setIsHeldPaused(true);
    }, 170);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (isHeldPaused) {
      setIsHeldPaused(false);
    }

    if (!start || (e.target as HTMLElement).closest('button')) return;

    const dy = e.clientY - start.y;
    const dx = Math.abs(e.clientX - start.x);

    if (dy > 68 && dy > dx * 1.2) {
      onBackToHub();
      return;
    }

    if (didHoldRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.34) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handlePointerCancel = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    pointerStartRef.current = null;
    setIsHeldPaused(false);
  };

  const bgGradient = SLIDE_BACKGROUNDS[index % SLIDE_BACKGROUNDS.length];

  return (
    <main className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-3 pb-24 pt-20 sm:px-6 sm:pt-14">
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ perspective: '1100px' }}
        className={`relative flex h-[min(600px,calc(100dvh-11.5rem))] min-h-[390px] w-[min(390px,calc(100vw-24px))] select-none flex-col overflow-hidden rounded-[32px] border border-sage-200/90 bg-gradient-to-b ${bgGradient} shadow-sage-lg touch-pan-x`}
      >
        <GreenFlower
          variant="rosette"
          className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 opacity-20"
        />
        {/* Gumpalan cahaya latar animasi */}
        {!reducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              animate={{ x: [0, 20, -10, 0], y: [0, -16, 12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -right-14 top-16 h-48 w-48 rounded-full bg-blush/35 blur-2xl"
            />
            <motion.div
              aria-hidden="true"
              animate={{ x: [0, -16, 12, 0], y: [0, 14, -14, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -left-16 bottom-16 h-52 w-52 rounded-full bg-sage-300/45 blur-2xl"
            />
          </>
        )}

        {/* Bar progres segmen dan tombol kontrol atas */}
        <div className="relative z-20 shrink-0 px-4 pt-4">
          <div className="flex gap-1.5" role="progressbar" aria-valuenow={index + 1} aria-valuemax={slides.length}>
            {slides.map((_, idx) => {
              const fill = idx < index ? 1 : idx === index ? progress : 0;
              return (
                <div
                  key={idx}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-sage-900/15"
                >
                  <div
                    className="h-full rounded-full bg-sage-700 transition-none"
                    style={{ width: `${Math.round(fill * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-cream/85 px-2.5 py-1 text-[11px] font-bold text-sage-800 shadow-sage-sm">
              {(isHeldPaused || manualPaused) && <Pause className="h-3 w-3" aria-hidden="true" />}
              <span>
                {index + 1} / {slides.length}
              </span>
            </span>

            <button
              type="button"
              onClick={onBackToHub}
              aria-label="close rewind"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-cream/85 text-sage-800 shadow-sage-sm transition hover:bg-cream"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Konten slide aman tanpa terpotong di layar pendek */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: direction > 0 ? 12 : -12, x: direction > 0 ? 18 : -18, scale: 0.98 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, rotateY: 0, x: 0, scale: 1 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: direction > 0 ? -12 : 12, x: direction > 0 ? -18 : 18, scale: 0.98 }
              }
              transition={{ duration: reducedMotion ? 0.25 : 0.62, ease: GENTLE_EASE }}
              style={{ transformStyle: 'preserve-3d' }}
              className="my-auto flex w-full flex-col items-center text-center"
            >
              <SlideBody
                slide={currentSlide}
                totalDays={totalDays}
                paused={isPaused}
                reducedMotion={reducedMotion}
                onGoToNext={() => {
                  const nextIdx = SECTION_ORDER.indexOf('rewind') + 1;
                  const next = SECTION_ORDER[nextIdx] ?? 'photocards';
                  onNavigateSection(next);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function SlideBody({
  slide,
  totalDays,
  paused,
  reducedMotion,
  onGoToNext,
}: {
  slide: RewindSlide;
  totalDays: number;
  paused: boolean;
  reducedMotion: boolean;
  onGoToNext: () => void;
}) {
  if (slide.type === 'intro') {
    return (
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-cream/90 px-3.5 py-1 text-xs font-bold text-sage-700 shadow-sage-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{slide.eyebrow}</span>
        </span>
        <h2 className="font-display text-3xl font-semibold leading-tight text-sage-900">
          {slide.title}
        </h2>
        <p className="text-sm leading-relaxed text-sage-800">{slide.subtitle}</p>
      </div>
    );
  }

  if (slide.type === 'countup') {
    return (
      <div className="space-y-3">
        <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
          {slide.eyebrow}
        </span>
        <div className="font-display text-6xl font-bold tabular-nums text-sage-900">
          <CountUpNumber target={totalDays} reducedMotion={reducedMotion} />
        </div>
        <p className="text-base font-bold text-sage-800">{slide.label}</p>
        <p className="text-xs leading-relaxed text-sage-700">{slide.subtitle}</p>
      </div>
    );
  }

  if (slide.type === 'photo') {
    return (
      <div className="flex w-full flex-col items-center space-y-3">
        <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
          {slide.eyebrow}
        </span>
        <div className="inline-flex max-h-[min(240px,36dvh)] max-w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-cream bg-sage-100 shadow-sage-md">
          <img
            src={assetUrl(slide.photo)}
            alt={slide.caption}
            className="block max-h-[min(232px,34dvh)] w-auto max-w-full object-contain"
          />
        </div>
        <div className="px-1">
          <p className="font-display text-base font-semibold leading-snug text-sage-900 sm:text-lg">
            {slide.caption}
          </p>
          <p className="mt-1 text-xs font-semibold text-sage-700">{slide.date}</p>
        </div>
      </div>
    );
  }

  if (slide.type === 'stat') {
    const val =
      slide.statSource === 'photocards'
        ? content.photoCards.length
        : slide.customValue ?? 0;

    return (
      <div className="space-y-3">
        <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
          {slide.eyebrow}
        </span>
        <div className="font-display text-6xl font-bold tabular-nums text-sage-900">
          <CountUpNumber target={val} reducedMotion={reducedMotion} />
        </div>
        <div className="text-sm font-bold lowercase tracking-wider text-sage-700">
          {slide.unit}
        </div>
        <h2 className="pt-1 font-display text-2xl font-semibold text-sage-900">{slide.title}</h2>
        <p className="text-xs leading-relaxed text-sage-700">{slide.subtitle}</p>
      </div>
    );
  }

  if (slide.type === 'carousel') {
    return (
      <div className="flex w-full flex-col items-center space-y-4">
        <div>
          <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
            {slide.eyebrow}
          </span>
          <h2 className="mt-1 font-display text-2xl font-semibold text-sage-900">
            {slide.title}
          </h2>
        </div>

        <Carousel3D photos={slide.photos} paused={paused} reducedMotion={reducedMotion} />
      </div>
    );
  }

  if (slide.type === 'ranking') {
    return (
      <div className="w-full space-y-3 text-left">
        <div className="text-center">
          <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
            {slide.eyebrow}
          </span>
          <h2 className="mt-0.5 font-display text-xl font-semibold leading-snug text-sage-900 sm:text-2xl">
            {slide.title}
          </h2>
        </div>

        <ol className="space-y-1.5">
          {slide.items.map((item, i) => (
            <motion.li
              key={item}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: reducedMotion ? 0 : 0.1 * i,
                duration: reducedMotion ? 0.25 : 0.58,
                ease: GENTLE_EASE,
              }}
              className="flex items-center gap-2.5 rounded-2xl border border-sage-200 bg-cream/90 px-3 py-2 shadow-sage-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-600 font-display text-xs font-bold text-[#FBF8EF]">
                {i + 1}
              </span>
              <span className="text-xs font-bold leading-snug text-sage-900">{item}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    );
  }

  if (slide.type === 'song') {
    return (
      <div className="flex flex-col items-center space-y-3.5">
        <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
          {slide.eyebrow}
        </span>

        <motion.div
          animate={reducedMotion || paused ? undefined : { rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-sage-300 bg-[#2B3827] shadow-sage-lg sm:h-36 sm:w-36"
        >
          <div className="h-24 w-24 rounded-full border border-sage-500/50" />
          <div className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-blush ring-4 ring-[#E6EDE1] sm:h-14 sm:w-14">
            <Disc3 className="h-5 w-5 text-[#2B3827]" aria-hidden="true" />
          </div>
        </motion.div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-sage-900">
            {content.song.title}
          </h2>
          <p className="text-sm font-bold text-sage-700">{content.song.artist}</p>
        </div>
        <p className="max-w-[260px] text-xs leading-relaxed text-sage-700">{slide.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <span className="text-xs font-bold lowercase tracking-wider text-sage-700">
        {slide.eyebrow}
      </span>
      <h2 className="font-display text-3xl font-semibold text-sage-900">{slide.title}</h2>
      <p className="max-w-[260px] text-sm leading-relaxed text-sage-800">{slide.subtitle}</p>
      <SquishyButton onClick={onGoToNext} className="mt-2">
        <span>{slide.ctaLabel}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </SquishyButton>
    </div>
  );
}

function CountUpNumber({
  target,
  reducedMotion,
}: {
  target: number;
  reducedMotion: boolean;
}) {
  const [val, setVal] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setVal(target);
      return;
    }

    const start = performance.now();
    const duration = 1500;
    let rafId = 0;

    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, target]);

  return <span>{val.toLocaleString('en-US')}</span>;
}

function Carousel3D({
  photos,
  paused,
  reducedMotion,
}: {
  photos: string[];
  paused: boolean;
  reducedMotion: boolean;
}) {
  const count = photos.length;
  const stepAngle = 360 / Math.max(1, count);

  return (
    <div
      className="relative flex h-48 w-full items-center justify-center sm:h-52"
      style={{ perspective: '850px' }}
    >
      <motion.div
        animate={reducedMotion || paused ? undefined : { rotateY: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="relative h-32 w-28 sm:h-36"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {photos.map((photo, idx) => (
          <div
            key={`${photo}-${idx}`}
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-cream bg-sage-100 shadow-sage-md"
            style={{
              transform: `rotateY(${idx * stepAngle}deg) translateZ(105px)`,
            }}
          >
            <img
              src={assetUrl(photo)}
              alt={`gallery photo ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
