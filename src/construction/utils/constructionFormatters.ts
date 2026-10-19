import { Language } from '../../types';
import { ConstructionProject } from '../types';
import {
  getConstructionCategoryLabel,
  formatBUA,
  formatArea,
} from '../../lib/formatters';

/**
 * Maps internal category identifiers to localized display labels
 */
export function getLocalizedCategoryLabel(
  category: ConstructionProject['category'] | string,
  language: Language
): string {
  return getConstructionCategoryLabel(category, language);
}

/**
 * Shared locale-aware unit formatting for Built-Up Area (BUA)
 */
export function formatAreaBUA(areaM2: number, language: Language): string {
  return formatBUA(areaM2, language);
}

/**
 * Simple locale-aware area unit formatting (square meters)
 */
export function formatAreaSimple(areaM2: number, language: Language): string {
  return formatArea(areaM2, language);
}
