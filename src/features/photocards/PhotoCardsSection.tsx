import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { content, PhotoCardItem, SectionId } from '../../config/content';
import { assetUrl } from '../../lib/assets';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GENTLE_EASE } from '../../lib/motion';
import { SectionShell } from '../../components/SectionShell';
import { SquishyButton } from '../../components/SquishyButton';

interface PhotoCardsSectionProps {
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}

interface DeckState {
  order: number[];
  dir: 1 | -1;
  exitSide: -1 | 1;
  movedId: number | null;
}

const CARD_REST_TILTS = [-2.4, 1.8, -1.6, 2.2, -2.0, 1.5, -1.7, 2.3];

export default function PhotoCardsSection({
  onBackToHub,
  onNextSection,
}: PhotoCardsSectionProps) {
  const reducedMotion = useReducedMotion();
  const cards = content.photoCards;

  const [mode, setMode] = useState<'stack' | 'grid'>('stack');
  const [deck, setDeck] = useState<DeckState>(() => ({
    order: cards.map((_, i) => i),
    dir: 1,
    exitSide: -1,
    movedId: null,
  }));
  const [flippedMap, setFlippedMap] = useState<Record<number, boolean>>({});
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gyroTilt, setGyroTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const gyroRequestedRef = useRef(false);

  const requestGyroOnFirstTap = useCallback(async () => {
    if (reducedMotion || gyroRequestedRef.current) return;
    gyroRequestedRef.current = true;

    const OrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (!OrientationEvent) return;

    if (typeof OrientationEvent.requestPermission === 'function') {
      try {
        const res = await OrientationEvent.requestPermission();
        if (res === 'granted') {
          setGyroEnabled(true);
        }
      } catch {
        // Jatuh ke fallback tanpa gyro jika izin ditolak atau gagal.
      }
    } else if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setGyroEnabled(true);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!gyroEnabled || reducedMotion) return;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      const clampedGamma = Math.max(-25, Math.min(25, e.gamma));
      const clampedBeta = Math.max(-25, Math.min(25, e.beta - 45));
      setGyroTilt({
        rx: -(clampedBeta / 25) * 8,
        ry: (clampedGamma / 25) * 8,
        gx: 50 + (clampedGamma / 25) * 32,
        gy: 50 + (clampedBeta / 25) * 32,
      });
    };

    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [gyroEnabled, reducedMotion]);

  const toggleFlip = useCallback(
    (cardIdx: number) => {
      void requestGyroOnFirstTap();
      setFlippedMap((prev) => ({ ...prev, [cardIdx]: !prev[cardIdx] }));
    },
    [requestGyroOnFirstTap]
  );

  const cycleNext = useCallback(
    (exitSide: -1 | 1 = -1) => {
      void requestGyroOnFirstTap();
      setDeck((prev) => {
        if (prev.order.length <= 1) return prev;
        const [top, ...rest] = prev.order;
        setFlippedMap((f) => ({ ...f, [top]: false }));
        return {
          order: [...rest, top],
          dir: 1,
          exitSide,
          movedId: top,
        };
      });
    },
    [requestGyroOnFirstTap]
  );

  const cyclePrev = useCallback(() => {
    void requestGyroOnFirstTap();
    setDeck((prev) => {
      if (prev.order.length <= 1) return prev;
      const last = prev.order[prev.order.length - 1];
      const rest = prev.order.slice(0, -1);
      setFlippedMap((f) => ({ ...f, [last]: false }));
      return {
        order: [last, ...rest],
        dir: -1,
        exitSide: -1,
        movedId: last,
      };
    });
  }, [requestGyroOnFirstTap]);

  const topCardIndex = deck.order[0] ?? 0;
  const visibleSlice = deck.order.slice(0, 3);

  return (
    <SectionShell
      section="photocards"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
    >
      <div className="flex flex-col items-center space-y-5">
        {/* Toggle mode Tumpukan vs Grid */}
        <div
          role="tablist"
          aria-label="Mode tampilan kartu foto"
          className="inline-flex rounded-pill border border-sage-200 bg-cream p-1 shadow-sage-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'stack'}
            onClick={() => setMode('stack')}
            className={`focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-pill px-4 text-xs font-bold transition-all duration-300 ${
              mode === 'stack'
                ? 'bg-sage-600 text-[#FBF8EF] shadow-sage-sm'
                : 'text-sage-700 hover:bg-sage-100'
            }`}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>{content.photoCardsUi.stackTabLabel}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'grid'}
            onClick={() => setMode('grid')}
            className={`focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-pill px-4 text-xs font-bold transition-all duration-300 ${
              mode === 'grid'
                ? 'bg-sage-600 text-[#FBF8EF] shadow-sage-sm'
                : 'text-sage-700 hover:bg-sage-100'
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <span>{content.photoCardsUi.gridTabLabel}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'stack' ? (
            <motion.div
              key="stack-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.48, ease: GENTLE_EASE }}
              className="flex w-full flex-col items-center"
            >
              <div className="relative h-[400px] w-full max-w-[310px] sm:h-[420px]">
                <AnimatePresence initial={false} custom={deck}>
                  {visibleSlice
                    .slice()
                    .reverse()
                    .map((cardIdx) => {
                      const depth = visibleSlice.indexOf(cardIdx);
                      const isTop = depth === 0;
                      return (
                        <StackCardWrapper
                          key={cardIdx}
                          card={cards[cardIdx]}
                          cardIdx={cardIdx}
                          depth={depth}
                          isTop={isTop}
                          deck={deck}
                          isFlipped={!!flippedMap[cardIdx]}
                          gyroEnabled={gyroEnabled}
                          gyroTilt={gyroTilt}
                          reducedMotion={reducedMotion}
                          onTapFlip={() => toggleFlip(cardIdx)}
                          onSwipeNext={(side) => cycleNext(side)}
                          onSwipePrev={cyclePrev}
                        />
                      );
                    })}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <SquishyButton
                  variant="secondary"
                  onClick={cyclePrev}
                  aria-label="Kartu sebelumnya"
                  className="px-4 py-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{content.photoCardsUi.prevButton}</span>
                </SquishyButton>

                <span className="min-w-[60px] text-center text-xs font-bold tabular-nums text-sage-700">
                  {topCardIndex + 1} / {cards.length}
                </span>

                <SquishyButton
                  variant="secondary"
                  onClick={() => cycleNext(-1)}
                  aria-label="Kartu berikutnya"
                  className="px-4 py-2 text-xs"
                >
                  <span>{content.photoCardsUi.nextButton}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </SquishyButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.48, ease: GENTLE_EASE }}
              className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {cards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reducedMotion ? 0 : idx * 0.05,
                    duration: reducedMotion ? 0.2 : 0.55,
                    ease: GENTLE_EASE,
                  }}
                  className="flex justify-center"
                >
                  <div className="h-[370px] w-full max-w-[300px]">
                    <PolaroidCard3D
                      card={card}
                      cardIdx={idx}
                      isFlipped={!!flippedMap[idx]}
                      gyroEnabled={gyroEnabled}
                      gyroTilt={gyroTilt}
                      reducedMotion={reducedMotion}
                      onTap={() => toggleFlip(idx)}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

interface StackCardWrapperProps {
  card: PhotoCardItem;
  cardIdx: number;
  depth: number;
  isTop: boolean;
  deck: DeckState;
  isFlipped: boolean;
  gyroEnabled: boolean;
  gyroTilt: { rx: number; ry: number; gx: number; gy: number };
  reducedMotion: boolean;
  onTapFlip: () => void;
  onSwipeNext: (side: -1 | 1) => void;
  onSwipePrev: () => void;
}

function StackCardWrapper({
  card,
  cardIdx,
  depth,
  isTop,
  deck,
  isFlipped,
  gyroEnabled,
  gyroTilt,
  reducedMotion,
  onTapFlip,
  onSwipeNext,
  onSwipePrev,
}: StackCardWrapperProps) {
  const x = useMotionValue(0);
  const dragRotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);
  const draggedRef = useRef(false);

  const handleDragStart = () => {
    draggedRef.current = true;
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -75 || info.velocity.x < -380) {
      onSwipeNext(-1);
    } else if (info.offset.x > 75 || info.velocity.x > 380) {
      onSwipePrev();
    }
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 60);
  };

  const restTilt = CARD_REST_TILTS[cardIdx % CARD_REST_TILTS.length];
  const isReturningToTop = deck.dir === -1 && deck.movedId === cardIdx;

  const initialState = reducedMotion
    ? { opacity: 0 }
    : isReturningToTop
    ? { x: -240, y: -10, rotate: -10, scale: 0.96, opacity: 0 }
    : { x: 0, y: 30, rotate: 0, scale: 0.88, opacity: 0 };

  const exitVariant = (latestDeck: DeckState) => {
    if (reducedMotion) {
      return { opacity: 0, transition: { duration: 0.2 } };
    }
    // Kartu teratas meluncur keluar ke samping seperti membalik tumpukan foto.
    if (latestDeck.dir === 1 && latestDeck.movedId === cardIdx) {
      return {
        x: latestDeck.exitSide * 250,
        y: -14,
        rotate: latestDeck.exitSide * 11,
        scale: 0.94,
        opacity: 0,
        transition: { duration: 0.64, ease: GENTLE_EASE },
      };
    }
    // Kartu paling belakang meredup pelan di posisinya.
    return {
      x: 0,
      y: 30,
      scale: 0.88,
      opacity: 0,
      transition: { duration: 0.45, ease: GENTLE_EASE },
    };
  };

  return (
    <motion.div
      custom={deck}
      variants={{ exit: exitVariant }}
      initial={initialState}
      animate={{
        x: 0,
        y: depth * 12,
        rotate: isTop ? 0 : restTilt * 0.6,
        scale: 1 - depth * 0.045,
        opacity: 1 - depth * 0.14,
      }}
      exit="exit"
      transition={{ duration: reducedMotion ? 0.25 : 0.68, ease: GENTLE_EASE }}
      style={{
        x,
        rotate: isTop ? dragRotate : undefined,
        zIndex: 10 - depth,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
    >
      <PolaroidCard3D
        card={card}
        cardIdx={cardIdx}
        isFlipped={isFlipped}
        gyroEnabled={gyroEnabled}
        gyroTilt={gyroTilt}
        reducedMotion={reducedMotion}
        onTap={() => {
          if (!draggedRef.current) {
            onTapFlip();
          }
        }}
      />
    </motion.div>
  );
}

interface PolaroidCard3DProps {
  card: PhotoCardItem;
  cardIdx: number;
  isFlipped: boolean;
  gyroEnabled: boolean;
  gyroTilt: { rx: number; ry: number; gx: number; gy: number };
  reducedMotion: boolean;
  onTap: () => void;
}

function PolaroidCard3D({
  card,
  cardIdx,
  isFlipped,
  gyroEnabled,
  gyroTilt,
  reducedMotion,
  onTap,
}: PolaroidCard3DProps) {
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const restTilt = CARD_REST_TILTS[cardIdx % CARD_REST_TILTS.length];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 12;
    const ry = (px - 0.5) * 12;

    el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    el.style.setProperty('--card-glare-x', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--card-glare-y', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--card-glare-o', '0.28');
  };

  const handlePointerLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
    el.style.setProperty('--card-glare-o', '0');
  };

  const gyroStyle =
    gyroEnabled && !reducedMotion
      ? {
          transform: `rotateX(${gyroTilt.rx.toFixed(2)}deg) rotateY(${gyroTilt.ry.toFixed(2)}deg)`,
          ['--card-glare-x' as string]: `${gyroTilt.gx.toFixed(1)}%`,
          ['--card-glare-y' as string]: `${gyroTilt.gy.toFixed(1)}%`,
          ['--card-glare-o' as string]: '0.25',
        }
      : undefined;

  return (
    <div
      ref={tiltRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: '1200px',
        transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
        ...gyroStyle,
      }}
      className="h-full w-full"
    >
      <motion.button
        type="button"
        onClick={onTap}
        aria-label={`${card.caption}. Tap kartu untuk membalik`}
        animate={
          reducedMotion
            ? { opacity: 1 }
            : {
                rotateY: isFlipped ? 180 : 0,
                rotateZ: isFlipped ? 0 : restTilt,
              }
        }
        transition={{ duration: reducedMotion ? 0.2 : 0.85, ease: GENTLE_EASE }}
        style={{ transformStyle: 'preserve-3d' }}
        className="focus-ring relative h-full w-full rounded-[26px] text-left"
      >
        {/* Sisi depan polaroid */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 flex flex-col rounded-[26px] border border-sage-200 bg-cream p-3.5 pb-5 shadow-sage-lg"
        >
          {/* Stiker selotip kertas di atas foto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 z-20 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-sm border border-sage-300/60 bg-sage-200/80 shadow-sm backdrop-blur-sm"
          />

          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-sage-200/80 bg-sage-100/70">
            <img
              src={assetUrl(card.photo)}
              alt={card.caption}
              loading="lazy"
              draggable={false}
              className="h-full w-full select-none object-contain"
            />
            {/* Kilau cahaya tilt */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: 'var(--card-glare-o, 0)',
                background:
                  'radial-gradient(circle at var(--card-glare-x, 50%) var(--card-glare-y, 50%), rgba(251,248,239,0.72), transparent 58%)',
              }}
            />
          </div>

          <div className="mt-3 flex items-end justify-between gap-2 px-1">
            <p className="font-hand text-2xl font-semibold leading-tight text-sage-900">
              {card.caption}
            </p>
            <span className="shrink-0 text-[11px] font-bold text-sage-600">{card.date}</span>
          </div>
        </div>

        {/* Sisi belakang catatan tulisan tangan */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 flex flex-col justify-between rounded-[26px] border border-sage-300 bg-cream p-6 shadow-sage-lg"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-pill bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
                {card.date}
              </span>
              <BackDoodle index={cardIdx} />
            </div>

            <h2 className="mt-4 font-hand text-3xl font-bold text-sage-900">
              {card.caption}
            </h2>

            <p className="mt-3 font-hand text-2xl leading-relaxed text-sage-800">
              {card.backNote}
            </p>
          </div>

          <div className="border-t border-dashed border-sage-200 pt-3 text-center text-xs font-semibold text-sage-600">
            {card.date}
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function BackDoodle({ index }: { index: number }) {
  const kind = index % 3;
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      {kind === 0 && (
        <path
          d="M16 27s-9-5.8-9-12.6A5.4 5.4 0 0 1 12.4 9c1.6 0 2.9.8 3.6 2 .7-1.2 2-2 3.6-2A5.4 5.4 0 0 1 25 14.4C25 21.2 16 27 16 27z"
          fill="#F2CFC4"
          stroke="#647F57"
          strokeWidth="1.6"
        />
      )}
      {kind === 1 && (
        <path
          d="M7 25 C8 13 15 8 25 7 C25 17 19 24 7 25 Z"
          fill="#9CB38E"
          stroke="#4E6445"
          strokeWidth="1.6"
        />
      )}
      {kind === 2 && (
        <>
          <circle cx="16" cy="9" r="3.5" fill="#F2CFC4" />
          <circle cx="23" cy="16" r="3.5" fill="#F2CFC4" />
          <circle cx="16" cy="23" r="3.5" fill="#F2CFC4" />
          <circle cx="9" cy="16" r="3.5" fill="#F2CFC4" />
          <circle cx="16" cy="16" r="3" fill="#7F9C70" />
        </>
      )}
    </svg>
  );
}
