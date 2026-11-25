import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import {
  ArrowDown,
  Coffee,
  Gift,
  Heart,
  Lock,
  MapPin,
  Sparkles,
  Sun,
} from 'lucide-react';
import { content, SectionId, TimelineIconName, TimelineItem } from '../../config/content';
import { assetUrl } from '../../lib/assets';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SectionShell } from '../../components/SectionShell';
import { HintBubble } from '../../components/HintBubble';
import { SquishyButton } from '../../components/SquishyButton';
import { Mascot } from '../../components/Mascot';

gsap.registerPlugin(ScrollTrigger);

interface TimelineSectionProps {
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
  onBackToHub,
  onNextSection,
}: TimelineSectionProps) {
  const reducedMotion = useReducedMotion();
  const total = content.timeline.length;

  const [revealedCount, setRevealedCount] = useState(1);
  const [revealPulse, setRevealPulse] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const heartRef = useRef<HTMLDivElement | null>(null);
  const latestCardRef = useRef<HTMLLIElement | null>(null);
  const prevProgressRef = useRef(0);

  const allRevealed = revealedCount >= total;
  const visibleItems = content.timeline.slice(0, revealedCount);

  useEffect(() => {
    const container = containerRef.current;
    const pathEl = pathRef.current;
    const heartEl = heartRef.current;
    if (!container || !pathEl || !heartEl) return;

    const totalLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${totalLength}`;

    const setPathAtProgress = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      pathEl.style.strokeDashoffset = `${totalLength * (1 - clamped)}`;
      const pt = pathEl.getPointAtLength(clamped * totalLength);
      heartEl.style.left = `${(pt.x / 48) * 100}%`;
      heartEl.style.top = `${(pt.y / 1000) * 100}%`;
    };

    if (reducedMotion) {
      setPathAtProgress(1);
      return;
    }

    const proxy = { p: prevProgressRef.current };
    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        p: 1,
        duration: revealedCount === 1 ? 0.65 : 0.85,
        ease: 'power2.out',
        onUpdate: () => {
          setPathAtProgress(proxy.p);
          prevProgressRef.current = proxy.p;
        },
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });

      if (revealedCount > 1) {
        ScrollTrigger.create({
          trigger: container,
          start: 'top 65%',
          end: 'bottom 80%',
          scrub: 0.45,
          onUpdate: (self) => {
            const p = Math.max(0.2, self.progress);
            setPathAtProgress(p);
            prevProgressRef.current = p;
          },
        });
      }

      const photos = container.querySelectorAll<HTMLElement>('.timeline-photo');
      photos.forEach((photo) => {
        gsap.fromTo(
          photo,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: photo,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [revealedCount, reducedMotion]);

  const handleRevealNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (allRevealed) return;

    const nextCount = Math.min(total, revealedCount + 1);
    setRevealedCount(nextCount);
    setRevealPulse((k) => k + 1);

    if (!reducedMotion) {
      const rect = e.currentTarget.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = Math.min(0.85, (rect.top + rect.height / 2) / window.innerHeight);

      confetti({
        particleCount: nextCount === total ? 36 : 18,
        spread: nextCount === total ? 75 : 52,
        startVelocity: 24,
        origin: { x: originX, y: originY },
        colors: ['#7F9C70', '#B5C7AA', '#F2CFC4', '#FBF8EF'],
        scalar: 0.85,
      });
    }

    window.setTimeout(() => {
      latestCardRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }, 120);
  };

  return (
    <SectionShell
      section="timeline"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
      hideFooterCta={!allRevealed}
    >
      {/* Indikator progres tanpa spoiler */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="w-full max-w-xs rounded-2xl border border-sage-200 bg-cream px-4 py-2.5 shadow-sage-sm">
          <div className="flex items-center justify-between text-xs font-bold text-sage-800">
            <span>Cerita terbuka</span>
            <span className="tabular-nums text-sage-600">
              {revealedCount} / {total}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sage-100">
            <motion.div
              className="h-full rounded-full bg-sage-500"
              initial={false}
              animate={{ width: `${(revealedCount / total) * 100}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            />
          </div>
        </div>

        {!allRevealed && (
          <HintBubble
            icon={
              <motion.span
                animate={reducedMotion ? undefined : { y: [0, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <ArrowDown className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />
              </motion.span>
            }
          >
            Ketuk tombol di bawah untuk buka jejak berikutnya
          </HintBubble>
        )}
      </div>

      <div ref={containerRef} className="relative mx-auto max-w-3xl py-2">
        {/* Garis jalur SVG vertikal yang mengikuti kartu terbuka */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-2 top-4 w-12 md:left-1/2 md:-translate-x-1/2"
        >
          <svg
            viewBox="0 0 48 1000"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <path
              d="M 24 0 Q 40 125 24 250 T 24 500 T 24 750 T 24 1000"
              fill="none"
              stroke="var(--sage-200)"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="6 7"
            />
            <path
              ref={pathRef}
              d="M 24 0 Q 40 125 24 250 T 24 500 T 24 750 T 24 1000"
              fill="none"
              stroke="var(--sage-500)"
              strokeWidth="3.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div
            ref={heartRef}
            className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sage-400 bg-cream shadow-sage-sm"
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

        <ol className="relative space-y-8 md:space-y-12">
          <AnimatePresence initial={false}>
            {visibleItems.map((item, idx) => {
              const isLatest = idx === visibleItems.length - 1;
              return (
                <TimelineCard
                  key={`${item.date}-${idx}`}
                  item={item}
                  index={idx}
                  isLatest={isLatest}
                  reducedMotion={reducedMotion}
                  cardRef={isLatest ? latestCardRef : undefined}
                />
              );
            })}
          </AnimatePresence>
        </ol>
      </div>

      {/* Tombol pembuka jejak berikutnya (non-spoiler) */}
      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        {!allRevealed ? (
          <motion.div
            key={`teaser-${revealedCount}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center gap-3 rounded-[28px] border border-dashed border-sage-300 bg-cream/85 px-6 py-5 shadow-sage-sm"
          >
            <AnimatePresence>
              {revealPulse > 0 && !reducedMotion && (
                <motion.div
                  key={revealPulse}
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 1.55, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-sage-400"
                />
              )}
            </AnimatePresence>

            <div className="inline-flex items-center gap-1.5 rounded-pill bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Masih ada {total - revealedCount} jejak tersembunyi</span>
            </div>

            <SquishyButton onClick={handleRevealNext} className="group">
              <motion.span
                key={revealPulse}
                animate={reducedMotion ? undefined : { rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.45 }}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </motion.span>
              <span>Buka jejak berikutnya</span>
              <motion.span
                animate={reducedMotion ? undefined : { y: [0, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </motion.span>
            </SquishyButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-2"
          >
            <Mascot
              mood="cheering"
              size="sm"
              message="Semua jejak sudah terbuka!"
            />
          </motion.div>
        )}
      </div>
    </SectionShell>
  );
}

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  isLatest: boolean;
  reducedMotion: boolean;
  cardRef?: React.RefObject<HTMLLIElement>;
}

function TimelineCard({
  item,
  index,
  isLatest,
  reducedMotion,
  cardRef,
}: TimelineCardProps) {
  const isLeftOnDesktop = index % 2 === 0;
  const animKind = index % 3;
  const stickerKind = index % 3;

  const initialVariant = reducedMotion
    ? { opacity: 0 }
    : animKind === 0
    ? { opacity: 0, scale: 0.8, y: 24 }
    : animKind === 1
    ? { opacity: 0, rotate: isLeftOnDesktop ? -5 : 5, y: 24, scale: 0.92 }
    : { opacity: 0, x: isLeftOnDesktop ? -38 : 38, y: 12 };

  const animateVariant = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 };

  const transition =
    animKind === 2 && !reducedMotion
      ? { type: 'spring' as const, stiffness: 260, damping: 16 }
      : { type: 'spring' as const, stiffness: 280, damping: 22 };

  return (
    <li ref={cardRef} className="relative pl-14 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
      <div className={isLeftOnDesktop ? 'md:col-start-1' : 'md:col-start-2'}>
        <motion.article
          initial={initialVariant}
          animate={animateVariant}
          transition={transition}
          className={`relative rounded-[26px] border bg-cream p-5 shadow-sage-md transition-shadow ${
            isLatest ? 'border-sage-400 shadow-sage-glow' : 'border-sage-200/90'
          }`}
        >
          <DoodleSticker
            kind={stickerKind}
            reducedMotion={reducedMotion}
            className={isLeftOnDesktop ? '-right-2.5 -top-2.5' : '-left-2.5 -top-2.5'}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                {item.icon ? ICON_MAP[item.icon] : <Heart className="h-4 w-4" aria-hidden="true" />}
              </span>
              <time className="text-xs font-bold uppercase tracking-wide text-sage-600">
                {item.date}
              </time>
            </div>

            <span className="rounded-pill bg-sage-100 px-2.5 py-0.5 text-[11px] font-bold text-sage-700">
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
            <div className="mt-3.5 overflow-hidden rounded-2xl border border-sage-200/80 bg-sage-100">
              <img
                src={assetUrl(item.photo)}
                alt={item.title}
                loading="lazy"
                className="timeline-photo h-44 w-full object-cover"
              />
            </div>
          )}
        </motion.article>
      </div>
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
      animate={reducedMotion ? undefined : { rotate: [-6, 6, -6] }}
      transition={{ duration: 3.4 + kind * 0.5, repeat: Infinity, ease: 'easeInOut' }}
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
