import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CalendarClock, PartyPopper, Sparkles } from 'lucide-react';
import { content, SectionId } from '../../config/content';
import {
  getElapsedSince,
  getNextAnniversaryCountdown,
  isAnniversaryToday,
} from '../../lib/date';
import { useNow } from '../../hooks/useNow';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GENTLE_EASE } from '../../lib/motion';
import { SectionShell } from '../../components/SectionShell';
import { SquishyButton } from '../../components/SquishyButton';

interface CounterSectionProps {
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}

export default function CounterSection({
  onBackToHub,
  onNextSection,
}: CounterSectionProps) {
  const reducedMotion = useReducedMotion();
  const now = useNow(1000);
  const celebratedRef = useRef(false);

  const elapsed = getElapsedSince(content.startDate, now);
  const nextAnniv = getNextAnniversaryCountdown(content.startDate, now);
  const anniversaryToday = isAnniversaryToday(content.startDate, now);

  const launchCelebration = useCallback(() => {
    if (reducedMotion) return;
    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.45 },
      colors: ['#7F9C70', '#B5C7AA', '#F2CFC4', '#FBF8EF'],
    });
  }, [reducedMotion]);

  useEffect(() => {
    if (anniversaryToday && !celebratedRef.current) {
      celebratedRef.current = true;
      launchCelebration();
    }
  }, [anniversaryToday, launchCelebration]);

  const { unitLabels } = content.counterUi;
  const timeUnits = [
    { label: unitLabels.years, value: elapsed.years },
    { label: unitLabels.months, value: elapsed.months },
    { label: unitLabels.days, value: elapsed.days },
    { label: unitLabels.hours, value: elapsed.hours },
    { label: unitLabels.minutes, value: elapsed.minutes },
    { label: unitLabels.seconds, value: elapsed.seconds },
  ];

  return (
    <SectionShell
      section="counter"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
    >
      <div className="space-y-6">
        {/* Banner spesial jika hari ini tepat tanggal anniversary */}
        {anniversaryToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.25 : 0.7, ease: GENTLE_EASE }}
            className="flex flex-col items-center justify-between gap-3 rounded-[28px] border border-sage-300 bg-blush/55 p-5 text-center shadow-sage-md sm:flex-row sm:text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-sage-800 shadow-sage-sm">
                <PartyPopper className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-[#2B3827]">
                  {content.counterUi.anniversaryBannerTitle}
                </h2>
                <p className="text-xs font-semibold text-[#3C4E36]">
                  {content.counterUi.anniversaryBannerBody.replace(
                    '{years}',
                    String(Math.max(1, elapsed.years))
                  )}
                </p>
              </div>
            </div>

            <SquishyButton
              variant="secondary"
              onClick={launchCelebration}
              className="px-4 py-2 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{content.counterUi.celebrateAgainButton}</span>
            </SquishyButton>
          </motion.div>
        )}

        {/* Kartu utama penghitung waktu 3D */}
        <section
          aria-label="time together counter"
          className="rounded-[28px] border border-sage-200/90 bg-cream p-5 shadow-sage-md sm:p-6"
        >
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
            {timeUnits.map((unit) => (
              <FlipDigitTile
                key={unit.label}
                label={unit.label}
                value={unit.value}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-sage-100/80 px-4 py-3.5 sm:flex-row">
            <span className="text-xs font-semibold text-sage-700">
              {content.counterUi.totalDaysLabel}
            </span>
            <span className="font-display text-2xl font-bold tabular-nums text-sage-900">
              {elapsed.totalDays.toLocaleString('en-US')} {content.counterUi.totalDaysUnit}
            </span>
          </div>
        </section>

        {/* Hitung mundur menuju anniversary berikutnya */}
        <section
          aria-label="next anniversary countdown"
          className="rounded-[28px] border border-sage-200/90 bg-cream p-5 shadow-sage-sm"
        >
          <div className="flex items-center gap-2 text-xs font-bold lowercase tracking-wide text-sage-600">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span>
              {content.counterUi.nextAnnivHeading.replace(
                '{year}',
                String(nextAnniv.targetYearNumber)
              )}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: unitLabels.days, val: nextAnniv.days },
              { label: unitLabels.hours, val: nextAnniv.hours },
              { label: unitLabels.minutes, val: nextAnniv.minutes },
              { label: unitLabels.seconds, val: nextAnniv.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-sage-200/80 bg-sage-50 px-2 py-2.5"
              >
                <div className="font-display text-xl font-semibold tabular-nums text-sage-900 sm:text-2xl">
                  {String(item.val).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-semibold text-sage-600">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SectionShell>
  );
}

function FlipDigitTile({
  label,
  value,
  reducedMotion,
}: {
  label: string;
  value: number;
  reducedMotion: boolean;
}) {
  const padded = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl border border-sage-200 bg-sage-50 shadow-sage-sm sm:h-20"
        style={{ perspective: '500px' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 border-t border-sage-200/70"
        />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={padded}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { rotateX: -32, y: -4, opacity: 0 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { rotateX: 0, y: 0, opacity: 1 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { rotateX: 32, y: 4, opacity: 0 }
            }
            transition={{ duration: reducedMotion ? 0.15 : 0.42, ease: GENTLE_EASE }}
            className="font-display text-2xl font-bold tabular-nums text-sage-900 sm:text-3xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[11px] font-bold lowercase tracking-wide text-sage-600">
        {label}
      </span>
    </div>
  );
}
