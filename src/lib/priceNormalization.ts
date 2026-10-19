import { Property } from '../types';

export type RentalPeriod = 'year' | 'month';

export const DEFAULT_PURCHASE_MAX = 50000000;
export const DEFAULT_RENTAL_YEAR_MAX = 500000;
export const DEFAULT_RENTAL_MONTH_MAX = 50000;

/**
 * Normalizes a property's rental price to the target period ('year' or 'month').
 * If the property is for sale or lacks a rental period, its native SAR price is returned.
 */
export function getNormalizedPropertyPrice(
  property: Property,
  targetRentalPeriod: RentalPeriod = 'year'
): number {
  if (property.status !== 'for-rent' && !property.price.period) {
    return property.price.sar;
  }

  const nativePeriod = property.price.period || 'year';

  if (nativePeriod === targetRentalPeriod) {
    return property.price.sar;
  }

  if (nativePeriod === 'year' && targetRentalPeriod === 'month') {
    return Math.round(property.price.sar / 12);
  }

  if (nativePeriod === 'month' && targetRentalPeriod === 'year') {
    return Math.round(property.price.sar * 12);
  }

  return property.price.sar;
}

/**
 * Formats a SAR amount with proper currency symbol and optional payment period label.
 */
export function formatNormalizedPrice(
  amount: number,
  period?: 'year' | 'month',
  language: 'en' | 'ar' = 'en'
): string {
  const formatted = amount.toLocaleString();
  if (!period) return language === 'ar' ? `${formatted} ر.س` : `${formatted} SAR`;
  if (language === 'ar') {
    return period === 'year' ? `${formatted} ر.س / سنوياً` : `${formatted} ر.س / شهرياً`;
  }
  return period === 'year' ? `${formatted} SAR / yr` : `${formatted} SAR / mo`;
}
