import { useCallback, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { content, SECTION_META, SectionId } from './config/content';
import { assetUrl } from './lib/assets';
import { useAudio } from './hooks/useAudio';
import { AmbientEffects } from './components/AmbientEffects';
import { LyricsBar } from './components/LyricsBar';
import { BottomNav } from './components/BottomNav';
import { PageTransition } from './components/PageTransition';
import { SectionShell } from './components/SectionShell';
import { Mascot } from './components/Mascot';
import { PinGate } from './features/gate/PinGate';
import { IntroScreen } from './features/intro/IntroScreen';
import { HubScreen } from './features/hub/HubScreen';

type Screen = 'gate' | 'intro' | 'hub' | SectionId;

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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => (readInitialUnlocked() ? 'hub' : 'gate'));
  const [visitedSections, setVisitedSections] = useState<SectionId[]>(() => readInitialVisited());

  const audio = useAudio(content.song.loop);

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

  const handleUnlock = useCallback(() => {
    setScreen('intro');
  }, []);

  const handleSelectSection = useCallback(
    (section: SectionId) => {
      markVisited(section);
      setScreen(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [markVisited]
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
    screen !== 'gate' && screen !== 'intro' && screen !== 'hub';

  return (
    <div className="relative min-h-dvh w-full bg-sage-50 text-ink">
      {/* Elemen audio tunggal di root agar lagu tidak pernah terputus antar halaman */}
      <audio
        ref={audio.audioRef}
        src={assetUrl(content.song.audioSrc)}
        preload="auto"
      />

      <AmbientEffects />

      {screen !== 'gate' && (
        <LyricsBar
          audio={audio}
          title={content.song.title}
          artist={content.song.artist}
          lrcSrc={content.song.lrcSrc}
          lyricsOffsetMs={content.song.lyricsOffsetMs}
        />
      )}

      <PageTransition screenKey={screen}>
        {screen === 'gate' && (
          <PinGate
            partnerName={content.partnerName}
            pinLength={content.pin.length}
            pinHash={content.pin.hash}
            pinHint={content.pin.hint}
            onAuthSuccess={handleAuthSuccess}
            onUnlock={handleUnlock}
          />
        )}

        {screen === 'intro' && (
          <IntroScreen
            partnerName={content.partnerName}
            myName={content.myName}
            siteTitle={content.siteTitle}
            onStart={() => setScreen('hub')}
          />
        )}

        {screen === 'hub' && (
          <HubScreen
            partnerName={content.partnerName}
            siteTitle={content.siteTitle}
            visitedSections={visitedSections}
            lockLetterUntilAllVisited={content.ui.lockLetterUntilAllVisited}
            onSelectSection={handleSelectSection}
            onReplayIntro={() => setScreen('intro')}
            onLockSite={handleLockSite}
          />
        )}

        {isSection && (
          <SectionPreviewShell
            section={screen}
            onBackToHub={() => setScreen('hub')}
            onNextSection={handleSelectSection}
          />
        )}
      </PageTransition>

      {isSection && (
        <BottomNav
          currentSection={screen}
          onBackToHub={() => setScreen('hub')}
          onNavigateSection={handleSelectSection}
        />
      )}
    </div>
  );
}

function SectionPreviewShell({
  section,
  onBackToHub,
  onNextSection,
}: {
  section: SectionId;
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}) {
  const meta = SECTION_META[section];
  return (
    <SectionShell
      section={section}
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
    >
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[28px] border border-sage-200 bg-cream p-6 text-center shadow-sage-md">
        <Mascot
          mood={section === 'letter' ? 'cheering' : 'curious'}
          size="md"
          message="Siap diisi di tahap berikutnya!"
        />
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Pratinjau navigasi</span>
        </span>
        <p className="mt-3 text-sm leading-relaxed text-sage-700">
          Halaman <strong className="text-sage-900">{meta.title}</strong> akan kita isi penuh di fase
          berikutnya. Sekarang kamu bisa coba pindah antar menu sambil mendengarkan musik di atas.
        </p>
      </div>
    </SectionShell>
  );
}
