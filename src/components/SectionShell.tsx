import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { SECTION_META, SECTION_ORDER, SectionId } from '../config/content';
import { SquishyButton } from './SquishyButton';

interface SectionShellProps {
  section: SectionId;
  children: ReactNode;
  onNextSection: (next: SectionId) => void;
  onBackToHub: () => void;
  hideFooterCta?: boolean;
  wide?: boolean;
}

export function SectionShell({
  section,
  children,
  onNextSection,
  onBackToHub,
  hideFooterCta = false,
  wide = false,
}: SectionShellProps) {
  const idx = SECTION_ORDER.indexOf(section);
  const nextSection = idx >= 0 && idx < SECTION_ORDER.length - 1 ? SECTION_ORDER[idx + 1] : null;
  const meta = SECTION_META[section];

  return (
    <main
      className={`relative z-10 mx-auto flex min-h-dvh w-full ${
        wide ? 'max-w-5xl' : 'max-w-3xl'
      } flex-col px-4 pb-28 pt-20 sm:px-6 sm:pt-14`}
    >
      <header className="mb-6 text-center">
        <span className="inline-block rounded-pill bg-sage-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sage-700">
          Bagian {idx + 1} dari {SECTION_ORDER.length}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-sage-900 sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-sage-700">{meta.subtitle}</p>
      </header>

      <div className="flex-1">{children}</div>

      {!hideFooterCta && (
        <div className="mt-10 flex flex-col items-center gap-3 pb-4">
          {nextSection ? (
            <SquishyButton onClick={() => onNextSection(nextSection)} className="w-full max-w-xs">
              <span>Lanjut ke {SECTION_META[nextSection].title}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </SquishyButton>
          ) : (
            <SquishyButton onClick={onBackToHub} variant="secondary" className="w-full max-w-xs">
              <span>Kembali ke menu utama</span>
            </SquishyButton>
          )}
        </div>
      )}
    </main>
  );
}
