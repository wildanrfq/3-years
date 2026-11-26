import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Gift,
  Heart,
  Lock,
  MapPin,
  RotateCcw,
  Sparkles,
  Sun,
} from 'lucide-react';
import { content, SectionId, TimelineIconName, TimelineItem } from '../../config/content';
import { assetUrl } from '../../lib/assets';
import { GENTLE_EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SectionShell } from '../../components/SectionShell';
import { SquishyButton } from '../../components/SquishyButton';
import { Mascot } from '../../components/Mascot';

interface TimelineSectionProps {
  initialRevealedCount?: number;
  onRevealedCountChange?: (count: number) => void;
  onComplete?: () => void;
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}

const ICON_MAP: Record<TimelineIconName, ReactNode> = {
  heart: <Heart className="h-4 w-4" aria-hidden="true" />,
  coffee: <Coffee className="h-4 w-4" aria-hidden="true" />,
  'map-pin': <MapPin className="h-4 w-4" aria-hidden="true" />,
  sparkles: <Sparkles className="h-4 w-4" aria-hidden="true" />,
  sun: <Sun className="h-4 w-4" aria-hidden="true" />,
  gift: <Gift className="h-4 w-4" aria-hidden="true" />,
};

export default function TimelineSection({
  initialRevealedCount = 1,
  onRevealedCountChange,
  onComplete,
  onBackToHub,
  onNextSection,
}: TimelineSectionProps) {
  const reducedMotion = useReducedMotion();
  const total = content.timeline.length;

  const [revealedCount, setRevealedCount] = useState(() =>
    Math.max(1, Math.min(total, initialRevealedCount))
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, Math.min(total, initialRevealedCount) - 1)
  );
  const [revealPulse, setRevealPulse] = useState(0);
  const [trackX, setTrackX] = useState<{ x: number; animate: boolean }>({
    x: 0,
    animate: false,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathWrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const heartRef = useRef<HTMLDivElement | null>(null);
  const cardElsRef = useRef<(HTMLLIElement | null)[]>([]);
  const prevProgressRef = useRef(0);
  const hasMountedRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const allRevealed = revealedCount >= total;
  const visibleItems = content.timeline.slice(0, revealedCount);
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < total - 1;
  const nextWillReveal = activeIndex === revealedCount - 1 && !allRevealed;

  useEffect(() => {
    if (allRevealed) {
      onCompleteRef.current?.();
    }
  }, [allRevealed]);

  const computeCenteredTrackX = useCallback(() => {
    const viewport = viewportRef.current;
    const card = cardElsRef.current[activeIndex];
    if (!viewport || !card) return null;

    const viewportCenter = viewport.clientWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    return viewportCenter - cardCenter;
  }, [activeIndex]);

  useLayoutEffect(() => {
    const nextX = computeCenteredTrackX();
    if (nextX === null) return;

    const shouldAnimate = hasMountedRef.current;
    hasMountedRef.current = true;
    setTrackX({ x: nextX, animate: shouldAnimate });
  }, [computeCenteredTrackX, revealedCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      const nextX = computeCenteredTrackX();
      if (nextX !== null) {
        setTrackX({ x: nextX, animate: false });
      }
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [computeCenteredTrackX]);

  useEffect(() => {
    const pathWrap = pathWrapRef.current;
    const pathEl = pathRef.current;
    const heartEl = heartRef.current;
    const activeCard = cardElsRef.current[activeIndex];
    if (!pathWrap || !pathEl || !heartEl) return;

    pathEl.style.strokeDasharray = '1';

    const setPathAtProgress = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      pathEl.style.strokeDashoffset = `${1 - clamped}`;
      heartEl.style.left = `${clamped * 100}%`;
    };

    let targetProgress = 0.25;
    if (activeCard && pathWrap.offsetWidth > 0) {
      const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
      targetProgress = Math.min(
        1,
        Math.max(0, (cardCenter - pathWrap.offsetLeft) / pathWrap.offsetWidth)
      );
    }

    if (reducedMotion) {
      setPathAtProgress(targetProgress);
      prevProgressRef.current = targetProgress;
      return;
    }

    const proxy = { p: prevProgressRef.current };
    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        p: targetProgress,
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          setPathAtProgress(proxy.p);
          prevProgressRef.current = proxy.p;
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeIndex, revealedCount, allRevealed, reducedMotion]);

  const fireGentleConfetti = (originEl: HTMLElement | null, isFinal: boolean) => {
    if (reducedMotion) return;
    let originX = 0.5;
    let originY = 0.55;
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = Math.min(0.85, (rect.top + rect.height / 2) / window.innerHeight);
    }

    confetti({
      particleCount: isFinal ? 30 : 14,
      spread: isFinal ? 70 : 48,
      startVelocity: 18,
      gravity: 0.72,
      ticks: 220,
      origin: { x: originX, y: originY },
      colors: ['#7F9C70', '#B5C7AA', '#F2CFC4', '#FBF8EF'],
      scalar: 0.82,
    });
  };

  const revealNext = (originEl: HTMLElement | null) => {
    if (allRevealed) return;

    const nextCount = Math.min(total, revealedCount + 1);
    setRevealedCount(nextCount);
    setActiveIndex(nextCount - 1);
    onRevealedCountChange?.(nextCount);
    setRevealPulse((k) => k + 1);
    fireGentleConfetti(originEl, nextCount === total);
  };

  const handleRevealNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    revealNext(e.currentTarget);
  };

  const handlePrev = () => {
    if (!canGoPrev) return;
    setActiveIndex((idx) => Math.max(0, idx - 1));
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeIndex < revealedCount - 1) {
      setActiveIndex((idx) => Math.min(revealedCount - 1, idx + 1));
      return;
    }
    if (!allRevealed) {
      revealNext(e.currentTarget);
    }
  };

  const handleSwipeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleSwipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

    if (dx > 0) {
      handlePrev();
    } else if (activeIndex < revealedCount - 1) {
      setActiveIndex((idx) => Math.min(revealedCount - 1, idx + 1));
    } else if (!allRevealed) {
      revealNext(viewportRef.current);
    }
  };

  const handleRestartTimeline = () => {
    prevProgressRef.current = 0;
    setRevealedCount(1);
    setActiveIndex(0);
    onRevealedCountChange?.(1);
    setRevealPulse(0);
  };

  return (
    <SectionShell
      section="timeline"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
      hideFooterCta={!allRevealed}
      wide
    >
      {/* Indikator progres tanpa spoiler */}
      <div className="mb-4 flex flex-col items-center gap-3">
        <div className="w-full max-w-xs rounded-2xl border border-sage-200 bg-cream px-4 py-2.5 shadow-sage-sm">
          <div className="flex items-center justify-between text-xs font-bold text-sage-800">
            <span>{content.timelineUi.progressLabel}</span>
            <span className="tabular-nums text-sage-600">
              {revealedCount} / {total}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sage-100">
            <motion.div
              className="h-full rounded-full bg-sage-500"
              initial={false}
              animate={{ width: `${(revealedCount / total) * 100}%` }}
              transition={{ duration: reducedMotion ? 0.25 : 0.9, ease: GENTLE_EASE }}
            />
          </div>
        </div>
      </div>

      {/* Stage timeline horizontal terpusat tanpa scrollbar */}
      <div
        ref={viewportRef}
        onPointerDown={handleSwipeStart}
        onPointerUp={handleSwipeEnd}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        className="touch-pan-y relative -mx-4 overflow-hidden py-2 sm:-mx-6"
      >
        {/* Pudar halus di tepi kiri & kanan */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-sage-50 to-transparent sm:w-12"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-5 bg-gradient-to-l from-sage-50 to-transparent sm:w-12"
        />

        <motion.div
          ref={containerRef}
          initial={false}
          animate={{ x: trackX.x }}
          transition={
            trackX.animate && !reducedMotion
              ? { duration: 0.95, ease: GENTLE_EASE }
              : { duration: 0 }
          }
          className="relative flex w-max items-stretch pb-8 pt-14"
        >
          {/* Garis jalur SVG horizontal lurus sejajar dengan simpul kartu */}
          <div
            ref={pathWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-10 right-10 top-4 h-8"
          >
            <svg
              viewBox="0 0 1000 32"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              <path
                d="M 0 16 L 1000 16"
                fill="none"
                stroke="var(--sage-200)"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 7"
              />
              <path
                ref={pathRef}
                d="M 0 16 L 1000 16"
                fill="none"
                stroke="var(--sage-500)"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              ref={heartRef}
              className="absolute top-1/2 z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sage-400 bg-cream shadow-sage-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M12 21s-7-4.6-7-10.2A4.3 4.3 0 0 1 9.3 6.5c1.2 0 2.2.6 2.7 1.5.5-.9 1.5-1.5 2.7-1.5A4.3 4.3 0 0 1 19 10.8C19 16.4 12 21 12 21z"
                  fill="#F2CFC4"
                  stroke="#647F57"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
          </div>

          <ol className="relative flex items-stretch gap-5 sm:gap-6">
            <AnimatePresence initial={false}>
              {visibleItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <TimelineCard
                    key={`${item.date}-${idx}`}
                    item={item}
                    index={idx}
                    isActive={isActive}
                    reducedMotion={reducedMotion}
                    setCardRef={(el) => {
                      cardElsRef.current[idx] = el;
                    }}
                  />
                );
              })}
            </AnimatePresence>

            {!allRevealed && (
              <li className="relative flex w-[250px] shrink-0 items-stretch sm:w-[280px]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[-24px] z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-sage-400 bg-sage-50"
                />
                <motion.button
                  type="button"
                  onClick={handleRevealNext}
                  whileHover={reducedMotion ? undefined : { y: -2, scale: 1.01 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reducedMotion ? 0.25 : 0.75, ease: GENTLE_EASE }}
                  className="focus-ring group flex w-full flex-col items-center justify-center gap-3.5 rounded-[26px] border-2 border-dashed border-sage-300 bg-cream/85 p-6 text-center shadow-sage-sm transition-colors duration-500 hover:border-sage-400 hover:bg-cream"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-100 text-sage-700 shadow-sage-sm transition-transform duration-500 group-hover:scale-105">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="rounded-pill bg-sage-100 px-2.5 py-1 text-[11px] font-bold text-sage-700">
                      #{revealedCount + 1}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-semibold text-sage-900">
                      {content.timelineUi.nextCardTitle}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-sage-700">
                      {content.timelineUi.nextCardSubtitle}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-sage-600 px-4 py-2 text-xs font-bold text-[#FBF8EF] shadow-sage-sm transition-colors duration-300 group-hover:bg-sage-500">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{content.timelineUi.nextCardButton}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </motion.button>
              </li>
            )}
          </ol>
        </motion.div>
      </div>

      {/* Tombol navigasi Sebelum & Berikut */}
      <div className="mt-2 flex flex-col items-center gap-5 text-center">
        <div className="flex items-center justify-center gap-3">
          <SquishyButton
            variant="secondary"
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="previous moment"
            className="px-4 py-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{content.timelineUi.prevButton}</span>
          </SquishyButton>

          <span
            aria-live="polite"
            className="min-w-[60px] text-center text-xs font-bold tabular-nums text-sage-700"
          >
            {activeIndex + 1} / {total}
          </span>

          <SquishyButton
            variant={nextWillReveal ? 'primary' : 'secondary'}
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label={nextWillReveal ? 'open next moment' : 'next moment'}
            className="px-4 py-2 text-xs"
          >
            {nextWillReveal && <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{content.timelineUi.nextButton}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </SquishyButton>
        </div>

        {!allRevealed ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.25 : 0.7, ease: GENTLE_EASE }}
            className="relative inline-flex items-center gap-1.5 rounded-pill border border-dashed border-sage-300 bg-cream/85 px-4 py-2 text-xs font-bold text-sage-700 shadow-sage-sm"
          >
            <AnimatePresence>
              {revealPulse > 0 && !reducedMotion && (
                <motion.div
                  key={revealPulse}
                  initial={{ scale: 0.85, opacity: 0.55 }}
                  animate={{ scale: 1.35, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.95, ease: GENTLE_EASE }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-pill border-2 border-sage-400"
                />
              )}
            </AnimatePresence>

            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {content.timelineUi.hiddenRemainingText.replace(
                '{remaining}',
                String(total - revealedCount)
              )}
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.3 : 0.8, ease: GENTLE_EASE }}
            className="flex flex-col items-center gap-3"
          >
            <Mascot
              mood="cheering"
              size="sm"
              message={content.timelineUi.allOpenedMascot}
            />
            <SquishyButton
              variant="secondary"
              onClick={handleRestartTimeline}
              className="px-4 py-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{content.timelineUi.restartButton}</span>
            </SquishyButton>
          </motion.div>
        )}
      </div>
    </SectionShell>
  );
}

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  isActive: boolean;
  reducedMotion: boolean;
  setCardRef: (el: HTMLLIElement | null) => void;
}

function TimelineCard({
  item,
  index,
  isActive,
  reducedMotion,
  setCardRef,
}: TimelineCardProps) {
  const isBlurred = !isActive;
  const stickerKind = index % 3;

  const initialVariant = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, x: 24 };

  const animateVariant = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0 };

  const transition = {
    duration: reducedMotion ? 0.3 : 0.95,
    ease: GENTLE_EASE,
  };

  return (
    <li
      ref={setCardRef}
      className="relative flex w-[280px] shrink-0 items-stretch sm:w-[310px]"
    >
      {/* Titik simpul sejajar di jalur horizontal */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[-24px] z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-500 ease-out ${
          isBlurred
            ? 'scale-100 border-sage-300 bg-sage-200 opacity-100'
            : 'scale-75 border-sage-500 bg-sage-600 opacity-0'
        }`}
      />

      <motion.div
        initial={initialVariant}
        animate={animateVariant}
        transition={transition}
        className="flex w-full"
      >
        <article
          data-blurred={isBlurred ? 'true' : 'false'}
          aria-current={isActive ? 'step' : undefined}
          className={`relative flex w-full flex-col rounded-[26px] bg-cream p-5 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isBlurred
              ? `${reducedMotion ? '' : 'scale-[0.94] '}select-none border border-sage-200/70 opacity-55 shadow-sage-sm blur-[5px]`
              : 'scale-100 border-2 border-sage-500 opacity-100 shadow-sage-lg ring-4 ring-sage-300/35 blur-0'
          }`}
        >
          <DoodleSticker
            kind={stickerKind}
            reducedMotion={reducedMotion}
            className="-right-2.5 -top-2.5"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-700 ${
                  isBlurred
                    ? 'bg-sage-100 text-sage-600'
                    : 'bg-sage-600 text-[#FBF8EF] shadow-sage-sm'
                }`}
              >
                {item.icon ? ICON_MAP[item.icon] : <Heart className="h-4 w-4" aria-hidden="true" />}
              </span>
              <time className="text-xs font-bold lowercase tracking-wide text-sage-600">
                {item.date}
              </time>
            </div>

            <span
              className={`rounded-pill px-2.5 py-0.5 text-[11px] font-bold transition-colors duration-700 ${
                isBlurred
                  ? 'bg-sage-100 text-sage-600'
                  : 'bg-sage-600 text-[#FBF8EF] shadow-sage-sm'
              }`}
            >
              #{index + 1}
            </span>
          </div>

          <h2 className="mt-2.5 font-display text-xl font-semibold text-sage-900">
            {item.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-sage-700">
            {item.description}
          </p>

          {item.photo && (
            <div className="mt-auto flex justify-center pt-3.5">
              <div className="inline-flex max-h-48 max-w-full overflow-hidden rounded-2xl border border-sage-200/80 bg-sage-100">
                <img
                  src={assetUrl(item.photo)}
                  alt={item.title}
                  className="block max-h-48 w-auto max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </article>
      </motion.div>
    </li>
  );
}

function DoodleSticker({
  kind,
  reducedMotion,
  className,
}: {
  kind: number;
  reducedMotion: boolean;
  className: string;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={reducedMotion ? undefined : { rotate: [-4, 4, -4] }}
      transition={{ duration: 5.2 + kind * 0.7, repeat: Infinity, ease: 'easeInOut' }}
      className={`pointer-events-none absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border border-sage-200 bg-cream shadow-sage-sm ${className}`}
    >
      {kind === 0 && (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-sage-600">
          <path d="M5 19 C6 10 12 6 19 5 C19 12 15 18 5 19 Z" fill="currentColor" />
        </svg>
      )}
      {kind === 1 && (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blush">
          <path
            d="M12 3 L14.4 9.2 L21 10 L16 14.3 L17.4 21 L12 17.4 L6.6 21 L8 14.3 L3 10 L9.6 9.2 Z"
            fill="currentColor"
            stroke="#647F57"
            strokeWidth="1.2"
          />
        </svg>
      )}
      {kind === 2 && (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="7" r="3" fill="#F2CFC4" />
          <circle cx="17" cy="12" r="3" fill="#F2CFC4" />
          <circle cx="12" cy="17" r="3" fill="#F2CFC4" />
          <circle cx="7" cy="12" r="3" fill="#F2CFC4" />
          <circle cx="12" cy="12" r="2.6" fill="#7F9C70" />
        </svg>
      )}
    </motion.div>
  );
}
