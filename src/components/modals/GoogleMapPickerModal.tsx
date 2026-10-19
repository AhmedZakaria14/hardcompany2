import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Search, Check, Layers, Navigation, LocateFixed, Compass, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { Language } from '../../types';

// Custom SVG Pin Icon for Leaflet
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(37,99,235,0.4); margin-bottom: 2px; border: 1.5px solid white;">
          موقع العقار
        </div>
        <svg width="34" height="42" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 10.5 28.5 11.385 29.25C11.745 29.55 12.255 29.55 12.615 29.25C13.5 28.5 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#dc2626"/>
          <circle cx="12" cy="11" r="5" fill="white"/>
        </svg>
        <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1.5px); margin-top: -3px;"></div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });
};

interface GoogleMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (coordsString: string, details?: { lat: number; lng: number; label: string; address?: string }) => void;
  language: Language;
  initialCoords?: string;
}

interface QuickCity {
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  zoom: number;
}

const SAUDI_CITIES: QuickCity[] = [
  { nameAr: 'الخُبر', nameEn: 'Al Khobar', lat: 26.2884, lng: 50.2105, zoom: 14 },
  { nameAr: 'الدمام', nameEn: 'Dammam', lat: 26.4344, lng: 50.1033, zoom: 13 },
  { nameAr: 'الظهران', nameEn: 'Dhahran', lat: 26.2714, lng: 50.1504, zoom: 13 },
  { nameAr: 'الرياض', nameEn: 'Riyadh', lat: 24.7136, lng: 46.6753, zoom: 12 },
  { nameAr: 'جدة', nameEn: 'Jeddah', lat: 21.5433, lng: 39.1728, zoom: 12 },
  { nameAr: 'الجبيل', nameEn: 'Jubail', lat: 27.0046, lng: 49.6595, zoom: 13 },
  { nameAr: 'الأحساء', nameEn: 'Al Ahsa', lat: 25.3835, lng: 49.5863, zoom: 13 },
];

export const GoogleMapPickerModal: React.FC<GoogleMapPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  language,
  initialCoords = '',
}) => {
  const isAr = language === 'ar';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Parse initial coordinates if provided
  const parseInitial = () => {
    if (initialCoords) {
      const match = initialCoords.match(/([0-9]+\.[0-9]+)[,\s]+([0-9]+\.[0-9]+)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
      }
    }
    // Default to Al Khobar
    return { lat: 26.288412, lng: 50.210543 };
  };

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(parseInitial());
  const [addressText, setAddressText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'hybrid'>('streets');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Fetch human-readable address from Nominatim reverse geocode
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${isAr ? 'ar' : 'en'}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          // Format a clean, brief address
          const addr = data.address || {};
          const district = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
          const city = addr.city || addr.town || addr.municipality || addr.county || '';
          const state = addr.state || '';
          
          const cleanParts = [district, city, state].filter(Boolean);
          if (cleanParts.length > 0) {
            setAddressText(cleanParts.join('، '));
          } else {
            setAddressText(data.display_name.split(',').slice(0, 3).join(', '));
          }
        }
      }
    } catch {
      // Fallback to coordinates
      setAddressText('');
    }
  };

  // Initialize Map when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const initial = parseInitial();
      setCoords(initial);

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      // Create Leaflet Map Instance
      const map = L.map(mapContainerRef.current, {
        center: [initial.lat, initial.lng],
        zoom: 15,
        zoomControl: false,
      });

      // Add Zoom Control at Bottom Right
      L.control.zoom({ position: isAr ? 'bottomleft' : 'bottomright' }).addTo(map);

      // Tile layer
      const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      tileLayerRef.current = tile;

      // Custom Marker
      const marker = L.marker([initial.lat, initial.lng], {
        icon: createCustomPinIcon(),
        draggable: true,
      }).addTo(map);

      // Drag handler
      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        setCoords({ lat: latlng.lat, lng: latlng.lng });
        reverseGeocode(latlng.lat, latlng.lng);
      });

      // Click on map to place/move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      reverseGeocode(initial.lat, initial.lng);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Clean up map when modal fully unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Change Layer Type
  const switchLayer = (type: 'streets' | 'satellite') => {
    setMapLayer(type);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (type === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
      ).addTo(mapInstanceRef.current);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }
  };

  // Jump to quick city
  const jumpToCity = (city: QuickCity) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.flyTo([city.lat, city.lng], city.zoom, { duration: 1 });
    markerRef.current.setLatLng([city.lat, city.lng]);
    setCoords({ lat: city.lat, lng: city.lng });
    reverseGeocode(city.lat, city.lng);
  };

  // Search Address or District
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const q = encodeURIComponent(searchQuery + ', Saudi Arabia');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=5&accept-language=${isAr ? 'ar' : 'en'}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
            markerRef.current.setLatLng([lat, lng]);
            setCoords({ lat, lng });
            setAddressText(first.display_name.split(',').slice(0, 3).join(', '));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Locate Current GPS position
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1 });
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
        setLocatingUser(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    const formatted = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    onSelectLocation(formatted, {
      lat: coords.lat,
      lng: coords.lng,
      label: addressText || (isAr ? 'موقع محدد على الخريطة' : 'Pinned Location'),
      address: addressText,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Full-Scale Professional Modal */}
      <div
        role="dialog"
        aria-modal="true"
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-5xl h-[88vh] sm:h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تحديد موقع العقار على الخريطة التفاعلية' : 'Interactive Property Location Map'}</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {isAr
                  ? 'انقر على أي موقع لتثبيت الدبوس أو اسحب الدبوس لتحديث الإحداثيات'
                  : 'Click anywhere to pin, or drag the marker to update coordinates'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Map"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick City Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={
                isAr
                  ? 'ابحث عن اسم الحي، الشارع أو المدينة (مثل: الكورنيش، العليا، الحزام الذهبي...)'
                  : 'Search district, street, or city (e.g. Corniche, Olaya, Golden Belt...)'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-9 pe-20 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {searching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>{isAr ? 'بحث' : 'Search'}</span>
              )}
            </button>
          </form>

          {/* Quick Cities Navigator */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 me-1">
              {isAr ? 'انتقال سريع:' : 'Quick Cities:'}
            </span>
            {SAUDI_CITIES.map((city) => (
              <button
                key={city.nameEn}
                type="button"
                onClick={() => jumpToCity(city)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {isAr ? city.nameAr : city.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas Workspace */}
        <div className="relative flex-1 w-full bg-slate-100 overflow-hidden">
          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

          {/* Floating Map Controls Widget */}
          <div className="absolute top-4 end-4 z-500 flex flex-col gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200">
            {/* Map Layer Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => switchLayer('streets')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'streets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'خريطة' : 'Map'}</span>
              </button>
              <button
                type="button"
                onClick={() => switchLayer('satellite')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'قمر صناعي' : 'Satellite'}</span>
              </button>
            </div>

            {/* Locate My Current GPS Button */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locatingUser}
              title={isAr ? 'تحديد موقعي الحالي' : 'Use Current Location'}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {locatingUser ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{isAr ? 'موقعي الحالي' : 'My GPS'}</span>
            </button>
          </div>

          {/* Real-time Instructions Overlay Badge */}
          <div className="absolute top-4 start-4 z-500 px-3.5 py-2 bg-slate-900/90 text-white backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs font-medium max-w-[85%] sm:max-w-md pointer-events-none">
            <Compass className="w-4 h-4 text-blue-400 shrink-0 animate-spin duration-5000" />
            <span>
              {isAr
                ? 'انقر على أي نقطة على الخريطة لتثبيت موقع العقار بدقة.'
                : 'Click directly on the map to place the property pin.'}
            </span>
          </div>
        </div>

        {/* Selected Coordinates Readout & Action Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          {/* Coordinates & Detected Address readout */}
          <div className="w-full sm:flex-1 text-start">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'الموقع والإحداثيات المختارة:' : 'Selected Coordinates & Area:'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl font-mono text-xs sm:text-sm font-bold text-blue-700 shadow-2xs">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </div>
              {addressText ? (
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[280px] sm:max-w-md">
                  📍 {addressText}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  {isAr ? '(جارٍ استخراج اسم الحي تلقائياً...)' : '(Extracting district...)'}
                </span>
              )}
            </div>
          </div>

          {/* Confirm & Cancel Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer w-1/2 sm:w-auto"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center justify-center gap-2 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer w-1/2 sm:w-auto"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'تأكيد الموقع' : 'Confirm Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
