import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/assets';
import { findActiveLyricIndex, LrcLine, parseLrc } from '../lib/lrc';

interface UseLyricsOptions {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  lrcSrc: string;
  offsetMs: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  progressElRef: React.MutableRefObject<HTMLElement | null>;
}

export interface LyricsState {
  lines: LrcLine[];
  activeIndex: number;
  hasLyrics: boolean;
}

export function useLyrics({
  audioRef,
  lrcSrc,
  offsetMs,
  isPlaying,
  reducedMotion,
  progressElRef,
}: UseLyricsOptions): LyricsState {
  const [lines, setLines] = useState<LrcLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(assetUrl(lrcSrc));
        if (!res.ok) {
          if (active) {
            setLines([]);
            setActiveIndex(-1);
            lastIndexRef.current = -1;
          }
          return;
        }
        const text = await res.text();
        const parsed = parseLrc(text, offsetMs);
        if (active) {
          setLines(parsed);
          setActiveIndex(-1);
          lastIndexRef.current = -1;
        }
      } catch {
        if (active) {
          setLines([]);
          setActiveIndex(-1);
          lastIndexRef.current = -1;
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [lrcSrc, offsetMs]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || lines.length === 0) return;

    let rafId: number | null = null;

    const syncFrame = () => {
      const currentTime = audio.currentTime || 0;
      const idx = findActiveLyricIndex(lines, currentTime);

      if (idx !== lastIndexRef.current) {
        lastIndexRef.current = idx;
        setActiveIndex(idx);
      }

      const progressEl = progressElRef.current;
      if (progressEl) {
        if (reducedMotion || idx < 0) {
          progressEl.style.setProperty('--lyric-progress', idx >= 0 ? '100%' : '0%');
        } else {
          const start = lines[idx].timeSec;
          const fallbackEnd = Number.isFinite(audio.duration) && audio.duration > start ? audio.duration : start + 4;
          const end = idx + 1 < lines.length ? lines[idx + 1].timeSec : fallbackEnd;
          const span = Math.max(0.25, end - start);
          const ratio = Math.min(1, Math.max(0, (currentTime - start) / span));
          progressEl.style.setProperty('--lyric-progress', `${(ratio * 100).toFixed(1)}%`);
        }
      }

      if (isPlaying && !audio.paused) {
        rafId = requestAnimationFrame(syncFrame);
      }
    };

    syncFrame();

    const handleSeekOrChange = () => syncFrame();
    audio.addEventListener('seeked', handleSeekOrChange);
    audio.addEventListener('timeupdate', handleSeekOrChange);
    audio.addEventListener('ended', handleSeekOrChange);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      audio.removeEventListener('seeked', handleSeekOrChange);
      audio.removeEventListener('timeupdate', handleSeekOrChange);
      audio.removeEventListener('ended', handleSeekOrChange);
    };
  }, [audioRef, isPlaying, lines, progressElRef, reducedMotion]);

  return {
    lines,
    activeIndex,
    hasLyrics: lines.length > 0,
  };
}
