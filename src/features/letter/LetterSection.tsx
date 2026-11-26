import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { content, SectionId } from '../../config/content';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GENTLE_EASE } from '../../lib/motion';
import { SectionShell } from '../../components/SectionShell';
import { SquishyButton } from '../../components/SquishyButton';
import { Mascot } from '../../components/Mascot';
import { GreenFlower } from '../../components/GreenFlower';

interface LetterSectionProps {
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}

type Stage = 'envelope' | 'opening' | 'typing' | 'done';

const PETALS = [
  { left: '10%', delay: 0.2, duration: 5.2 },
  { left: '28%', delay: 1.1, duration: 6.0 },
  { left: '50%', delay: 0.5, duration: 5.6 },
  { left: '72%', delay: 1.7, duration: 6.3 },
  { left: '88%', delay: 0.9, duration: 5.4 },
];

export default function LetterSection({
  onBackToHub,
  onNextSection,
}: LetterSectionProps) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>('envelope');
  const [typedTitleCount, setTypedTitleCount] = useState(0);
  const [typedBodyCounts, setTypedBodyCounts] = useState<number[]>(() =>
    content.letter.body.map(() => 0)
  );
  const [hugCount, setHugCount] = useState(0);

  const typingTimerRef = useRef<number | null>(null);
  const titleText = content.letter.title;
  const paragraphs = content.letter.body;

  const finishInstantly = useCallback(() => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypedTitleCount(titleText.length);
    setTypedBodyCounts(paragraphs.map((p) => p.length));
    setStage('done');
  }, [paragraphs, titleText.length]);

  const fireHugHearts = useCallback(
    (count = 45) => {
      if (reducedMotion) return;
      try {
        const heart = confetti.shapeFromPath({
          path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        });
        confetti({
          particleCount: count,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#7F9C70', '#9CB38E', '#F2CFC4', '#FBF8EF'],
          shapes: [heart, 'circle'],
          scalar: 1.15,
        });
      } catch {
        confetti({
          particleCount: count,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#7F9C70', '#F2CFC4'],
        });
      }
    },
    [reducedMotion]
  );

  const handleOpenEnvelope = () => {
    if (stage !== 'envelope') return;
    if (reducedMotion) {
      finishInstantly();
      return;
    }
    setStage('opening');
    window.setTimeout(() => {
      setTypedTitleCount(0);
      setTypedBodyCounts(paragraphs.map(() => 0));
      setStage('typing');
    }, 1250);
  };

  useEffect(() => {
    if (stage !== 'typing') return;

    if (reducedMotion) {
      finishInstantly();
      return;
    }

    let phase: 'title' | 'body' = 'title';
    let titlePos = 0;
    let paraIdx = 0;
    let charPos = 0;
    let cancelled = false;

    const getDelay = (ch: string) => {
      if (ch === '.' || ch === '!' || ch === '?') return 320;
      if (ch === ',') return 165;
      if (ch === ' ') return 24;
      return 28 + Math.round(Math.random() * 18);
    };

    const step = () => {
      if (cancelled) return;

      if (phase === 'title') {
        if (titlePos < titleText.length) {
          const ch = titleText[titlePos];
          titlePos += 1;
          setTypedTitleCount(titlePos);
          typingTimerRef.current = window.setTimeout(step, getDelay(ch));
          return;
        }
        phase = 'body';
        typingTimerRef.current = window.setTimeout(step, 340);
        return;
      }

      if (paraIdx < paragraphs.length) {
        const para = paragraphs[paraIdx];
        if (charPos < para.length) {
          const ch = para[charPos];
          charPos += 1;
          const currentParaIdx = paraIdx;
          const nextCharPos = charPos;
          setTypedBodyCounts((prev) => {
            const copy = [...prev];
            copy[currentParaIdx] = nextCharPos;
            return copy;
          });
          typingTimerRef.current = window.setTimeout(step, getDelay(ch));
          return;
        }
        paraIdx += 1;
        charPos = 0;
        typingTimerRef.current = window.setTimeout(step, 260);
        return;
      }

      setStage('done');
      fireHugHearts(28);
    };

    typingTimerRef.current = window.setTimeout(step, 240);
    return () => {
      cancelled = true;
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [finishInstantly, fireHugHearts, paragraphs, reducedMotion, stage, titleText]);

  const handleRestart = () => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypedTitleCount(0);
    setTypedBodyCounts(paragraphs.map(() => 0));
    setHugCount(0);
    setStage('envelope');
  };

  const handleSendHug = () => {
    setHugCount((c) => c + 1);
    fireHugHearts(52);
  };

  return (
    <SectionShell
      section="letter"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
      hideFooterCta
    >
      <div className="relative flex min-h-[460px] flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {(stage === 'envelope' || stage === 'opening') && (
            <motion.div
              key="envelope-stage"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.03, y: -14 }}
              transition={{ duration: reducedMotion ? 0.25 : 0.6, ease: GENTLE_EASE }}
              className="flex flex-col items-center space-y-6 py-8"
            >
              {/* Amplop 3D CSS */}
              <motion.button
                type="button"
                onClick={handleOpenEnvelope}
                aria-label="open letter envelope"
                animate={
                  stage === 'envelope' && !reducedMotion
                    ? { y: [0, -6, 0] }
                    : undefined
                }
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                style={{ perspective: '1000px' }}
                className="focus-ring relative h-52 w-72 cursor-pointer rounded-3xl sm:h-56 sm:w-80"
              >
                {/* Badan belakang amplop */}
                <div className="absolute inset-0 rounded-3xl border border-sage-300 bg-sage-200 shadow-sage-lg" />

                {/* Kertas surat di dalam yang meluncur keluar */}
                <motion.div
                  initial={{ y: 12, scale: 0.92 }}
                  animate={
                    stage === 'opening'
                      ? { y: -68, scale: 1.04 }
                      : { y: 12, scale: 0.92 }
                  }
                  transition={{ delay: 0.35, duration: 0.85, ease: GENTLE_EASE }}
                  className="absolute inset-x-4 bottom-4 top-5 flex flex-col items-center justify-center rounded-2xl border border-sage-200 bg-cream p-4 shadow-sage-sm"
                >
                  <span className="font-hand text-2xl font-bold text-sage-900">
                    {titleText}
                  </span>
                  <span className="mt-1 h-1.5 w-24 rounded-full bg-sage-200" />
                  <span className="mt-1.5 h-1.5 w-16 rounded-full bg-sage-100" />
                </motion.div>

                {/* Kantong depan amplop */}
                <div
                  className="absolute inset-x-0 bottom-0 h-32 rounded-b-3xl border-t border-sage-300/70 bg-cream"
                  style={{
                    clipPath: 'polygon(0 0, 50% 44%, 100% 0, 100% 100%, 0 100%)',
                  }}
                />

                {/* Tutup amplop 3D */}
                <motion.div
                  initial={{ rotateX: 0 }}
                  animate={stage === 'opening' ? { rotateX: 175 } : { rotateX: 0 }}
                  transition={{ duration: 0.72, ease: GENTLE_EASE }}
                  style={{
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                    clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
                  }}
                  className="absolute inset-x-0 top-0 z-10 h-40 rounded-t-3xl bg-sage-100 shadow-sm"
                />

                {/* Segel hati blush */}
                <motion.div
                  animate={stage === 'opening' ? { scale: 0.6, opacity: 0 } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.38, ease: GENTLE_EASE }}
                  className="absolute left-1/2 top-[48%] z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cream bg-blush shadow-sage-sm"
                >
                  <Heart className="h-5 w-5 fill-[#647F57] text-[#4E6445]" aria-hidden="true" />
                </motion.div>
              </motion.button>
            </motion.div>
          )}

          {(stage === 'typing' || stage === 'done') && (
            <motion.article
              key="letter-sheet"
              initial={{ opacity: 0, scale: 0.97, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.25 : 0.72, ease: GENTLE_EASE }}
              onClick={() => {
                if (stage === 'typing') finishInstantly();
              }}
              className={`relative w-full overflow-hidden rounded-[30px] border border-sage-200/90 bg-cream p-6 shadow-sage-lg sm:p-9 ${
                stage === 'typing' ? 'cursor-pointer' : ''
              }`}
            >
              <GreenFlower
                variant="sprig"
                className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 opacity-35 sm:h-24 sm:w-24"
              />
              {/* Kelopak jatuh halus di tahap akhir */}
              {stage === 'done' && !reducedMotion && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  {PETALS.map((petal, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{
                        y: [0, 380],
                        x: [0, 16, -12, 8],
                        rotate: [0, 140],
                        opacity: [0, 0.75, 0],
                      }}
                      transition={{
                        duration: petal.duration,
                        delay: petal.delay,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{ left: petal.left }}
                      className="absolute top-0 h-3 w-4 rounded-full bg-blush/70"
                    />
                  ))}
                </div>
              )}

              <div className="relative z-10">
                {/* Judul dengan efek mengetik + kilau */}
                <div className="flex items-center gap-2.5">
                  <h2 className="font-hand text-4xl font-bold text-sage-900 sm:text-5xl">
                    <span>{titleText.slice(0, typedTitleCount)}</span>
                    {stage === 'typing' && typedTitleCount < titleText.length && (
                      <BlinkingCaret />
                    )}
                  </h2>
                  {typedTitleCount >= titleText.length && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.55, ease: GENTLE_EASE }}
                      className="text-sage-600"
                    >
                      <Sparkles className="h-6 w-6" aria-hidden="true" />
                    </motion.span>
                  )}
                </div>

                {/* Isi surat nyata di DOM agar terbaca screen reader */}
                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink sm:text-lg">
                  {paragraphs.map((para, idx) => {
                    const count = typedBodyCounts[idx] ?? 0;
                    const visibleText = para.slice(0, count);
                    const isCurrentlyTyping =
                      stage === 'typing' &&
                      typedTitleCount >= titleText.length &&
                      count < para.length &&
                      (idx === 0 || (typedBodyCounts[idx - 1] ?? 0) >= paragraphs[idx - 1].length);

                    if (count === 0 && !isCurrentlyTyping) {
                      return (
                        <p key={idx} className="sr-only">
                          {para}
                        </p>
                      );
                    }

                    return (
                      <p key={idx}>
                        <span>{visibleText}</span>
                        {isCurrentlyTyping && <BlinkingCaret />}
                      </p>
                    );
                  })}
                </div>

                {stage === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: GENTLE_EASE }}
                    className="mt-8 border-t border-sage-200 pt-6"
                  >
                    {/* Tanda tangan dengan animasi goresan SVG */}
                    <div className="flex flex-col items-end">
                      <svg
                        viewBox="0 0 180 42"
                        className="h-10 w-40 text-sage-600"
                        aria-hidden="true"
                      >
                        <motion.path
                          d="M10 30 Q 45 8, 72 26 T 130 22 Q 152 14, 170 28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          pathLength={1}
                          strokeDasharray="1"
                          initial={{ strokeDashoffset: reducedMotion ? 0 : 1 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 1.2, ease: 'easeInOut' }}
                        />
                      </svg>
                      <div className="flex items-center gap-2">
                        <GreenFlower variant="rosette" className="h-6 w-6 opacity-80" />
                        <p className="font-hand text-3xl font-bold text-sage-900">
                          {content.letter.signature}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-4">
                      <Mascot
                        mood="cheering"
                        size="md"
                        message={
                          hugCount > 0
                            ? content.letterUi.mascotHugCount.replace('{count}', String(hugCount))
                            : content.letterUi.mascotDefault
                        }
                      />

                      <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                        <SquishyButton variant="blush" onClick={handleSendHug}>
                          <Heart className="h-4 w-4 fill-[#4E6445] text-[#4E6445]" aria-hidden="true" />
                          <span>{content.letterUi.sendHugButton}</span>
                        </SquishyButton>

                        <SquishyButton variant="secondary" onClick={handleRestart}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          <span>{content.letterUi.restartButton}</span>
                        </SquishyButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function BlinkingCaret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse bg-sage-600"
    />
  );
}
