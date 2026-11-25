import { ArrowLeft, ArrowRight, LayoutGrid, Lock } from 'lucide-react';
import { SECTION_META, SECTION_ORDER, SectionId } from '../config/content';

interface BottomNavProps {
  currentSection: SectionId;
  canGoNext: boolean;
  onBackToHub: () => void;
  onNavigateSection: (section: SectionId) => void;
}

export function BottomNav({
  currentSection,
  canGoNext,
  onBackToHub,
  onNavigateSection,
}: BottomNavProps) {
  const idx = SECTION_ORDER.indexOf(currentSection);
  const prevSection = idx > 0 ? SECTION_ORDER[idx - 1] : null;
  const nextSection = idx >= 0 && idx < SECTION_ORDER.length - 1 ? SECTION_ORDER[idx + 1] : null;

  return (
    <nav
      aria-label="Navigasi bagian"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 px-2 pb-2 sm:px-4"
    >
      <div className="glass-sage mx-auto flex max-w-xl items-center justify-between gap-2 rounded-[26px] border border-sage-200/90 px-2.5 py-2 shadow-sage-md">
        <button
          type="button"
          onClick={onBackToHub}
          className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-pill bg-cream px-3.5 py-2 text-xs font-bold text-sage-800 shadow-sage-sm transition-all duration-300 hover:bg-sage-100 active:scale-[0.97]"
        >
          <LayoutGrid className="h-4 w-4 text-sage-600" aria-hidden="true" />
          <span>Kembali ke menu</span>
        </button>

        <div className="flex items-center gap-1.5">
          {prevSection && (
            <button
              type="button"
              onClick={() => onNavigateSection(prevSection)}
              className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill border border-sage-200 bg-cream/90 px-3 py-2 text-xs font-bold text-sage-700 transition-all duration-300 hover:bg-sage-100 active:scale-[0.97]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{SECTION_META[prevSection].shortLabel}</span>
            </button>
          )}

          {nextSection ? (
            canGoNext ? (
              <button
                type="button"
                onClick={() => onNavigateSection(nextSection)}
                className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill bg-sage-600 px-3.5 py-2 text-xs font-bold text-[#FBF8EF] shadow-sage-sm transition-all duration-300 hover:bg-sage-500 active:scale-[0.97]"
              >
                <span>Lanjut</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                aria-label={`Selesaikan ${SECTION_META[currentSection].title} terlebih dulu sebelum lanjut`}
                className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-1.5 rounded-pill bg-sage-200/80 px-3.5 py-2 text-xs font-bold text-sage-600 transition-colors duration-300"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Selesaikan dulu</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onBackToHub}
              className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-pill bg-sage-600 px-3.5 py-2 text-xs font-bold text-[#FBF8EF] shadow-sage-sm transition-all duration-300 hover:bg-sage-500 active:scale-[0.97]"
            >
              <span>Menu utama</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
