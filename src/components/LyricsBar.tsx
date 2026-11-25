import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Music2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AudioControls } from '../hooks/useAudio';
import { useLyrics } from '../hooks/useLyrics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ThemeMode } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

interface LyricsBarProps {
  audio: AudioControls;
  title: string;
  artist: string;
  lrcSrc: string;
  lyricsOffsetMs: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function LyricsBar({
  audio,
  title,
  artist,
  lrcSrc,
  lyricsOffsetMs,
  theme,
  onToggleTheme,
}: LyricsBarProps) {
  const reducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const { lines, activeIndex, hasLyrics } = useLyrics({
    audioRef: audio.audioRef,
    lrcSrc,
    offsetMs: lyricsOffsetMs,
    isPlaying: audio.isPlaying,
    reducedMotion,
    progressElRef: progressRef,
  });

  const prevLine = activeIndex > 0 ? lines[activeIndex - 1]?.text : '';
  const activeLine = activeIndex >= 0 ? lines[activeIndex]?.text : '';
  const nextLine =
    activeIndex >= 0 && activeIndex + 1 < lines.length
      ? lines[activeIndex + 1]?.text
      : activeIndex === -1 && lines.length > 0
      ? lines[0]?.text
      : '';

  if (collapsed) {
    return (
      <div className="pt-safe pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-end gap-2 px-3 pt-2.5 sm:px-6">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="pointer-events-auto" />

        <motion.div
          layout
          initial={{ opacity: 0, y: -10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-sage pointer-events-auto flex items-center gap-1.5 rounded-pill border border-sage-200/90 p-1.5 pl-3 shadow-sage-md"
        >
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Buka pemutar lagu dan lirik"
            className="focus-ring flex min-h-[44px] items-center gap-2.5 rounded-pill pr-2 text-left"
          >
            <EqualizerBars active={audio.isPlaying && !audio.isMuted} reducedMotion={reducedMotion} />
            <span className="max-w-[115px] truncate text-xs font-bold text-sage-800">
              {title}
            </span>
          </button>

          <button
            type="button"
            onClick={() => audio.togglePlay()}
            aria-label={audio.isPlaying ? 'Jeda lagu' : 'Putar lagu'}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-sage-600 text-[#FBF8EF] transition hover:bg-sage-500 active:scale-95"
          >
            {audio.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5" />
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-safe pointer-events-none fixed inset-x-0 top-0 z-30 px-2 pt-2 sm:px-4">
      <motion.header
        layout
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="glass-sage pointer-events-auto mx-auto max-w-xl rounded-[26px] border border-sage-200/90 px-3 py-2.5 shadow-sage-md"
      >
        <div className="flex items-center gap-2.5">
          {/* Piringan vinyl kecil */}
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-sage-400 bg-[#2B3827] shadow-sage-sm ${
              audio.isPlaying && !reducedMotion ? 'animate-[spin_7s_linear_infinite]' : ''
            }`}
            aria-hidden="true"
          >
            <div className="h-6 w-6 rounded-full border border-sage-500/60" />
            <div className="absolute h-3.5 w-3.5 rounded-full bg-blush ring-2 ring-[#E6EDE1]" />
            <div className="absolute h-1 w-1 rounded-full bg-[#2B3827]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sage-700">
              <Music2 className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate font-bold text-sage-900">{title}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{artist}</span>
            </div>

            {!hasLyrics && (
              <p className="mt-0.5 truncate text-xs font-semibold text-sage-700">
                {title} · {artist}
              </p>
            )}
          </div>

          {/* Tombol kontrol + mode tema */}
          <div className="flex shrink-0 items-center gap-1">
            {audio.autoplayBlocked ? (
              <motion.button
                type="button"
                onClick={() => audio.togglePlay()}
                animate={reducedMotion ? undefined : { scale: [1, 1.05, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Putar lagu</span>
              </motion.button>
            ) : audio.isEnded ? (
              <button
                type="button"
                onClick={() => audio.replay()}
                className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Putar lagi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => audio.togglePlay()}
                aria-label={audio.isPlaying ? 'Jeda lagu' : 'Putar lagu'}
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-sage-600 text-[#FBF8EF] shadow-sage-sm transition hover:bg-sage-500 active:scale-95"
              >
                {audio.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 translate-x-0.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => audio.toggleMute()}
              aria-label={audio.isMuted ? 'Nyalakan suara lagu' : 'Bisukan lagu'}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-sage-700 transition hover:bg-sage-100 active:scale-95"
            >
              {audio.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Kecilkan pemutar lagu"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-sage-700 transition hover:bg-sage-100 active:scale-95"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Baris lirik tersinkronisasi penuh lebar agar nyaman dibaca di layar kecil */}
        {hasLyrics && (
          <div className="mt-1.5 border-t border-sage-200/70 pt-1.5">
            <div className="h-3.5 truncate text-[10px] font-medium text-sage-700/70">
              {prevLine}
            </div>

            <div className="relative min-h-[22px] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeIndex >= 0 ? `${activeIndex}-${activeLine}` : 'waiting'}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="truncate text-sm font-bold leading-snug"
                >
                  {activeIndex >= 0 ? (
                    <span ref={progressRef} className="lyric-sweep">
                      {activeLine}
                    </span>
                  ) : (
                    <span className="text-sage-700">Siap memutar lirik</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="h-3.5 truncate text-[10px] font-medium text-sage-700/75">
              {nextLine}
            </div>
          </div>
        )}
      </motion.header>
    </div>
  );
}

function EqualizerBars({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const heights = [0.45, 0.9, 0.6];
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {heights.map((base, idx) => (
        <motion.span
          key={idx}
          className="w-1 rounded-full bg-sage-600"
          animate={
            active && !reducedMotion
              ? { height: ['35%', '100%', '45%', '85%', '35%'] }
              : { height: `${Math.round(base * 100)}%` }
          }
          transition={
            active && !reducedMotion
              ? { duration: 0.9 + idx * 0.2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}
