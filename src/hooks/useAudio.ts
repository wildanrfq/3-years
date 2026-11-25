import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioControls {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  isEnded: boolean;
  autoplayBlocked: boolean;
  playWithFadeIn: (durationMs?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  toggleMute: () => void;
  replay: () => Promise<void>;
}

export function useAudio(loop: boolean): AudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const cancelFade = useCallback(() => {
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  const setSafeVolume = (audio: HTMLAudioElement, value: number) => {
    try {
      audio.volume = Math.min(1, Math.max(0, value));
    } catch {
      // Beberapa browser mobile mengunci audio.volume sebagai read-only.
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = loop;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsEnded(false);
      setAutoplayBlocked(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (!loop) {
        setIsEnded(true);
      }
    };
    const handleVolumeChange = () => {
      setIsMuted(audio.muted);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      cancelFade();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [cancelFade, loop]);

  const playWithFadeIn = useCallback(
    async (durationMs = 2000) => {
      const audio = audioRef.current;
      if (!audio) return;

      cancelFade();
      setIsEnded(false);
      setSafeVolume(audio, 0);

      try {
        await audio.play();
        setAutoplayBlocked(false);

        const startTime = performance.now();
        const step = (now: number) => {
          if (audio.paused) {
            fadeRafRef.current = null;
            return;
          }
          const progress = Math.min(1, (now - startTime) / durationMs);
          setSafeVolume(audio, progress);
          if (progress < 1) {
            fadeRafRef.current = requestAnimationFrame(step);
          } else {
            fadeRafRef.current = null;
          }
        };

        fadeRafRef.current = requestAnimationFrame(step);
      } catch {
        setSafeVolume(audio, 1);
        setAutoplayBlocked(true);
      }
    },
    [cancelFade]
  );

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      cancelFade();
      if (isEnded || (audio.duration > 0 && audio.currentTime >= audio.duration - 0.1)) {
        audio.currentTime = 0;
      }
      setSafeVolume(audio, 1);
      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      cancelFade();
      audio.pause();
    }
  }, [cancelFade, isEnded]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const replay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelFade();
    audio.currentTime = 0;
    setSafeVolume(audio, 1);
    setIsEnded(false);
    try {
      await audio.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, [cancelFade]);

  return {
    audioRef,
    isPlaying,
    isMuted,
    isEnded,
    autoplayBlocked,
    playWithFadeIn,
    togglePlay,
    toggleMute,
    replay,
  };
}
