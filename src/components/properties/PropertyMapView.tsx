import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Compass,
  ZoomIn,
  ZoomOut,
  Navigation,
  Eye,
  Calendar,
  Building,
  Info,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import L from 'leaflet';
import { Property, Language } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getPageHref, handleSemanticClick } from '../../lib/navigation';
import { useGoogleMaps } from '../../lib/integrations/useGoogleMaps';
import { formatCurrency, getLocalizedText } from '../../lib/utils';
import { getPropertyTypeLabel } from '../../lib/propertyTaxonomy';

interface PropertyMapViewProps {
  properties: Property[];
  language: Language;
  onSelectProperty: (property: Property) => void;
  onOpenBookViewingModal: (property: Property) => void;
}

function hasValidCoordinates(property: Property): boolean {
  if (!property || !property.location || !property.location.coordinates) return false;
  const { lat, lng } = property.location.coordinates;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function PropertyMapView({
  properties,
  language,
  onSelectProperty,
  onOpenBookViewingModal,
}: PropertyMapViewProps) {
  const isAr = language === 'ar';
  const { isLoaded: googleMapsLoaded, hasApiKey: hasGoogleMapsApiKey } = useGoogleMaps();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const googleMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<{ [id: string]: L.Marker }>({});
  const googleMarkersRef = useRef<{ [id: string]: any }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'luxury-dark' | 'blueprint' | 'satellite'>('luxury-dark');
  const [activeAreaFilter, setActiveAreaFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(properties[0] || null);
  const [currentCenterText, setCurrentCenterText] = useState<string>('26.2886° N, 50.2185° E');
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [mapError, setMapError] = useState<boolean>(false);

  // Categorize properties into mapped (has valid coords) vs unmapped
  const mappedProperties = properties.filter((p) => {
    if (!hasValidCoordinates(p)) return false;
    if (activeAreaFilter === 'all') return true;

    const cityEn = (p.location?.city?.en || (typeof p.location?.city === 'string' ? p.location.city : '')).toLowerCase();
    const areaEn = (p.location?.area?.en || (typeof p.location?.area === 'string' ? p.location.area : '')).toLowerCase();
    const cityAr = p.location?.city?.ar || (typeof p.location?.city === 'string' ? p.location.city : '');
    const areaAr = p.location?.area?.ar || (typeof p.location?.area === 'string' ? p.location.area : '');
    const filterLower = activeAreaFilter.toLowerCase();

    return (
      cityEn.includes(filterLower) ||
      areaEn.includes(filterLower) ||
      cityAr.includes(activeAreaFilter) ||
      areaAr.includes(activeAreaFilter)
    );
  });

  const unmappedProperties = properties.filter((p) => {
    if (hasValidCoordinates(p)) return false;
    if (activeAreaFilter === 'all') return true;

    const cityEn = (p.location?.city?.en || (typeof p.location?.city === 'string' ? p.location.city : '')).toLowerCase();
    const areaEn = (p.location?.area?.en || (typeof p.location?.area === 'string' ? p.location.area : '')).toLowerCase();
    const cityAr = p.location?.city?.ar || (typeof p.location?.city === 'string' ? p.location.city : '');
    const areaAr = p.location?.area?.ar || (typeof p.location?.area === 'string' ? p.location.area : '');
    const filterLower = activeAreaFilter.toLowerCase();

    return (
      cityEn.includes(filterLower) ||
      areaEn.includes(filterLower) ||
      cityAr.includes(activeAreaFilter) ||
      areaAr.includes(activeAreaFilter)
    );
  });

  const areaPresets = [
    {
      id: 'all',
      label: isAr ? 'جميع مناطق الشرقية' : 'All Eastern Province',
      filterKey: 'all',
    },
    {
      id: 'khobar',
      label: isAr ? 'الخُبر (الكورنيش والشبيلي)' : 'Al Khobar Waterfront',
      filterKey: 'Khobar',
    },
    {
      id: 'dammam',
      label: isAr ? 'الدمام (حي الشاطئ)' : 'Dammam Al Shati',
      filterKey: 'Dammam',
    },
    {
      id: 'dhahran',
      label: isAr ? 'الظهران (تلال الظهران)' : 'Dhahran Hills',
      filterKey: 'Dhahran',
    },
  ];

  const tileUrls = {
    'luxury-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    blueprint: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const createCustomMarkerHtml = (priceText: string, isSelected: boolean) => {
    return `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background-color: ${isSelected ? '#0284c7' : '#0f172a'};
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          border: 1.5px solid ${isSelected ? '#38bdf8' : '#334155'};
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="color: ${isSelected ? '#e0f2fe' : '#38bdf8'}; font-weight: 900;">📍</span>
          <span>${priceText}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${isSelected ? '#0284c7' : '#0f172a'};
          margin-top: -1px;
        "></div>
      </div>
    `;
  };

  // Handle map re-initialization / retry
  const handleRetryMap = () => {
    setMapError(false);
    setMapLoading(true);
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
  };

  // Initialize Map Engine (Google Maps if API key is configured, otherwise Leaflet)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    setMapError(false);
    setMapLoading(true);

    try {
      // 1. If Google Maps API is configured & loaded
      if (hasGoogleMapsApiKey && googleMapsLoaded && window.google?.maps) {
        if (!googleMapRef.current) {
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: 26.2886, lng: 50.2185 },
            zoom: 12,
            disableDefaultUI: true,
            mapTypeId:
              mapStyle === 'satellite'
                ? window.google.maps.MapTypeId.SATELLITE
                : window.google.maps.MapTypeId.ROADMAP,
          });

          googleMapRef.current = map;

          map.addListener('center_changed', () => {
            const c = map.getCenter();
            if (c) {
              setCurrentCenterText(`${c.lat().toFixed(4)}° N, ${c.lng().toFixed(4)}° E`);
            }
          });
        } else {
          googleMapRef.current.setMapTypeId(
            mapStyle === 'satellite'
              ? window.google.maps.MapTypeId.SATELLITE
              : window.google.maps.MapTypeId.ROADMAP
          );
        }

        // Render Google Maps Markers
        Object.values(googleMarkersRef.current).forEach((m: any) => m.setMap(null));
        googleMarkersRef.current = {};

        if (mappedProperties.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          mappedProperties.forEach((prop) => {
            const coords = prop.location.coordinates!;
            const marker = new window.google.maps.Marker({
              position: { lat: coords.lat, lng: coords.lng },
              map: googleMapRef.current,
              title: getLocalizedText(prop.title, language),
            });

            marker.addListener('click', () => {
              setSelectedProperty(prop);
              googleMapRef.current.panTo({ lat: coords.lat, lng: coords.lng });
            });

            googleMarkersRef.current[prop.id] = marker;
            bounds.extend({ lat: coords.lat, lng: coords.lng });
          });

          googleMapRef.current.fitBounds(bounds);
        }

        setMapLoading(false);
        return;
      }

      // 2. Leaflet Fallback Engine (Default when no external provider key)
      if (!leafletMapRef.current) {
        const defaultLat = 26.2886;
        const defaultLng = 50.2185;

        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        const tile = L.tileLayer(tileUrls[mapStyle], {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        tile.on('load', () => setMapLoading(false));
        tile.on('tileerror', () => {
          // Keep map visible, stop spinner
          setMapLoading(false);
        });

        tileLayerRef.current = tile;

        map.on('move', () => {
          const c = map.getCenter();
          setCurrentCenterText(`${c.lat.toFixed(4)}° N, ${c.lng.toFixed(4)}° E`);
        });

        leafletMapRef.current = map;
      } else {
        if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(tileUrls[mapStyle]);
        }
      }

      const map = leafletMapRef.current;
      if (!map) return;

      // Clear old Leaflet markers
      Object.values(leafletMarkersRef.current).forEach((m: any) => m?.remove?.());
      leafletMarkersRef.current = {};

      if (mappedProperties.length > 0) {
        const bounds = L.latLngBounds([]);

        mappedProperties.forEach((prop) => {
          const coords = prop.location.coordinates!;
          const isSelected = selectedProperty?.id === prop.id;

          const customIcon = L.divIcon({
            className: 'custom-property-pin',
            html: createCustomMarkerHtml(
              formatCurrency(prop.price.sar, 'SAR', language),
              isSelected
            ),
            iconSize: [120, 36],
            iconAnchor: [60, 36],
          });

          const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            setSelectedProperty(prop);
            map.panTo([coords.lat, coords.lng], { animate: true, duration: 0.5 });
          });

          leafletMarkersRef.current[prop.id] = marker;
          bounds.extend([coords.lat, coords.lng]);
        });

        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }

      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
        setMapLoading(false);
      }, 200);
    } catch (err) {
      console.error('Map initialization error:', err);
      setMapError(true);
      setMapLoading(false);
    }
  }, [
    mapStyle,
    activeAreaFilter,
    properties.length,
    googleMapsLoaded,
    hasGoogleMapsApiKey,
  ]);

  // Update pin selection focus when selectedProperty changes
  useEffect(() => {
    if (!selectedProperty) return;
    const coords = selectedProperty.location?.coordinates;
    if (coords && hasValidCoordinates(selectedProperty)) {
      if (googleMapRef.current) {
        googleMapRef.current.panTo({ lat: coords.lat, lng: coords.lng });
      } else if (leafletMapRef.current) {
        leafletMapRef.current.panTo([coords.lat, coords.lng], { animate: true });
      }
    }
  }, [selectedProperty?.id]);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white font-ui-sans">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="bg-blue-600/90 text-white border-blue-400/40">
              <Compass className="w-3.5 h-3.5 mr-1" />
              {isAr ? 'خريطة العقارات التفاعلية' : 'Interactive Property Map'}
            </Badge>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isAr ? 'مواقع معتمدة' : 'Verified Locations'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display-serif text-slate-100">
            {isAr
              ? 'تصفح خريطة عقارات الخُبر والدمام والظهران'
              : 'Explore Properties Across Al Khobar, Dammam & Dhahran'}
          </h3>
        </div>

        {/* Map Style Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMapStyle('luxury-dark')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mapStyle === 'luxury-dark'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'داكن فاخر' : 'Luxury Dark'}
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('blueprint')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mapStyle === 'blueprint'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'خريطة الشوارع' : 'Street Map'}
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mapStyle === 'satellite'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الأقمار الصناعية' : 'Satellite'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. District Quick Filter Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-400 font-semibold shrink-0">
          {isAr ? 'تصفية المنطقة الشرقية:' : 'Eastern Province Filter:'}
        </span>
        {areaPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setActiveAreaFilter(preset.filterKey)}
            className={`px-3.5 py-1 rounded-full whitespace-nowrap border transition-all cursor-pointer ${
              activeAreaFilter === preset.filterKey
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 3. Interactive Map Canvas Area */}
      <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-slate-950 flex flex-col justify-between">
        {/* Map Canvas Div */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Loading Overlay */}
        {mapLoading && !mapError && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-200">
              {isAr ? 'جارٍ تحميل الخريطة التفاعلية...' : 'Loading Interactive Map...'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isAr ? 'تهيئة عقارات الخُبر والدمام والظهران' : 'Initializing Eastern Province Listings'}
            </p>
          </div>
        )}

        {/* Error Fallback State */}
        {mapError && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">
              {isAr ? 'تعذر تحميل الخريطة التفاعلية' : 'Map View Temporarily Unavailable'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
              {isAr
                ? 'حدث تعذر مؤقت في الاتصال بخادم الخرائط. يمكنك استعراض العقارات مباشرة أو محاولة إعادة التحميل.'
                : 'Unable to initialize map tiles. You can browse property details or attempt to re-load.'}
            </p>
            <Button variant="primary" size="sm" onClick={handleRetryMap} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry Map'}</span>
            </Button>
          </div>
        )}

        {/* No Results Filter State */}
        {!mapLoading && !mapError && mappedProperties.length === 0 && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-sm font-bold text-slate-300">
              {isAr ? 'لا توجد عقارات مثبتة في هذه المنطقة حالياً' : 'No mapped properties in this selected filter'}
            </p>
            <button
              type="button"
              onClick={() => setActiveAreaFilter('all')}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              {isAr ? 'عرض جميع العقارات' : 'Show All Properties'}
            </button>
          </div>
        )}

        {/* Floating Map Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-1 flex flex-col gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => leafletMapRef.current?.zoomIn()}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => leafletMapRef.current?.zoomOut()}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coordinate Readout Bar (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-xl">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {isAr ? 'الإحداثيات الحالية:' : 'Center Coordinates:'}{' '}
            <strong className="text-white font-mono">{currentCenterText}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-semibold">
            {mappedProperties.length} {isAr ? 'عقارات مثبتة إحداثياً' : 'Properties Mapped'}
          </span>
        </div>

        {/* 4. Selected Property Floating Card */}
        {selectedProperty && (
          <div className="relative z-20 m-4 p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl max-w-xl self-center sm:self-end flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <img
              src={selectedProperty.images[0]}
              alt={getLocalizedText(selectedProperty.title, language)}
              className="w-full sm:w-28 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
            />

            <div className="space-y-1.5 flex-1 min-w-0 text-start">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="primary" className="text-[10px] py-0.5">
                  {getPropertyTypeLabel(selectedProperty.type, language)}
                </Badge>
                <span className="text-xs text-blue-400 font-extrabold font-display-serif">
                  {formatCurrency(selectedProperty.price.sar, 'SAR', language)}
                  {selectedProperty.price.period && (
                    <span className="text-[10px] font-normal text-blue-300">
                      {' '}
                      {selectedProperty.price.period === 'year' ? (isAr ? '/ سنوياً' : '/ yr') : (isAr ? '/ شهرياً' : '/ mo')}
                    </span>
                  )}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white truncate">
                {getLocalizedText(selectedProperty.title, language)}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  {getLocalizedText(selectedProperty.location?.area, language)},{' '}
                  {getLocalizedText(selectedProperty.location?.city, language)}
                </span>
              </p>

              {/* Coordinates status badge */}
              {hasValidCoordinates(selectedProperty) ? (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>
                    {selectedProperty.location.coordinates?.lat.toFixed(4)}°N,{' '}
                    {selectedProperty.location.coordinates?.lng.toFixed(4)}°E (
                    {isAr ? 'موقع دقيق موثق' : 'Verified Exact Coordinates'})
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {isAr
                      ? 'إحداثيات الخريطة التفصيلية قيد التحقق - تواصل للحصول على العنوان الخاص'
                      : 'Exact coordinates pending verification - Contact agent for address'}
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              <a
                href={getPageHref(
                  'property-details',
                  `id=${encodeURIComponent(selectedProperty.id)}`
                )}
                onClick={(e) => handleSemanticClick(e, () => onSelectProperty(selectedProperty))}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white w-full justify-center text-xs font-bold transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض التفاصيل' : 'View Details'}</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenBookViewingModal(selectedProperty)}
                className="w-full justify-center text-xs text-slate-300 border-slate-700 hover:text-white"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isAr ? 'حجز معاينة' : 'Book Tour'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Unmapped Listings Section */}
      {unmappedProperties.length > 0 && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isAr
                ? `عقارات بحاجة لاستكمال الإحداثيات الدقيقة (${unmappedProperties.length})`
                : `Listings Pending Verified Coordinates (${unmappedProperties.length})`}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {isAr
              ? 'حرصاً على الشفافية والدقة، لا نقوم بإدراج دبابيس افتراضية أو وهمية على الخريطة للعقارات التي لم تُستكمل إحداثياتها الجغرافية بعد. يمكنك استعراضها وحجز معاينتها مباشرة.'
              : 'To ensure transparency and location integrity, we do not invent fake coordinates or place properties at arbitrary map points. These listings can be viewed and scheduled directly.'}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {unmappedProperties.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProperty(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Building className="w-3 h-3 text-amber-500" />
                <span>{getLocalizedText(p.title, language)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info Hook */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {isAr
              ? 'خريطة تفاعلية تعرض المواقع المعتمدة للعقارات في الخُبر والدمام والظهران.'
              : 'Interactive map displaying verified property locations in Al Khobar, Dammam, and Dhahran.'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
            {isAr ? 'الخُبر • الدمام • الظهران' : 'Al Khobar • Dammam • Dhahran'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
