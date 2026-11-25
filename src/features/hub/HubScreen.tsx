import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarHeart,
  Camera,
  Check,
  Clock,
  Film,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import { SECTION_META, SECTION_ORDER, SectionId } from '../../config/content';
import { getNextPendingSection, isSectionUnlocked } from '../../lib/progression';
import { Mascot } from '../../components/Mascot';
import { HintBubble } from '../../components/HintBubble';
import { useTilt } from '../../hooks/useTilt';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HubScreenProps {
  partnerName: string;
  siteTitle: string;
  visitedSections: SectionId[];
  onSelectSection: (section: SectionId) => void;
  onReplayIntro: () => void;
  onLockSite: () => void;
}

const CARD_META: Record<
  SectionId,
  { icon: ReactNode; microcopy: string; accent: string }
> = {
  timeline: {
    icon: <CalendarHeart className="h-6 w-6" aria-hidden="true" />,
    microcopy: 'Dari hari pertama sampai sekarang.',
    accent: 'bg-sage-100 text-sage-700',
  },
  counter: {
    icon: <Clock className="h-6 w-6" aria-hidden="true" />,
    microcopy: 'Detik demi detik yang kita jalani.',
    accent: 'bg-sage-100 text-sage-700',
  },
  rewind: {
    icon: <Film className="h-6 w-6" aria-hidden="true" />,
    microcopy: 'Cerita kilas balik versi kita.',
    accent: 'bg-blush/55 text-sage-800',
  },
  photocards: {
    icon: <Camera className="h-6 w-6" aria-hidden="true" />,
    microcopy: 'Geser dan balik foto buat baca catatan.',
    accent: 'bg-sage-100 text-sage-700',
  },
  letter: {
    icon: <Mail className="h-6 w-6" aria-hidden="true" />,
    microcopy: 'Catatan hangat paling akhir buat kamu.',
    accent: 'bg-blush/65 text-sage-800',
  },
};

export function HubScreen({
  partnerName,
  siteTitle,
  visitedSections,
  onSelectSection,
  onReplayIntro,
  onLockSite,
}: HubScreenProps) {
  const reducedMotion = useReducedMotion();
  const nextPending = getNextPendingSection(visitedSections);
  const allCompleted = nextPending === null;

  return (
    <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-12 pt-20 sm:px-6 sm:pt-14">
      <header className="flex flex-col items-center text-center">
        <Mascot
          mood={allCompleted ? 'cheering' : 'excited'}
          size="md"
          message={
            visitedSections.length === 0
              ? `Mulai dari Jejak Kita dulu ya, ${partnerName}!`
              : allCompleted
              ? `Semua ${SECTION_ORDER.length} bagian sudah terbuka!`
              : `${visitedSections.length} dari ${SECTION_ORDER.length} bagian sudah kamu buka!`
          }
        />

        <h1 className="mt-3 font-display text-3xl font-semibold text-sage-900 sm:text-4xl">
          {siteTitle}
        </h1>
        <p className="mt-1.5 max-w-md text-sm text-sage-700">
          Buka setiap kartu secara berurutan dari awal sampai akhir ya.
        </p>

        {nextPending && (
          <HintBubble className="mt-3">
            {visitedSections.length === 0
              ? 'Mulai dari Jejak Kita dulu yuk'
              : `Berikutnya: buka ${SECTION_META[nextPending].title}`}
          </HintBubble>
        )}
      </header>

      <section
        aria-label="Menu utama"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {SECTION_ORDER.map((sectionId, idx) => {
          const isVisited = visitedSections.includes(sectionId);
          const isLocked = !isSectionUnlocked(sectionId, visitedSections);
          const isNextUp = sectionId === nextPending;
          const prevTitle = idx > 0 ? SECTION_META[SECTION_ORDER[idx - 1]].title : null;

          return (
            <HubCard
              key={sectionId}
              sectionId={sectionId}
              index={idx}
              isVisited={isVisited}
              isLocked={isLocked}
              isNextUp={isNextUp}
              prevTitle={prevTitle}
              reducedMotion={reducedMotion}
              isWide={sectionId === 'letter'}
              onClick={() => {
                if (!isLocked) onSelectSection(sectionId);
              }}
            />
          );
        })}
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-sage-600">
        <button
          type="button"
          onClick={onReplayIntro}
          className="focus-ring min-h-[44px] rounded-pill px-4 py-2 font-semibold transition hover:bg-sage-100 hover:text-sage-800"
        >
          Lihat sambutan lagi
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={onLockSite}
          className="focus-ring min-h-[44px] rounded-pill px-4 py-2 font-semibold transition hover:bg-sage-100 hover:text-sage-800"
        >
          Kunci halaman
        </button>
      </footer>
    </main>
  );
}

interface HubCardProps {
  sectionId: SectionId;
  index: number;
  isVisited: boolean;
  isLocked: boolean;
  isNextUp: boolean;
  prevTitle: string | null;
  reducedMotion: boolean;
  isWide?: boolean;
  onClick: () => void;
}

function HubCard({
  sectionId,
  index,
  isVisited,
  isLocked,
  isNextUp,
  prevTitle,
  reducedMotion,
  isWide = false,
  onClick,
}: HubCardProps) {
  const tilt = useTilt<HTMLButtonElement>(7);
  const meta = SECTION_META[sectionId];
  const card = CARD_META[sectionId];

  const lockedDescription =
    index === 1
      ? 'Buka semua cerita di Jejak Kita dulu ya sebelum bagian ini.'
      : `Buka ${prevTitle ?? 'bagian sebelumnya'} dulu ya sebelum bagian ini.`;

  return (
    <motion.button
      ref={tilt.ref}
      type="button"
      onClick={onClick}
      onPointerMove={isLocked ? undefined : tilt.onPointerMove}
      onPointerLeave={isLocked ? undefined : tilt.onPointerLeave}
      disabled={isLocked}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reducedMotion ? 0 : index * 0.055,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      whileTap={reducedMotion || isLocked ? undefined : { scale: 0.97 }}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 160ms ease-out' }}
      className={`focus-ring group relative flex min-h-[124px] w-full flex-col justify-between overflow-hidden rounded-[26px] border p-5 text-left transition-colors ${
        isWide ? 'sm:col-span-2' : ''
      } ${
        isLocked
          ? 'cursor-not-allowed border-sage-200/70 bg-sage-100/70 opacity-70'
          : isNextUp
          ? 'border-sage-400 bg-cream shadow-sage-glow hover:border-sage-500'
          : 'border-sage-200/90 bg-cream shadow-sage-md hover:border-sage-300'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: isLocked ? 0 : 'var(--glare-opacity, 0)',
          background:
            'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(235,242,231,0.38), transparent 60%)',
        }}
      />

      <div className="relative flex w-full items-start justify-between gap-3">
        <motion.div
          whileHover={reducedMotion || isLocked ? undefined : { rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.45 }}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent} shadow-sage-sm`}
        >
          {isLocked ? <Lock className="h-5 w-5" aria-hidden="true" /> : card.icon}
        </motion.div>

        {isVisited && !isLocked ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-sage-100 px-2.5 py-1 text-[11px] font-bold text-sage-700">
            <Check className="h-3 w-3" aria-hidden="true" />
            <span>Sudah dibuka</span>
          </span>
        ) : isNextUp ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-sage-600 px-2.5 py-1 text-[11px] font-bold text-[#FBF8EF] shadow-sage-sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>{index === 0 ? 'Mulai di sini' : 'Buka sekarang'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-pill bg-sage-200/70 px-2.5 py-1 text-[11px] font-bold text-sage-700">
            <span>Bagian {index + 1}</span>
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <h2 className="font-display text-xl font-semibold text-sage-900">
          {index + 1}. {meta.title}
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-sage-700">
          {isLocked ? lockedDescription : card.microcopy}
        </p>
      </div>
    </motion.button>
  );
}
