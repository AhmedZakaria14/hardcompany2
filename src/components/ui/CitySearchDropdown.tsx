import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { SAUDI_CITIES, SaudiCity } from '../../data/cities';
import { Language } from '../../types';

interface CitySearchDropdownProps {
  value: string;
  onChange: (cityName: string) => void;
  language: Language;
  placeholder?: string;
  label?: string;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  id?: string;
  variant?: 'hero' | 'filter' | 'form';
}

export const CitySearchDropdown: React.FC<CitySearchDropdownProps> = ({
  value,
  onChange,
  language,
  placeholder,
  label,
  className = '',
  showAllOption = true,
  allOptionLabel,
  id = 'city-search-dropdown',
  variant = 'hero',
}) => {
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = isAr ? 'ابحث باسم المدينة' : 'Search by city name';
  const displayPlaceholder = placeholder || defaultPlaceholder;
  const defaultAllLabel = isAr ? 'جميع المدن' : 'All Cities';
  const displayAllLabel = allOptionLabel || defaultAllLabel;

  // Filter cities matching search query
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return SAUDI_CITIES;

    const q = searchTerm.trim().toLowerCase();
    return SAUDI_CITIES.filter((c) => {
      const ar = c.ar.toLowerCase();
      const en = c.en.toLowerCase();
      return ar.includes(q) || en.includes(q);
    });
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(showAllOption ? 'all' : '');
  };

  // Find currently selected city object for language label
  const selectedCityObj = useMemo(() => {
    if (!value || value === 'all') return null;
    return SAUDI_CITIES.find(
      (c) =>
        c.ar.toLowerCase() === value.toLowerCase() ||
        c.en.toLowerCase() === value.toLowerCase()
    );
  }, [value]);

  const displayValue = useMemo(() => {
    if (!value || value === 'all') return '';
    if (selectedCityObj) {
      return isAr ? selectedCityObj.ar : selectedCityObj.en;
    }
    return value;
  }, [value, selectedCityObj, isAr]);

  return (
    <div ref={containerRef} className={`relative text-start ${className}`} id={id}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Main Trigger / Field matching background of main search fields */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full ps-3.5 pe-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between text-start cursor-pointer hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white ${
          isOpen ? 'ring-2 ring-blue-500 bg-white border-blue-500 shadow-xs' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate block ${!displayValue ? 'text-slate-400 font-normal' : 'text-slate-900 font-semibold'}`}>
          {displayValue || displayPlaceholder}
        </span>

        <div className="absolute top-3 end-3 flex items-center gap-1">
          {displayValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
              title={isAr ? 'مسح الاختيار' : 'Clear'}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Embedded Dropdown Menu - highly visible outside white box with high z-index and prominent shadow */}
      {isOpen && (
        <div
          className="absolute z-[999] top-full mt-2 start-0 w-full min-w-[240px] sm:min-w-[320px] max-w-[calc(100vw-2rem)] sm:max-w-[420px] bg-slate-50 border border-slate-300 rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
        >
          {/* First Row: Search Field matching "Search by city name" */}
          <div className="p-2.5 bg-slate-100 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute top-2.5 start-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'ابحث باسم المدينة' : 'Search by city name'}
                className="w-full ps-9 pe-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-start"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute top-2.5 end-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Possible Values (The 50 Saudi Cities) */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60 bg-slate-50">
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSelect('all')}
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer text-start ${
                  !value || value === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/70 hover:text-blue-600'
                }`}
              >
                <span>{displayAllLabel}</span>
                {(!value || value === 'all') && <Check className="w-4 h-4 text-white" />}
              </button>
            )}

            {filteredCities.length > 0 ? (
              filteredCities.map((c) => {
                const isSelected =
                  value === c.ar ||
                  value === c.en ||
                  (selectedCityObj && selectedCityObj.en === c.en);

                const cityName = isAr ? c.ar : c.en;

                return (
                  <button
                    key={c.en}
                    type="button"
                    onClick={() => handleSelect(cityName)}
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-between cursor-pointer text-start ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100'
                    }`}
                  >
                    <span className="font-semibold truncate">{cityName}</span>

                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ms-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-slate-500">
                  {isAr
                    ? `لا توجد مدن تطابق البحث "${searchTerm}"`
                    : `No cities matching "${searchTerm}"`}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isAr ? 'عرض جميع المدن الـ 50' : 'View all 50 cities'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


