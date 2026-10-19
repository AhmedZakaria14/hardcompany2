import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Property, Language } from '../types';
import {
  formatCurrency as formatCurrencyBase,
  formatArea as formatAreaBase,
  formatPricePerSqM as formatPricePerSqMBase,
} from './formatters';

export {
  formatCurrency,
  formatCompactCurrency,
  formatArea,
  formatBUA,
  formatPricePerSqM,
  formatBillingPeriod,
  formatBedroomsCount,
  formatBathroomsCount,
  formatYearsCount,
  formatHoursCount,
  formatLocaleDate,
  getPropertyStatusLabel,
  getConstructionCategoryLabel,
  getHVACServiceLabel,
  COMMON_ACTION_LABELS,
} from './formatters';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts a localized string from an object, string, or undefined value.
 */
export function getLocalizedText(
  value: Record<string, any> | string | null | undefined,
  lang: Language = 'en'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[lang] || value['en'] || value['ar'] || '';
  }
  return String(value);
}

/**
 * Returns square meters for a property, prioritizing areaSqM and falling back to converting areaSqFt once.
 */
export function getPropertyAreaSqM(property: { areaSqM?: number; areaSqFt?: number }): number {
  if (typeof property.areaSqM === 'number' && property.areaSqM > 0) {
    return property.areaSqM;
  }
  if (typeof property.areaSqFt === 'number' && property.areaSqFt > 0) {
    return Math.round(property.areaSqFt * 0.092903);
  }
  return 0;
}

/**
 * Returns square feet for a property, prioritizing areaSqFt and falling back to converting areaSqM once.
 */
export function getPropertyAreaSqFt(property: { areaSqM?: number; areaSqFt?: number }): number {
  if (typeof property.areaSqFt === 'number' && property.areaSqFt > 0) {
    return property.areaSqFt;
  }
  if (typeof property.areaSqM === 'number' && property.areaSqM > 0) {
    return Math.round(property.areaSqM * 10.7639);
  }
  return 0;
}

/**
 * Formats a property's area with square meters (m² / م²) as the primary unit.
 * Optionally includes square feet (sq ft / قدم²) as a secondary unit in parentheses.
 */
export function formatPropertyArea(
  property: { areaSqM?: number; areaSqFt?: number },
  language: Language = 'en',
  options?: { showSecondary?: boolean }
): string {
  const sqM = getPropertyAreaSqM(property);
  return formatAreaBase(sqM, language, { showSecondarySqFt: options?.showSecondary });
}

/**
 * Synchronizes and formats a property's amenity list with its authoritative structured data
 * (e.g. features.parkingSpaces), ensuring no contradictory counts between summary and amenities.
 */
export function getNormalizedAmenities(
  property: Property,
  language: Language = 'en'
): string[] {
  const isAr = language === 'ar';
  const rawAmenities = property.amenities?.[language] || [];
  const parkingCount = property.features?.parkingSpaces ?? 0;

  // Formatted parking amenity text derived strictly from authoritative parkingSpaces count
  let formattedParkingAmenity = '';
  if (parkingCount > 0) {
    if (isAr) {
      if (parkingCount === 1) formattedParkingAmenity = 'موقف سيارة مغطى';
      else if (parkingCount === 2) formattedParkingAmenity = 'موقفان مغطيان للسيارات';
      else if (parkingCount >= 3 && parkingCount <= 10) formattedParkingAmenity = `${parkingCount} مواقف سيارات مغطاة`;
      else formattedParkingAmenity = `${parkingCount} موقف سيارة مغطى`;
    } else {
      formattedParkingAmenity = `${parkingCount} Covered Parking ${parkingCount === 1 ? 'Space' : 'Spaces'}`;
    }
  }

  const parkingRegex = /parking|garage|bay|slot|مواقف|كراج|موقف/i;
  let parkingReplaced = false;

  const normalized = rawAmenities.map((item) => {
    if (parkingRegex.test(item)) {
      parkingReplaced = true;
      return formattedParkingAmenity || item;
    }
    return item;
  });

  if (!parkingReplaced && formattedParkingAmenity) {
    normalized.push(formattedParkingAmenity);
  }

  return normalized.filter((item) => Boolean(item && item.trim()));
}
