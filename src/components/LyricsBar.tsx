import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { content } from '../config/content';
import { AudioControls } from '../hooks/useAudio';
import { useLyrics } from '../hooks/useLyrics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GENTLE_EASE } from '../lib/motion';
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
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 1024;
  });
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

  return (
    <div className="pt-safe pointer-events-none fixed right-2.5 top-2.5 z-30 flex max-w-[calc(100vw-20px)] flex-col items-end gap-2 sm:right-5 sm:top-4">
      {collapsed ? (
        <motion.div
          layout
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: GENTLE_EASE }}
          className="pointer-events-auto flex max-w-full items-center gap-1.5"
        >
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <div className="glass-sage flex min-w-0 max-w-[calc(100vw-72px)] items-center gap-1.5 rounded-pill border border-sage-200/90 p-1 shadow-sage-md sm:max-w-[300px]">
            {audio.autoplayBlocked ? (
              <motion.button
                type="button"
                onClick={() => audio.togglePlay()}
                animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="focus-ring inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{content.musicPlayer.playSongLabel}</span>
              </motion.button>
            ) : audio.isEnded ? (
              <button
                type="button"
                onClick={() => audio.replay()}
                className="focus-ring inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{content.musicPlayer.replaySongLabel}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => audio.togglePlay()}
                aria-label={audio.isPlaying ? 'Jeda lagu' : 'Putar lagu'}
                className="focus-ring relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-600 text-[#FBF8EF] shadow-sage-sm transition hover:bg-sage-500 active:scale-95"
              >
                {audio.isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4 translate-x-0.5" aria-hidden="true" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Buka pemutar lagu dan lirik lengkap"
              className="focus-ring flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-pill px-1.5 text-left"
            >
              <EqualizerBars
                active={audio.isPlaying && !audio.isMuted}
                reducedMotion={reducedMotion}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-bold text-sage-600">
                  {title} · {artist}
                </div>
                {hasLyrics && (
                  <div className="truncate text-[11px] font-bold leading-tight">
                    {activeIndex >= 0 ? (
                      <span ref={progressRef} className="lyric-sweep">
                        {activeLine}
                      </span>
                    ) : (
                      <span className="text-sage-800">{nextLine || content.musicPlayer.waitingLyricsLabel}</span>
                    )}
                  </div>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.aside
          layout
          aria-label="Pemutar lagu dan lirik"
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.52, ease: GENTLE_EASE }}
          className="glass-sage pointer-events-auto w-[min(308px,calc(100vw-20px))] rounded-[26px] border border-sage-200/90 p-3 shadow-sage-lg"
        >
          <div className="flex items-center gap-2">
            {/* Piringan vinyl kecil */}
            <div
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sage-400 bg-[#2B3827] shadow-sage-sm ${
                audio.isPlaying && !reducedMotion ? 'animate-[spin_7s_linear_infinite]' : ''
              }`}
              aria-hidden="true"
            >
              <div className="h-5 w-5 rounded-full border border-sage-500/60" />
              <div className="absolute h-3 w-3 rounded-full bg-blush ring-2 ring-[#E6EDE1]" />
              <div className="absolute h-1 w-1 rounded-full bg-[#2B3827]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-sage-900">
                <Music2 className="h-3 w-3 shrink-0 text-sage-600" aria-hidden="true" />
                <span className="truncate">{title}</span>
              </div>
              <div className="truncate text-[10px] font-semibold text-sage-600">
                {artist}
              </div>
            </div>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Kecilkan pemutar lagu"
              className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/90 text-sage-700 transition hover:bg-sage-100 active:scale-95"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {hasLyrics && (
            <div className="mt-2 border-t border-sage-200/70 pt-2">
              <div className="h-3.5 truncate text-[10px] font-medium text-sage-700/70">
                {prevLine}
              </div>

              <div className="relative min-h-[22px] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeIndex >= 0 ? `${activeIndex}-${activeLine}` : 'waiting'}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.45, ease: GENTLE_EASE }}
                    className="truncate text-xs font-bold leading-snug"
                  >
                    {activeIndex >= 0 ? (
                      <span ref={progressRef} className="lyric-sweep">
                        {activeLine}
                      </span>
                    ) : (
                      <span className="text-sage-700">{content.musicPlayer.waitingLyricsLabel}</span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-3.5 truncate text-[10px] font-medium text-sage-700/75">
                {nextLine}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-sage-200/60 pt-2">
            {audio.autoplayBlocked ? (
              <motion.button
                type="button"
                onClick={() => audio.togglePlay()}
                animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{content.musicPlayer.playSongLabel}</span>
              </motion.button>
            ) : audio.isEnded ? (
              <button
                type="button"
                onClick={() => audio.replay()}
                className="focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm hover:bg-sage-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{content.musicPlayer.replaySongLabel}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => audio.togglePlay()}
                className="focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-pill bg-sage-600 px-3 text-xs font-bold text-[#FBF8EF] shadow-sage-sm transition hover:bg-sage-500 active:scale-95"
              >
                {audio.isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{content.musicPlayer.pauseLabel}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{content.musicPlayer.playLabel}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => audio.toggleMute()}
              aria-label={audio.isMuted ? 'Nyalakan suara lagu' : 'Bisukan lagu'}
              className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/90 text-sage-700 transition hover:bg-sage-100 active:scale-95"
            >
              {audio.isMuted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </motion.aside>
      )}
    </div>
  );
}

function EqualizerBars({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const heights = [0.45, 0.9, 0.6];
  return (
    <span className="flex h-3.5 shrink-0 items-end gap-0.5" aria-hidden="true">
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
