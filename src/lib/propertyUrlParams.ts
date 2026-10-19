import { PropertyType } from '../types';
import { RentalPeriod, DEFAULT_PURCHASE_MAX, DEFAULT_RENTAL_YEAR_MAX, DEFAULT_RENTAL_MONTH_MAX } from './priceNormalization';
import { ALL_PROPERTY_TYPE_IDS } from './propertyTaxonomy';

export type PropertySortOption = 'featured' | 'price-asc' | 'price-desc' | 'area-desc' | 'beds-desc';
export type PropertyViewMode = 'grid' | 'list' | 'map';
export type PropertyStatusFilter = 'all' | 'for-sale' | 'for-rent' | 'off-plan';
export type PropertyTypeFilter = 'all' | PropertyType;
export type PropertyBedroomFilter = 'all' | '1' | '2' | '3' | '4' | '5+';

export interface PropertyFilterUrlState {
  searchQuery: string;
  city: string;
  type: PropertyTypeFilter;
  status: PropertyStatusFilter;
  rentalPeriod: RentalPeriod;
  minPrice: number;
  maxPrice: number;
  bedroom: PropertyBedroomFilter;
  sortBy: PropertySortOption;
  viewMode: PropertyViewMode;
}

export const DEFAULT_PROPERTY_FILTER_STATE: PropertyFilterUrlState = {
  searchQuery: '',
  city: 'all',
  type: 'all',
  status: 'all',
  rentalPeriod: 'year',
  minPrice: 0,
  maxPrice: DEFAULT_PURCHASE_MAX,
  bedroom: 'all',
  sortBy: 'featured',
  viewMode: 'grid',
};

const VALID_TYPES: PropertyTypeFilter[] = ['all', ...ALL_PROPERTY_TYPE_IDS];
const VALID_STATUSES: PropertyStatusFilter[] = ['all', 'for-sale', 'for-rent', 'off-plan'];
const VALID_BEDROOMS: PropertyBedroomFilter[] = ['all', '1', '2', '3', '4', '5+'];
const VALID_SORTS: PropertySortOption[] = ['featured', 'price-asc', 'price-desc', 'area-desc', 'beds-desc'];
const VALID_VIEWS: PropertyViewMode[] = ['grid', 'list', 'map'];

/**
 * Parses and validates property search query parameters from a URL search string.
 * Invalid values gracefully fall back to clean defaults without crashing.
 */
export function parsePropertyQueryParams(searchStr: string): PropertyFilterUrlState {
  const params = new URLSearchParams(searchStr || '');

  // 1. Search Query
  const rawQ = (params.get('q') || params.get('search') || '').trim();

  // 2. City / Location
  const rawCity = (params.get('city') || params.get('location') || '').trim();
  const city = rawCity && rawCity.toLowerCase() !== 'all' ? rawCity : 'all';

  // 3. Property Type
  const rawType = (params.get('type') || '').trim().toLowerCase();
  const type: PropertyTypeFilter = (VALID_TYPES as string[]).includes(rawType)
    ? (rawType as PropertyTypeFilter)
    : 'all';

  // 4. Listing Status & Rental Period
  let rawStatus = (params.get('status') || '').trim().toLowerCase();
  if (rawStatus === 'buy') rawStatus = 'for-sale';
  if (rawStatus === 'rent') rawStatus = 'for-rent';
  const status: PropertyStatusFilter = (VALID_STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as PropertyStatusFilter)
    : 'all';

  const rawPeriod = (params.get('period') || params.get('rentalPeriod') || '').trim().toLowerCase();
  const rentalPeriod: RentalPeriod = rawPeriod === 'month' ? 'month' : 'year';

  // 5. Price limits (appropriate defaults based on transaction type)
  const isRental = status === 'for-rent';
  const defaultMax = isRental
    ? (rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX)
    : DEFAULT_PURCHASE_MAX;

  let minPrice = 0;
  const rawMin = params.get('minPrice') || params.get('min');
  if (rawMin !== null) {
    const parsedMin = parseInt(rawMin, 10);
    if (!Number.isNaN(parsedMin) && parsedMin >= 0) {
      minPrice = Math.min(parsedMin, defaultMax);
    }
  }

  let maxPrice = defaultMax;
  const rawMax = params.get('maxPrice') || params.get('max');
  if (rawMax !== null) {
    const parsedMax = parseInt(rawMax, 10);
    if (!Number.isNaN(parsedMax) && parsedMax > 0) {
      maxPrice = Math.min(parsedMax, defaultMax);
    }
  }

  // Safety check: ensure minPrice <= maxPrice
  if (minPrice > maxPrice) {
    minPrice = 0;
  }

  // 6. Bedrooms
  let rawBeds = (params.get('bedrooms') || params.get('beds') || params.get('bedroom') || '').trim().toLowerCase();
  if (rawBeds === '5') rawBeds = '5+';
  const bedroom: PropertyBedroomFilter = (VALID_BEDROOMS as string[]).includes(rawBeds)
    ? (rawBeds as PropertyBedroomFilter)
    : 'all';

  // 7. Sort
  const rawSort = (params.get('sort') || params.get('sortBy') || '').trim().toLowerCase();
  const sortBy: PropertySortOption = (VALID_SORTS as string[]).includes(rawSort)
    ? (rawSort as PropertySortOption)
    : 'featured';

  // 8. View Mode
  const rawView = (params.get('view') || params.get('viewMode') || '').trim().toLowerCase();
  const viewMode: PropertyViewMode = (VALID_VIEWS as string[]).includes(rawView)
    ? (rawView as PropertyViewMode)
    : 'grid';

  return {
    searchQuery: rawQ,
    city,
    type,
    status,
    rentalPeriod,
    minPrice,
    maxPrice,
    bedroom,
    sortBy,
    viewMode,
  };
}

/**
 * Serializes property search parameters into a clean URL query string,
 * omitting default values to ensure concise, bookmarkable, shareable links.
 */
export function serializePropertyQueryParams(state: Partial<PropertyFilterUrlState>): string {
  const params = new URLSearchParams();

  if (state.searchQuery && state.searchQuery.trim()) {
    params.set('q', state.searchQuery.trim());
  }

  if (state.city && state.city !== 'all') {
    params.set('city', state.city.trim());
  }

  if (state.type && state.type !== 'all') {
    params.set('type', state.type);
  }

  if (state.status && state.status !== 'all') {
    params.set('status', state.status);
  }

  if (state.status === 'for-rent' && state.rentalPeriod && state.rentalPeriod !== 'year') {
    params.set('period', state.rentalPeriod);
  }

  if (typeof state.minPrice === 'number' && state.minPrice > 0) {
    params.set('minPrice', state.minPrice.toString());
  }

  const isRental = state.status === 'for-rent';
  const maxCap = isRental
    ? (state.rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX)
    : DEFAULT_PURCHASE_MAX;

  if (typeof state.maxPrice === 'number' && state.maxPrice < maxCap) {
    params.set('maxPrice', state.maxPrice.toString());
  }

  if (state.bedroom && state.bedroom !== 'all') {
    params.set('bedrooms', state.bedroom);
  }

  if (state.sortBy && state.sortBy !== 'featured') {
    params.set('sort', state.sortBy);
  }

  if (state.viewMode && state.viewMode !== 'grid') {
    params.set('view', state.viewMode);
  }

  return params.toString();
}

/**
 * Synchronizes the browser address bar with the current property filter state.
 * Uses replaceState for continuous updates (e.g. slider drags, text typing)
 * to avoid cluttering browser history with intermediate steps.
 */
export function syncPropertyUrl(state: PropertyFilterUrlState, options?: { replace?: boolean }) {
  if (typeof window === 'undefined') return;

  const queryString = serializePropertyQueryParams(state);
  const targetPath = '/realestate/properties';
  const targetUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl === targetUrl) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState({ page: 'properties', filters: state }, '', targetUrl);
  } else {
    window.history.pushState({ page: 'properties', filters: state }, '', targetUrl);
  }
}
