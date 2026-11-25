import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { SquishyButton } from '../../components/SquishyButton';
import { HintBubble } from '../../components/HintBubble';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ThemeMode } from '../../hooks/useTheme';

const AmbientScene = lazy(() => import('../../three/AmbientScene'));

interface IntroScreenProps {
  partnerName: string;
  myName: string;
  siteTitle: string;
  theme: ThemeMode;
  onStart: () => void;
}

export function IntroScreen({
  partnerName,
  myName,
  siteTitle,
  theme,
  onStart,
}: IntroScreenProps) {
  const reducedMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 pb-12 pt-20 sm:pt-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sage-100/70 via-sage-50 to-sage-100/80"
      />
      <Suspense fallback={null}>
        <AmbientScene theme={theme} variant="intro" />
      </Suspense>
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.62, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-28 h-72 w-72 rounded-full bg-sage-200/50 blur-3xl"
        />
      )}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center rounded-[32px] border border-sage-200/90 bg-cream/95 px-6 py-8 text-center shadow-sage-lg"
      >
        <Mascot
          mood="happy"
          size="lg"
          message={`Hai ${partnerName}, akhirnya kebuka juga!`}
        />

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-sage-100 px-3.5 py-1 text-xs font-bold text-sage-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{siteTitle}</span>
        </span>

        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-sage-900 sm:text-4xl">
          Ada tempat kecil yang kubuat buat kamu
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-sage-700 sm:text-base">
          Di dalamnya ada cerita kita, foto, peta tempat yang pernah kita datangi,
          sampai surat kecil dari {myName}. Lagunya juga jalan terus di pojok kanan atas sambil kamu baca.
        </p>

        <div className="mt-7 flex w-full flex-col items-center gap-3">
          <SquishyButton onClick={onStart} className="w-full max-w-[240px] text-base">
            <span>Mulai</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </SquishyButton>

          <HintBubble>Ketuk tombol Mulai untuk lihat menunya</HintBubble>
        </div>
      </motion.section>
    </main>
  );
}
