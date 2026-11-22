import type { AppLanguage } from '../types/vibeatlas';

export interface TranslationItem {
  id: number;
  text: string;
}

export const TRANSLATION_BATCH_SIZE = 15;

/** Splits translation items into API-sized batches (order preserved). */
export function chunkTranslationItems<T extends TranslationItem>(
  items: readonly T[],
  size: number = TRANSLATION_BATCH_SIZE
): T[][] {
  const batchSize =
    Number.isFinite(size) && size >= 1 ? Math.floor(size) : TRANSLATION_BATCH_SIZE;
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

// Heuristic only: no language-detection dependency is bundled. Text containing
// Hangul is treated as Korean; anything else is treated as already being in the
// target language for `en`, and as needing translation for `ko`.
const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

export function needsDescriptionTranslation(
  text: string,
  language: AppLanguage
): boolean {
  if (!text || !text.trim()) return false;
  const hasHangul = HANGUL.test(text);
  if (language === 'ko') return !hasHangul;
  if (language === 'en') return hasHangul;
  return false;
}

export interface DisplayedRepoDescription {
  text: string;
  hasTranslation: boolean;
  isTranslated: boolean;
}

export interface ResolveDescriptionInput {
  repoId: number;
  originalDescription: string;
  translationsMap: Record<number, string> | undefined;
  showOriginal: boolean;
}

export function resolveDisplayedRepoDescription(input: ResolveDescriptionInput): DisplayedRepoDescription {
  const { repoId, originalDescription, translationsMap, showOriginal } = input;
  const translated = translationsMap?.[repoId];
  const hasTranslation = typeof translated === 'string' && translated.trim().length > 0;
  if (showOriginal || !hasTranslation) {
    return { text: originalDescription, hasTranslation, isTranslated: false };
  }
  return { text: translated.trim(), hasTranslation: true, isTranslated: true };
}
