import { SECTION_ORDER, SectionId } from '../config/content';

/**
 * Ensures stored visited sections form a valid contiguous chronological prefix
 * starting from the first section in SECTION_ORDER.
 */
export function sanitizeVisitedSections(raw: unknown): SectionId[] {
  if (!Array.isArray(raw)) return [];
  const validSet = new Set(
    raw.filter((id): id is SectionId => SECTION_ORDER.includes(id as SectionId))
  );

  const contiguous: SectionId[] = [];
  for (const id of SECTION_ORDER) {
    if (validSet.has(id)) {
      contiguous.push(id);
    } else {
      break;
    }
  }
  return contiguous;
}

/**
 * Returns true only when all earlier sections in SECTION_ORDER have been completed.
 */
export function isSectionUnlocked(
  section: SectionId,
  visitedSections: SectionId[]
): boolean {
  const idx = SECTION_ORDER.indexOf(section);
  if (idx < 0) return false;
  if (idx === 0) return true;

  for (let i = 0; i < idx; i += 1) {
    if (!visitedSections.includes(SECTION_ORDER[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Returns the next chronological section that has not been completed yet.
 */
export function getNextPendingSection(
  visitedSections: SectionId[]
): SectionId | null {
  return SECTION_ORDER.find((id) => !visitedSections.includes(id)) ?? null;
}
