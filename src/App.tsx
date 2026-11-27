import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { content, SECTION_ORDER, SectionId } from './config/content';
import { assetUrl } from './lib/assets';
import { isSectionUnlocked, sanitizeVisitedSections } from './lib/progression';
import { useAudio } from './hooks/useAudio';
import { useTheme } from './hooks/useTheme';
import { AmbientEffects } from './components/AmbientEffects';
import { LyricsBar } from './components/LyricsBar';
import { BottomNav } from './components/BottomNav';
import { PageTransition } from './components/PageTransition';
import { WelcomeSplash } from './features/welcome/WelcomeSplash';
import { PinGate } from './features/gate/PinGate';
import { IntroScreen } from './features/intro/IntroScreen';
import { HubScreen } from './features/hub/HubScreen';

const TimelineSection = lazy(() => import('./features/timeline/TimelineSection'));
const CounterSection = lazy(() => import('./features/counter/CounterSection'));
const RewindSection = lazy(() => import('./features/rewind/RewindSection'));
const PhotoCardsSection = lazy(() => import('./features/photocards/PhotoCardsSection'));
const LetterSection = lazy(() => import('./features/letter/LetterSection'));

type Screen = 'welcome' | 'gate' | 'intro' | 'hub' | SectionId;

const SESSION_UNLOCK_KEY = 'anniv3yrs_unlocked';
const SESSION_VISITED_KEY = 'anniv3yrs_visited';

function readInitialUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function readInitialVisited(): SectionId[] {
  try {
    const raw = window.sessionStorage.getItem(SESSION_VISITED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return sanitizeVisitedSections(parsed);
  } catch {
    return [];
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => (readInitialUnlocked() ? 'hub' : 'welcome'));
  const [visitedSections, setVisitedSections] = useState<SectionId[]>(() => readInitialVisited());
  const [timelineRevealedCount, setTimelineRevealedCount] = useState<number>(() =>
    readInitialVisited().includes('timeline') ? content.timeline.length : 1
  );

  const audio = useAudio(content.song.loop);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = content.siteTitle;
  }, []);

  const markVisited = useCallback((section: SectionId) => {
    setVisitedSections((prev) => {
      if (prev.includes(section)) return prev;
      const next = [...prev, section];
      try {
        window.sessionStorage.setItem(SESSION_VISITED_KEY, JSON.stringify(next));
      } catch {
        // Abaikan jika sessionStorage tidak tersedia.
      }
      return next;
    });
  }, []);

  const handleAuthSuccess = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
    } catch {
      // Abaikan jika sessionStorage tidak tersedia.
    }
    void audio.playWithFadeIn(2000);
  }, [audio]);

  const handleWelcomeComplete = useCallback(() => {
    setScreen('gate');
  }, []);

  const handleUnlock = useCallback(() => {
    setScreen('intro');
  }, []);

  const handleSelectSection = useCallback(
    (section: SectionId) => {
      if (!isSectionUnlocked(section, visitedSections)) {
        return;
      }
      // Jejak Kita selesai ditandai setelah semua kartu terbuka.
      if (section !== 'timeline') {
        markVisited(section);
      }
      setScreen(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [markVisited, visitedSections]
  );

  const handleLockSite = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    } catch {
      // Abaikan jika sessionStorage tidak tersedia.
    }
    if (audio.audioRef.current && !audio.audioRef.current.paused) {
      audio.audioRef.current.pause();
    }
    setScreen('gate');
  }, [audio.audioRef]);

  const isSection =
    screen !== 'welcome' &&
    screen !== 'gate' &&
    screen !== 'intro' &&
    screen !== 'hub';
  const currentSectionIdx = isSection ? SECTION_ORDER.indexOf(screen) : -1;
  const nextSection =
    currentSectionIdx >= 0 && currentSectionIdx < SECTION_ORDER.length - 1
      ? SECTION_ORDER[currentSectionIdx + 1]
      : null;
  const canGoNext = nextSection
    ? isSectionUnlocked(nextSection, visitedSections)
    : true;

  return (
    <div className="relative min-h-dvh w-full bg-sage-50 text-ink">
      <audio
        ref={audio.audioRef}
        src={assetUrl(content.song.audioSrc)}
        preload="auto"
      />

      <AmbientEffects />

      {screen !== 'welcome' && screen !== 'gate' && (
        <LyricsBar
          audio={audio}
          title={content.song.title}
          artist={content.song.artist}
          coverSrc={content.song.coverSrc}
          lrcSrc={content.song.lrcSrc}
          lyricsOffsetMs={content.song.lyricsOffsetMs}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <PageTransition screenKey={screen}>
        {screen === 'welcome' && (
          <WelcomeSplash onComplete={handleWelcomeComplete} />
        )}

        {screen === 'gate' && (
          <PinGate
            partnerName={content.partnerName}
            pinLength={content.pin.length}
            pinHash={content.pin.hash}
            pinHint={content.pin.hint}
            theme={theme}
            onToggleTheme={toggleTheme}
            onAuthSuccess={handleAuthSuccess}
            onUnlock={handleUnlock}
          />
        )}

        {screen === 'intro' && (
          <IntroScreen
            partnerName={content.partnerName}
            myName={content.myName}
            siteTitle={content.siteTitle}
            theme={theme}
            onStart={() => setScreen('hub')}
          />
        )}

        {screen === 'hub' && (
          <HubScreen
            partnerName={content.partnerName}
            siteTitle={content.siteTitle}
            visitedSections={visitedSections}
            onSelectSection={handleSelectSection}
            onReplayIntro={() => setScreen('intro')}
            onLockSite={handleLockSite}
          />
        )}

        {isSection && (
          <Suspense fallback={<SectionLoading />}>
            {screen === 'timeline' && (
              <TimelineSection
                initialRevealedCount={timelineRevealedCount}
                onRevealedCountChange={setTimelineRevealedCount}
                onComplete={() => markVisited('timeline')}
                onBackToHub={() => setScreen('hub')}
                onNextSection={handleSelectSection}
              />
            )}
            {screen === 'counter' && (
              <CounterSection
                onBackToHub={() => setScreen('hub')}
                onNextSection={handleSelectSection}
              />
            )}
            {screen === 'rewind' && (
              <RewindSection
                bgAudioRef={audio.audioRef}
                onBackToHub={() => setScreen('hub')}
                onNavigateSection={handleSelectSection}
              />
            )}
            {screen === 'photocards' && (
              <PhotoCardsSection
                onBackToHub={() => setScreen('hub')}
                onNextSection={handleSelectSection}
              />
            )}
            {screen === 'letter' && (
              <LetterSection
                onBackToHub={() => setScreen('hub')}
                onNextSection={handleSelectSection}
              />
            )}
          </Suspense>
        )}
      </PageTransition>

      {isSection && (
        <BottomNav
          currentSection={screen}
          canGoNext={canGoNext}
          onBackToHub={() => setScreen('hub')}
          onNavigateSection={handleSelectSection}
        />
      )}
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 pt-20">
      <div className="rounded-3xl border border-sage-200 bg-cream px-6 py-4 text-sm font-semibold text-sage-700 shadow-sage-sm">
        {content.navigation.loadingPageText}
      </div>
    </div>
  );
}
