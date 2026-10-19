import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MessageSquare,
  Building,
  RotateCcw,
  LayoutGrid,
  List,
  Compass,
  DollarSign,
  Check,
  X,
  Sparkles,
  Building2,
  Home,
  Layers,
  ArrowUpDown,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Language, PageId, Property, PropertyFilterParams, PropertyType } from '../types';
import { translations } from '../lib/translations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PropertyCard } from '../components/ui/PropertyCard';
import { PropertyMapView } from '../components/properties/PropertyMapView';
import { useData } from '../context/DataContext';
import { SAUDI_CITIES } from '../data/cities';
import { CitySearchDropdown } from '../components/ui/CitySearchDropdown';
import {
  parsePropertyQueryParams,
  syncPropertyUrl,
  DEFAULT_PROPERTY_FILTER_STATE,
  PropertySortOption,
  PropertyViewMode,
  PropertyStatusFilter,
  PropertyTypeFilter,
  PropertyBedroomFilter,
} from '../lib/propertyUrlParams';
import {
  RentalPeriod,
  DEFAULT_PURCHASE_MAX,
  DEFAULT_RENTAL_YEAR_MAX,
  DEFAULT_RENTAL_MONTH_MAX,
  getNormalizedPropertyPrice,
} from '../lib/priceNormalization';
import {
  PROPERTY_TAXONOMY,
  calculatePropertyTypeCounts,
  getPropertyTypeLabel,
} from '../lib/propertyTaxonomy';
import { getPropertyAreaSqM } from '../lib/utils';

interface PropertiesPageProps {
  onNavigate: (page: PageId, filters?: PropertyFilterParams) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal: (property: Property) => void;
  initialFilters?: PropertyFilterParams | null;
}

export function PropertiesPage({
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
  initialFilters,
}: PropertiesPageProps) {
  const t = translations[language];
  const { properties: liveProperties, isLoading } = useData();

  // Initialize filter state from URL query parameters (falling back to initialFilters or clean defaults)
  const initialParams = useMemo(() => {
    const fromUrl = typeof window !== 'undefined'
      ? parsePropertyQueryParams(window.location.search)
      : DEFAULT_PROPERTY_FILTER_STATE;

    return {
      searchQuery: initialFilters?.searchQuery ?? fromUrl.searchQuery,
      status: (initialFilters?.status as PropertyStatusFilter) ?? fromUrl.status,
      type: (initialFilters?.type as PropertyTypeFilter) ?? fromUrl.type,
      city: initialFilters?.city ?? fromUrl.city,
      bedroom: (initialFilters?.bedroom as PropertyBedroomFilter) ?? fromUrl.bedroom,
      rentalPeriod: (initialFilters?.rentalPeriod as RentalPeriod) ?? fromUrl.rentalPeriod ?? 'year',
      minPrice: initialFilters?.minPrice ?? fromUrl.minPrice,
      maxPrice: initialFilters?.maxPrice ?? fromUrl.maxPrice,
      sortBy: (initialFilters?.sortBy as PropertySortOption) ?? fromUrl.sortBy,
      viewMode: (initialFilters?.viewMode as PropertyViewMode) ?? fromUrl.viewMode,
    };
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.searchQuery);
  const [statusFilter, setStatusFilter] = useState<PropertyStatusFilter>(initialParams.status);
  const [typeFilter, setTypeFilter] = useState<PropertyTypeFilter>(initialParams.type);
  const [bedroomFilter, setBedroomFilter] = useState<PropertyBedroomFilter>(initialParams.bedroom);
  const [locationFilter, setLocationFilter] = useState<string>(initialParams.city);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>(initialParams.rentalPeriod);
  const [maxPrice, setMaxPrice] = useState<number>(initialParams.maxPrice);
  const [minPrice, setMinPrice] = useState<number>(initialParams.minPrice);
  const [minInputVal, setMinInputVal] = useState<string>(initialParams.minPrice ? String(initialParams.minPrice) : '');
  const [maxInputVal, setMaxInputVal] = useState<string>('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<PropertySortOption>(initialParams.sortBy);
  const [viewMode, setViewMode] = useState<PropertyViewMode>(initialParams.viewMode);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // References to distinguish history navigation, continuous slider/typing updates, and discrete filter clicks
  const isPopstateRef = React.useRef(false);
  const isInitialMountRef = React.useRef(true);
  const isDraggingSliderRef = React.useRef(false);
  const isTypingSearchRef = React.useRef(false);

  // Listen for browser Back/Forward (popstate) to restore previous searches
  useEffect(() => {
    const handlePopState = () => {
      isPopstateRef.current = true;
      const parsed = parsePropertyQueryParams(window.location.search);
      setSearchQuery(parsed.searchQuery);
      setStatusFilter(parsed.status);
      setTypeFilter(parsed.type);
      setLocationFilter(parsed.city);
      setBedroomFilter(parsed.bedroom);
      setRentalPeriod(parsed.rentalPeriod);
      setMinPrice(parsed.minPrice);
      setMaxPrice(parsed.maxPrice);
      setSortBy(parsed.sortBy);
      setViewMode(parsed.viewMode);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state when initialFilters changes (e.g. user navigates from Home search with new criteria)
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.searchQuery !== undefined) setSearchQuery(initialFilters.searchQuery);
      if (initialFilters.status !== undefined) setStatusFilter(initialFilters.status as PropertyStatusFilter);
      if (initialFilters.type !== undefined) setTypeFilter(initialFilters.type as PropertyTypeFilter);
      if (initialFilters.city !== undefined) setLocationFilter(initialFilters.city);
      if (initialFilters.rentalPeriod !== undefined) setRentalPeriod(initialFilters.rentalPeriod as RentalPeriod);
      if (initialFilters.minPrice !== undefined) setMinPrice(initialFilters.minPrice);
      if (initialFilters.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice);
      if (initialFilters.bedroom !== undefined) setBedroomFilter(initialFilters.bedroom as PropertyBedroomFilter);
      if (initialFilters.sortBy !== undefined) setSortBy(initialFilters.sortBy as PropertySortOption);
      if (initialFilters.viewMode !== undefined) setViewMode(initialFilters.viewMode as PropertyViewMode);
    }
  }, [initialFilters]);

  // Synchronize state with URL query parameters
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // On initial mount, ensure clean URL without pushing a duplicate history entry
      syncPropertyUrl(
        {
          searchQuery,
          city: locationFilter,
          type: typeFilter,
          status: statusFilter,
          rentalPeriod,
          minPrice,
          maxPrice,
          bedroom: bedroomFilter,
          sortBy,
          viewMode,
        },
        { replace: true }
      );
      return;
    }

    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      return;
    }

    // Continuous dragging/typing uses replaceState to prevent history flooding
    const replace = isDraggingSliderRef.current || isTypingSearchRef.current;
    syncPropertyUrl(
      {
        searchQuery,
        city: locationFilter,
        type: typeFilter,
        status: statusFilter,
        rentalPeriod,
        minPrice,
        maxPrice,
        bedroom: bedroomFilter,
        sortBy,
        viewMode,
      },
      { replace }
    );
  }, [searchQuery, locationFilter, typeFilter, statusFilter, rentalPeriod, minPrice, maxPrice, bedroomFilter, sortBy, viewMode]);

  // Extract unique locations dynamically from live database
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    liveProperties.forEach((p) => {
      const areaText = typeof p.location?.area === 'string'
        ? p.location.area
        : (p.location?.area?.[language] || p.location?.area?.en || p.location?.area?.ar || '');
      if (areaText) locations.add(areaText);
    });
    return Array.from(locations);
  }, [liveProperties, language]);

  // 1. Compute properties matching all active non-type filters (location, status, price, bedroom, search query)
  const nonTypeFilteredProperties = useMemo(() => {
    return liveProperties.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle =
          (item.title?.en || '').toLowerCase().includes(q) ||
          (item.title?.ar || '').toLowerCase().includes(q);
        const matchesArea =
          (item.location?.area?.en || '').toLowerCase().includes(q) ||
          (item.location?.area?.ar || '').toLowerCase().includes(q);
        const matchesCity =
          (item.location?.city?.en || '').toLowerCase().includes(q) ||
          (item.location?.city?.ar || '').toLowerCase().includes(q);
        const matchesDesc =
          (item.description?.en || '').toLowerCase().includes(q) ||
          (item.description?.ar || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesArea && !matchesCity && !matchesDesc) return false;
      }

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Location / City
      if (locationFilter !== 'all') {
        const locLower = locationFilter.toLowerCase();
        const cityObj = SAUDI_CITIES.find(
          (c) => c.ar.toLowerCase() === locLower || c.en.toLowerCase() === locLower
        );
        const searchAr = cityObj ? cityObj.ar.toLowerCase() : locLower;
        const searchEn = cityObj ? cityObj.en.toLowerCase() : locLower;

        const itemAreaEn = (item.location?.area?.en || (typeof item.location?.area === 'string' ? item.location.area : '')).toLowerCase();
        const itemAreaAr = (item.location?.area?.ar || (typeof item.location?.area === 'string' ? item.location.area : '')).toLowerCase();
        const itemCityEn = (item.location?.city?.en || (typeof item.location?.city === 'string' ? item.location.city : '')).toLowerCase();
        const itemCityAr = (item.location?.city?.ar || (typeof item.location?.city === 'string' ? item.location.city : '')).toLowerCase();
        
        const matches =
          itemCityAr === searchAr ||
          itemCityEn === searchEn ||
          itemCityAr === locLower ||
          itemCityEn === locLower ||
          itemAreaAr === searchAr ||
          itemAreaEn === searchEn ||
          itemAreaAr === locLower ||
          itemAreaEn === locLower ||
          itemCityAr.includes(searchAr) ||
          itemCityEn.includes(searchEn) ||
          itemCityAr.includes(locLower) ||
          itemCityEn.includes(locLower) ||
          searchAr.includes(itemCityAr) ||
          searchEn.includes(itemCityEn) ||
          locLower.includes(itemCityAr) ||
          locLower.includes(itemCityEn) ||
          itemAreaAr.includes(searchAr) ||
          itemAreaEn.includes(searchEn) ||
          itemAreaAr.includes(locLower) ||
          itemAreaEn.includes(locLower);

        if (!matches) return false;
      }

      // Bedrooms
      if (bedroomFilter !== 'all') {
        if (bedroomFilter === '5+' && item.bedrooms < 5) return false;
        if (bedroomFilter !== '5+' && item.bedrooms.toString() !== bedroomFilter) return false;
      }

      // Price Range comparison with normalization for rental
      if (statusFilter === 'for-rent') {
        const normPrice = getNormalizedPropertyPrice(item, rentalPeriod);
        if (normPrice < minPrice) return false;
        const currentMaxCap = rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX;
        if (maxPrice < currentMaxCap && normPrice > maxPrice) return false;
      } else {
        if (item.price.sar < minPrice) return false;
        if (maxPrice < DEFAULT_PURCHASE_MAX && item.price.sar > maxPrice) return false;
      }

      return true;
    });
  }, [liveProperties, searchQuery, statusFilter, locationFilter, bedroomFilter, rentalPeriod, minPrice, maxPrice]);

  // 2. Compute faceted counts for Property Types based on non-type filtered subset
  const typeCounts = useMemo(() => {
    return calculatePropertyTypeCounts(nonTypeFilteredProperties);
  }, [nonTypeFilteredProperties]);

  // 3. Compute final filtered & sorted property list
  const filteredProperties = useMemo(() => {
    return nonTypeFilteredProperties
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const priceA = statusFilter === 'for-rent' ? getNormalizedPropertyPrice(a, rentalPeriod) : a.price.sar;
          const priceB = statusFilter === 'for-rent' ? getNormalizedPropertyPrice(b, rentalPeriod) : b.price.sar;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = statusFilter === 'for-rent' ? getNormalizedPropertyPrice(a, rentalPeriod) : a.price.sar;
          const priceB = statusFilter === 'for-rent' ? getNormalizedPropertyPrice(b, rentalPeriod) : b.price.sar;
          return priceB - priceA;
        }
        if (sortBy === 'area-desc') return getPropertyAreaSqM(b) - getPropertyAreaSqM(a);
        if (sortBy === 'beds-desc') return b.bedrooms - a.bedrooms;
        // Default: featured first
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [nonTypeFilteredProperties, typeFilter, sortBy, statusFilter, rentalPeriod]);

  const currentMaxCap = statusFilter === 'for-rent'
    ? (rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX)
    : DEFAULT_PURCHASE_MAX;

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (bedroomFilter !== 'all') count++;
    if (maxPrice < currentMaxCap || minPrice > 0) count++;
    return count;
  }, [searchQuery, statusFilter, typeFilter, locationFilter, bedroomFilter, minPrice, maxPrice, currentMaxCap]);

  // Sync minInputVal & maxInputVal when numeric states minPrice / maxPrice update from non-input interactions
  useEffect(() => {
    const isMinFocused = typeof document !== 'undefined' && document.activeElement?.id === 'min-price-input';
    if (!isMinFocused) {
      setMinInputVal(minPrice > 0 ? String(minPrice) : '');
    }
  }, [minPrice]);

  useEffect(() => {
    const isMaxFocused = typeof document !== 'undefined' && document.activeElement?.id === 'max-price-input';
    if (!isMaxFocused) {
      setMaxInputVal(maxPrice < currentMaxCap ? String(maxPrice) : '');
    }
  }, [maxPrice, currentMaxCap]);

  // Accessible Min Price Input Handlers
  const handleMinInputChange = (val: string) => {
    setMinInputVal(val);
    isTypingSearchRef.current = true;

    if (val.trim() === '') {
      setMinPrice(0);
      setPriceError(null);
      return;
    }

    const num = Number(val);
    if (Number.isNaN(num) || num < 0) {
      setPriceError(
        language === 'en'
          ? 'Minimum price must be a non-negative number'
          : 'الحد الأدنى للسعر يجب أن يكون رقماً غير سالب'
      );
      setMinPrice(0);
    } else {
      setMinPrice(num);
      if (maxPrice > 0 && num > maxPrice) {
        setPriceError(
          language === 'en'
            ? 'Minimum price exceeds maximum price'
            : 'الحد الأدنى للسعر يتجاوز الحد الأقصى'
        );
      } else {
        setPriceError(null);
      }
    }
  };

  const handleMinInputBlur = () => {
    isTypingSearchRef.current = false;
    if (minInputVal.trim() === '') {
      setMinPrice(0);
      setPriceError(null);
    } else {
      const num = Number(minInputVal);
      if (Number.isNaN(num) || num < 0) {
        setMinPrice(0);
        setMinInputVal('');
        setPriceError(null);
      } else if (maxPrice > 0 && num > maxPrice) {
        // Enforce min <= max without silently discarding user's input: raise max to match min
        setMaxPrice(num);
        setMaxInputVal(String(num));
        setPriceError(null);
      } else {
        setPriceError(null);
      }
    }
    syncPropertyUrl(
      {
        searchQuery,
        city: locationFilter,
        type: typeFilter,
        status: statusFilter,
        rentalPeriod,
        minPrice,
        maxPrice,
        bedroom: bedroomFilter,
        sortBy,
        viewMode,
      },
      { replace: false }
    );
  };

  // Accessible Max Price Input Handlers
  const handleMaxInputChange = (val: string) => {
    setMaxInputVal(val);
    isTypingSearchRef.current = true;

    if (val.trim() === '') {
      setMaxPrice(currentMaxCap);
      setPriceError(null);
      return;
    }

    const num = Number(val);
    if (Number.isNaN(num) || num < 0) {
      setPriceError(
        language === 'en'
          ? 'Maximum price must be a non-negative number'
          : 'الحد الأقصى للسعر يجب أن يكون رقماً غير سالب'
      );
      setMaxPrice(currentMaxCap);
    } else {
      setMaxPrice(num);
      if (minPrice > 0 && num < minPrice) {
        setPriceError(
          language === 'en'
            ? 'Maximum price is less than minimum price'
            : 'الحد الأقصى للسعر أقل من الحد الأدنى'
        );
      } else {
        setPriceError(null);
      }
    }
  };

  const handleMaxInputBlur = () => {
    isTypingSearchRef.current = false;
    if (maxInputVal.trim() === '') {
      setMaxPrice(currentMaxCap);
      setPriceError(null);
    } else {
      const num = Number(maxInputVal);
      if (Number.isNaN(num) || num < 0) {
        setMaxPrice(currentMaxCap);
        setMaxInputVal('');
        setPriceError(null);
      } else if (minPrice > 0 && num < minPrice) {
        // Enforce min <= max without silently discarding user's input: lower min to match max
        setMinPrice(num);
        setMinInputVal(String(num));
        setPriceError(null);
      } else {
        setPriceError(null);
      }
    }
    syncPropertyUrl(
      {
        searchQuery,
        city: locationFilter,
        type: typeFilter,
        status: statusFilter,
        rentalPeriod,
        minPrice,
        maxPrice,
        bedroom: bedroomFilter,
        sortBy,
        viewMode,
      },
      { replace: false }
    );
  };

  // Helper to handle status filter changes & automatically reset incompatible price limits
  const handleStatusFilterChange = (newStatus: PropertyStatusFilter) => {
    isTypingSearchRef.current = false;
    isDraggingSliderRef.current = false;
    setStatusFilter(newStatus);
    setPriceError(null);

    if (newStatus === 'for-rent') {
      if (maxPrice > DEFAULT_RENTAL_YEAR_MAX || minPrice > DEFAULT_RENTAL_YEAR_MAX) {
        setMinPrice(0);
        setMaxPrice(rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX);
        setMinInputVal('');
        setMaxInputVal('');
      }
    } else {
      if (maxPrice <= DEFAULT_RENTAL_YEAR_MAX) {
        setMinPrice(0);
        setMaxPrice(DEFAULT_PURCHASE_MAX);
        setMinInputVal('');
        setMaxInputVal('');
      }
    }
  };

  // Helper to handle rental period changes (Annual <-> Monthly) with price normalization
  const handleRentalPeriodChange = (newPeriod: RentalPeriod) => {
    if (newPeriod === rentalPeriod) return;
    isDraggingSliderRef.current = false;
    isTypingSearchRef.current = false;
    setRentalPeriod(newPeriod);
    setPriceError(null);

    if (newPeriod === 'month') {
      if (maxPrice >= DEFAULT_RENTAL_YEAR_MAX) {
        setMinPrice(0);
        setMaxPrice(DEFAULT_RENTAL_MONTH_MAX);
        setMinInputVal('');
        setMaxInputVal('');
      } else {
        const newMin = Math.round(minPrice / 12);
        const newMax = Math.round(maxPrice / 12);
        setMinPrice(newMin);
        setMaxPrice(newMax);
        setMinInputVal(newMin > 0 ? String(newMin) : '');
        setMaxInputVal(String(newMax));
      }
    } else {
      if (maxPrice >= DEFAULT_RENTAL_MONTH_MAX) {
        setMinPrice(0);
        setMaxPrice(DEFAULT_RENTAL_YEAR_MAX);
        setMinInputVal('');
        setMaxInputVal('');
      } else {
        const newMin = Math.round(minPrice * 12);
        const newMax = Math.round(maxPrice * 12);
        setMinPrice(newMin);
        setMaxPrice(newMax);
        setMinInputVal(newMin > 0 ? String(newMin) : '');
        setMaxInputVal(String(newMax));
      }
    }
  };

  const handleResetFilters = () => {
    isDraggingSliderRef.current = false;
    isTypingSearchRef.current = false;
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setBedroomFilter('all');
    setRentalPeriod('year');
    setMinPrice(0);
    setMaxPrice(DEFAULT_PURCHASE_MAX);
    setMinInputVal('');
    setMaxInputVal('');
    setPriceError(null);
    setSortBy('featured');
    syncPropertyUrl(
      {
        ...DEFAULT_PROPERTY_FILTER_STATE,
        viewMode,
      },
      { replace: false }
    );
  };

  const propertyTypeTabs = useMemo(() => [
    { id: 'all', label: t.properties.filters.allTypes, icon: Layers },
    ...PROPERTY_TAXONOMY.map((item) => ({
      id: item.id,
      label: getPropertyTypeLabel(item.id, language, t),
      icon: item.icon,
    })),
  ], [language, t]);

  const pricePresets = [
    { label: language === 'en' ? 'Any Price' : 'أي سعر', max: 50000000 },
    { label: language === 'en' ? 'Under 5M SAR' : 'أقل من 5 مليون ر.س', max: 5000000 },
    { label: language === 'en' ? 'Under 10M SAR' : 'أقل من 10 مليون ر.س', max: 10000000 },
    { label: language === 'en' ? 'Under 25M SAR' : 'أقل من 25 مليون ر.س', max: 25000000 },
    { label: language === 'en' ? '25M+ SAR' : 'أكثر من 25 مليون ر.س', min: 25000000, max: 50000000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="primary">
            {language === 'en' ? 'Verified Brokerage Inventory' : 'محفظة العقارات المعتمدة'}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
            {t.properties.pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            {t.properties.pageSubtitle}
          </p>
        </div>

        {/* Live Filter Counter pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>
              {filteredProperties.length} {language === 'en' ? 'Units Available' : 'عقار متاح'}
            </span>
          </div>
        </div>
      </div>

      {/* Property Type Visual Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {propertyTypeTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = typeFilter === tab.id;
          const count = typeCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              onClick={() => {
                isDraggingSliderRef.current = false;
                isTypingSearchRef.current = false;
                setTypeFilter(tab.id as PropertyTypeFilter);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Search & Interactive Filter Control Panel */}
      <div className="relative z-30 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6 overflow-visible">
        {/* Primary Row: Search, Status, Location, and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 relative z-30 overflow-visible">
          {/* Keyword Search (4 cols) */}
          <div className="lg:col-span-4 relative">
            <label htmlFor="properties-search-query" className="sr-only">
              {t.properties.filters.search}
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
            <input
              id="properties-search-query"
              type="text"
              aria-label={t.properties.filters.search}
              placeholder={t.properties.filters.search}
              value={searchQuery}
              onChange={(e) => {
                isTypingSearchRef.current = true;
                setSearchQuery(e.target.value);
              }}
              onBlur={() => {
                isTypingSearchRef.current = false;
                syncPropertyUrl(
                  {
                    searchQuery,
                    city: locationFilter,
                    type: typeFilter,
                    status: statusFilter,
                    rentalPeriod,
                    minPrice,
                    maxPrice,
                    bedroom: bedroomFilter,
                    sortBy,
                    viewMode,
                  },
                  { replace: false }
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  isTypingSearchRef.current = false;
                  syncPropertyUrl(
                    {
                      searchQuery,
                      city: locationFilter,
                      type: typeFilter,
                      status: statusFilter,
                      rentalPeriod,
                      minPrice,
                      maxPrice,
                      bedroom: bedroomFilter,
                      sortBy,
                      viewMode,
                    },
                    { replace: false }
                  );
                }
              }}
              className="w-full ps-10 pe-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  isTypingSearchRef.current = false;
                  setSearchQuery('');
                }}
                className="absolute top-3 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location / City Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <CitySearchDropdown
              value={locationFilter}
              onChange={(city) => {
                isTypingSearchRef.current = false;
                setLocationFilter(city);
              }}
              language={language}
              placeholder={t.properties.filters.allCities}
              allOptionLabel={t.properties.filters.allCities}
              showAllOption={true}
              id="properties-city-search"
            />
          </div>

          {/* Status Tabs / Selector (2 cols) */}
          <div className="lg:col-span-2">
            <label htmlFor="properties-status-filter" className="sr-only">
              {t.properties.filters.allStatus}
            </label>
            <select
              id="properties-status-filter"
              aria-label={t.properties.filters.allStatus}
              value={statusFilter}
              onChange={(e) => {
                handleStatusFilterChange(e.target.value as PropertyStatusFilter);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-medium"
            >
              <option value="all">{t.properties.filters.allStatus}</option>
              <option value="for-sale">{t.properties.filters.forSale}</option>
              <option value="for-rent">{t.properties.filters.forRent}</option>
              <option value="off-plan">{t.properties.filters.offPlan}</option>
            </select>
          </div>

          {/* Sort By (3 cols) */}
          <div className="lg:col-span-3 relative">
            <label htmlFor="properties-sort-by" className="sr-only">
              {t.properties.filters.sortBy || (language === 'en' ? 'Sort By' : 'ترتيب حسب')}
            </label>
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
            <select
              id="properties-sort-by"
              aria-label={t.properties.filters.sortBy || (language === 'en' ? 'Sort By' : 'ترتيب حسب')}
              value={sortBy}
              onChange={(e) => {
                isTypingSearchRef.current = false;
                setSortBy(e.target.value as PropertySortOption);
              }}
              className="w-full ps-10 pe-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer font-medium"
            >
              <option value="featured">{t.properties.filters.featuredFirst}</option>
              <option value="price-asc">{t.properties.filters.priceLowToHigh}</option>
              <option value="price-desc">{t.properties.filters.priceHighToLow}</option>
              <option value="area-desc">{language === 'en' ? 'Area: Largest First' : 'المساحة: الأكبر أولاً'}</option>
              <option value="beds-desc">{language === 'en' ? 'Bedrooms: Most First' : 'غرف النوم: الأكثر أولاً'}</option>
            </select>
          </div>
        </div>

        {/* Interactive Price Range & Bedroom Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Price Range Slider Section (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Header with Active Budget Display */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                {t.properties.filters.priceRange}:
              </span>

              {/* Explicit Payment Period Selector for Rental */}
              {statusFilter === 'for-rent' && (
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleRentalPeriodChange('year')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      rentalPeriod === 'year'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.properties.filters.annualRent || (language === 'en' ? 'Annual Rent' : 'سنوياً')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRentalPeriodChange('month')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      rentalPeriod === 'month'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.properties.filters.monthlyRent || (language === 'en' ? 'Monthly Rent' : 'شهرياً')}
                  </button>
                </div>
              )}

              {/* Active Budget Display Badge */}
              <span className="font-bold text-blue-700 font-display-serif text-xs sm:text-sm px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-xl">
                {statusFilter === 'for-rent' ? (
                  rentalPeriod === 'month' ? (
                    maxPrice >= DEFAULT_RENTAL_MONTH_MAX && minPrice === 0 ? (
                      language === 'en' ? 'Any Monthly Budget' : 'جميع ميزانيات الإيجار الشهري'
                    ) : minPrice > 0 ? (
                      `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ${language === 'ar' ? 'ر.س / شهرياً' : 'SAR / mo'}`
                    ) : (
                      `${language === 'en' ? 'Up to' : 'حتى'} ${maxPrice.toLocaleString()} ${language === 'ar' ? 'ر.س / شهرياً' : 'SAR / mo'}`
                    )
                  ) : (
                    maxPrice >= DEFAULT_RENTAL_YEAR_MAX && minPrice === 0 ? (
                      language === 'en' ? 'Any Annual Budget' : 'جميع ميزانيات الإيجار السنوي'
                    ) : minPrice > 0 ? (
                      `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ${language === 'ar' ? 'ر.س / سنوياً' : 'SAR / yr'}`
                    ) : (
                      `${language === 'en' ? 'Up to' : 'حتى'} ${maxPrice.toLocaleString()} ${language === 'ar' ? 'ر.س / سنوياً' : 'SAR / yr'}`
                    )
                  )
                ) : (
                  maxPrice >= DEFAULT_PURCHASE_MAX && minPrice === 0 ? (
                    t.properties.filters.anyPrice
                  ) : minPrice > 0 ? (
                    `${(minPrice / 1000000).toFixed(1)}M - ${(maxPrice / 1000000).toFixed(1)}M ${language === 'ar' ? 'ر.س' : 'SAR'}`
                  ) : (
                    `${language === 'en' ? 'Up to' : 'حتى'} ${(maxPrice / 1000000).toFixed(1)}M ${language === 'ar' ? 'ر.س' : 'SAR'}`
                  )
                )}
              </span>
            </div>

            {/* Interactive Slider & Accessible Min/Max Price Inputs */}
            <div className="space-y-3 pt-1">
              {/* Accessible Min & Max Numeric Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="min-price-input" className="block text-[11px] font-semibold text-slate-600 mb-1 text-start">
                    {t.properties.filters.minPrice || (language === 'en' ? 'Min Price' : 'الحد الأدنى')}
                  </label>
                  <div className="relative">
                    <input
                      id="min-price-input"
                      type="number"
                      min={0}
                      max={currentMaxCap}
                      step={statusFilter === 'for-rent' ? (rentalPeriod === 'month' ? 1000 : 10000) : 100000}
                      placeholder={language === 'en' ? '0' : '٠'}
                      value={minInputVal}
                      onChange={(e) => handleMinInputChange(e.target.value)}
                      onBlur={handleMinInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleMinInputBlur();
                      }}
                      aria-label={language === 'en' ? 'Minimum property price' : 'الحد الأدنى لسعر العقار'}
                      className="w-full ps-3 pe-12 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-start"
                    />
                    <span className="absolute top-2 end-2.5 text-[11px] font-bold text-slate-400 pointer-events-none">
                      {language === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="max-price-input" className="block text-[11px] font-semibold text-slate-600 mb-1 text-start">
                    {t.properties.filters.maxPrice || (language === 'en' ? 'Max Price' : 'الحد الأقصى')}
                  </label>
                  <div className="relative">
                    <input
                      id="max-price-input"
                      type="number"
                      min={0}
                      max={currentMaxCap}
                      step={statusFilter === 'for-rent' ? (rentalPeriod === 'month' ? 1000 : 10000) : 100000}
                      placeholder={statusFilter === 'for-rent' ? (rentalPeriod === 'month' ? '50,000' : '500,000') : '50,000,000'}
                      value={maxInputVal}
                      onChange={(e) => handleMaxInputChange(e.target.value)}
                      onBlur={handleMaxInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleMaxInputBlur();
                      }}
                      aria-label={language === 'en' ? 'Maximum property price' : 'الحد الأقصى لسعر العقار'}
                      className="w-full ps-3 pe-12 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-start"
                    />
                    <span className="absolute top-2 end-2.5 text-[11px] font-bold text-slate-400 pointer-events-none">
                      {language === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Warning Alert */}
              {priceError && (
                <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{priceError}</span>
                </div>
              )}

              {/* Range Slider */}
              <input
                type="range"
                aria-label={t.properties.filters.priceSlider || (language === 'en' ? 'Price range filter' : 'تصفية نطاق السعر')}
                min={statusFilter === 'for-rent' ? 0 : 500000}
                max={
                  statusFilter === 'for-rent'
                    ? (rentalPeriod === 'month' ? DEFAULT_RENTAL_MONTH_MAX : DEFAULT_RENTAL_YEAR_MAX)
                    : DEFAULT_PURCHASE_MAX
                }
                step={
                  statusFilter === 'for-rent'
                    ? (rentalPeriod === 'month' ? 1000 : 10000)
                    : 500000
                }
                value={maxPrice}
                onPointerDown={() => {
                  isDraggingSliderRef.current = true;
                }}
                onPointerUp={() => {
                  setTimeout(() => {
                    isDraggingSliderRef.current = false;
                    syncPropertyUrl(
                      {
                        searchQuery,
                        city: locationFilter,
                        type: typeFilter,
                        status: statusFilter,
                        rentalPeriod,
                        minPrice,
                        maxPrice,
                        bedroom: bedroomFilter,
                        sortBy,
                        viewMode,
                      },
                      { replace: false }
                    );
                  }, 50);
                }}
                onKeyDown={() => {
                  isDraggingSliderRef.current = true;
                }}
                onKeyUp={() => {
                  setTimeout(() => {
                    isDraggingSliderRef.current = false;
                  }, 150);
                }}
                onChange={(e) => {
                  isDraggingSliderRef.current = true;
                  const newMax = Number(e.target.value);
                  setMaxPrice(newMax);
                  if (minPrice > newMax) {
                    setMinPrice(0);
                  }
                }}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                {statusFilter === 'for-rent' ? (
                  rentalPeriod === 'month' ? (
                    <>
                      <span>0 SAR</span>
                      <span>15k</span>
                      <span>30k</span>
                      <span>50k+ SAR / mo</span>
                    </>
                  ) : (
                    <>
                      <span>0 SAR</span>
                      <span>150k</span>
                      <span>300k</span>
                      <span>500k+ SAR / yr</span>
                    </>
                  )
                ) : (
                  <>
                    <span>500k</span>
                    <span>10M</span>
                    <span>25M</span>
                    <span>40M</span>
                    <span>50M+ SAR</span>
                  </>
                )}
              </div>
            </div>

            {/* Price Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(statusFilter === 'for-rent'
                ? rentalPeriod === 'month'
                  ? [
                      { label: language === 'en' ? 'Any Rent' : 'أية ميزانية', max: DEFAULT_RENTAL_MONTH_MAX },
                      { label: language === 'en' ? '< 10k SAR/mo' : 'أقل من 10,000 ر.س/شهرياً', max: 10000 },
                      { label: language === 'en' ? '< 20k SAR/mo' : 'أقل من 20,000 ر.س/شهرياً', max: 20000 },
                      { label: language === 'en' ? '< 35k SAR/mo' : 'أقل من 35,000 ر.س/شهرياً', max: 35000 },
                      { label: language === 'en' ? '35k+ SAR/mo' : 'أكثر من 35,000 ر.س/شهرياً', min: 35000, max: DEFAULT_RENTAL_MONTH_MAX },
                    ]
                  : [
                      { label: language === 'en' ? 'Any Rent' : 'أية ميزانية', max: DEFAULT_RENTAL_YEAR_MAX },
                      { label: language === 'en' ? '< 100k SAR/yr' : 'أقل من 100,000 ر.س/سنوياً', max: 100000 },
                      { label: language === 'en' ? '< 200k SAR/yr' : 'أقل من 200,000 ر.س/سنوياً', max: 200000 },
                      { label: language === 'en' ? '< 350k SAR/yr' : 'أقل من 350,000 ر.س/سنوياً', max: 350000 },
                      { label: language === 'en' ? '350k+ SAR/yr' : 'أكثر من 350,000 ر.س/سنوياً', min: 350000, max: DEFAULT_RENTAL_YEAR_MAX },
                    ]
                : [
                    { label: language === 'en' ? 'Any Price' : 'أي سعر', max: DEFAULT_PURCHASE_MAX },
                    { label: language === 'en' ? 'Under 5M SAR' : 'أقل من 5 مليون ر.س', max: 5000000 },
                    { label: language === 'en' ? 'Under 10M SAR' : 'أقل من 10 مليون ر.س', max: 10000000 },
                    { label: language === 'en' ? 'Under 25M SAR' : 'أقل من 25 مليون ر.س', max: 25000000 },
                    { label: language === 'en' ? '25M+ SAR' : 'أكثر من 25 مليون ر.س', min: 25000000, max: DEFAULT_PURCHASE_MAX },
                  ]
              ).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    isDraggingSliderRef.current = false;
                    isTypingSearchRef.current = false;
                    if (preset.min) {
                      setMinPrice(preset.min);
                      setMaxPrice(preset.max);
                    } else {
                      setMinPrice(0);
                      setMaxPrice(preset.max);
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    maxPrice === preset.max && (preset.min ? minPrice === preset.min : minPrice === 0)
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedroom Filter Chips (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {t.properties.filters.bedrooms}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {['all', '1', '2', '3', '4', '5+'].map((beds) => {
                const isSelected = bedroomFilter === beds;
                return (
                  <button
                    key={beds}
                    onClick={() => {
                      isDraggingSliderRef.current = false;
                      isTypingSearchRef.current = false;
                      setBedroomFilter(beds as PropertyBedroomFilter);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {beds === 'all' ? (language === 'en' ? 'All' : 'الكل') : beds}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Reset All Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium me-1">
                {t.properties.filters.activeFilters} ({activeFiltersCount}):
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium capitalize">
                  {t.properties.filters[typeFilter as keyof typeof t.properties.filters] || typeFilter}
                  <button onClick={() => setTypeFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {locationFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {locationFilter}
                  <button onClick={() => setLocationFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {statusFilter === 'for-sale'
                    ? t.properties.filters.forSale
                    : statusFilter === 'for-rent'
                    ? t.properties.filters.forRent
                    : t.properties.filters.offPlan}
                  <button onClick={() => handleStatusFilterChange('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {bedroomFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {bedroomFilter} {t.properties.beds}
                  <button onClick={() => setBedroomFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(maxPrice < currentMaxCap || minPrice > 0) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {statusFilter === 'for-rent' ? (
                    rentalPeriod === 'month' ? (
                      minPrice > 0
                        ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} SAR / mo`
                        : `≤ ${maxPrice.toLocaleString()} SAR / mo`
                    ) : (
                      minPrice > 0
                        ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} SAR / yr`
                        : `≤ ${maxPrice.toLocaleString()} SAR / yr`
                    )
                  ) : (
                    minPrice > 0 && maxPrice < DEFAULT_PURCHASE_MAX
                      ? `${(minPrice / 1000000).toFixed(1)}M - ${(maxPrice / 1000000).toFixed(1)}M SAR`
                      : minPrice > 0
                      ? `≥ ${(minPrice / 1000000).toFixed(1)}M SAR`
                      : `≤ ${(maxPrice / 1000000).toFixed(1)}M SAR`
                  )}
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(currentMaxCap);
                    }}
                    className="cursor-pointer hover:text-blue-900"
                    aria-label="Clear price filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.properties.filters.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Controls Bar: Results Count & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          {t.properties.filters.showing}{' '}
          <strong className="text-slate-900 font-bold text-base">{filteredProperties.length}</strong>{' '}
          {t.properties.filters.of} <strong className="text-slate-900">{liveProperties.length}</strong>{' '}
          {t.properties.filters.propertiesFound}
        </p>

        <div className="flex items-center gap-1 border border-slate-200 rounded-2xl p-1 bg-white shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Grid View (3 Columns)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'شبكة' : 'Grid'}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'قائمة' : 'List'}</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={language === 'ar' ? 'عرض الخريطة التفاعلية' : 'Interactive Map View'}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ar' ? 'الخريطة' : 'Map View'}</span>
          </button>
        </div>
      </div>

      {/* Properties Output View (Map / Grid / List) */}
      {viewMode === 'map' ? (
        <PropertyMapView
          properties={filteredProperties}
          language={language}
          onSelectProperty={onSelectProperty}
          onOpenBookViewingModal={onOpenBookViewingModal}
        />
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display-serif">
            {t.properties.noResultsTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.properties.noResultsDesc}
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4" />
              <span>{t.properties.filters.clearAll}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelectProperty={onSelectProperty}
              onOpenBookViewingModal={onOpenBookViewingModal}
              layout={viewMode}
              activeRentalPeriod={rentalPeriod}
            />
          ))}
        </div>
      )}
    </div>
  );
}
