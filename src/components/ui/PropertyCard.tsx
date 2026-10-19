import React, { useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Eye,
  Share2,
  Check,
} from 'lucide-react';
import { Language, Property } from '../../types';
import { translations } from '../../lib/translations';
import { Button } from './Button';
import { Badge } from './Badge';
import { getPageHref, handleSemanticClick } from '../../lib/navigation';
import { getNormalizedPropertyPrice, RentalPeriod } from '../../lib/priceNormalization';
import { formatCurrency, formatPropertyArea } from '../../lib/utils';

interface PropertyCardProps {
  key?: React.Key;
  property: Property;
  language: Language;
  onSelectProperty: (property: Property) => void;
  onOpenBookViewingModal?: (property: Property) => void;
  layout?: 'grid' | 'list';
  badgeType?: 'featured' | 'new' | 'status';
  activeRentalPeriod?: RentalPeriod;
}

export function PropertyCard({
  property,
  language,
  onSelectProperty,
  onOpenBookViewingModal,
  layout = 'grid',
  badgeType,
  activeRentalPeriod,
}: PropertyCardProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [copied, setCopied] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine badge label
  const isNew = property.id === 'prop-3' || property.status === 'exclusive';
  const displayBadge = badgeType === 'new' || (badgeType !== 'featured' && isNew)
    ? { text: t.home.propertyBadgeNew, variant: 'primary' as const }
    : property.featured
    ? { text: t.home.propertyBadgeFeatured, variant: 'gradient' as const }
    : null;

  const statusLabel =
    property.status === 'for-sale'
      ? t.properties.filters.forSale
      : property.status === 'for-rent'
      ? t.properties.filters.forRent
      : property.status === 'exclusive'
      ? (language === 'en' ? 'Exclusive' : 'حصري')
      : t.properties.filters.offPlan;

  const detailsHref = getPageHref('property-details', `id=${encodeURIComponent(property.id)}`);

  if (layout === 'list') {
    return (
      <div
        id={`property-card-${property.id}`}
        className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-6 p-4 sm:p-5"
      >
        {/* Image Container with Semantic Link */}
        <div className="relative w-full md:w-80 h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
          <a
            href={detailsHref}
            onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
            className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-2xl overflow-hidden"
            aria-label={property?.title?.[language] || (language === 'ar' ? 'عقار' : 'Property')}
          >
            <img
              src={property?.images?.[activeImageIdx] || property?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
              alt={property?.title?.[language] || (language === 'ar' ? 'عقار' : 'Property')}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
          </a>

          {/* Badges Overlay */}
          <div className="absolute top-3 start-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {displayBadge && (
              <Badge variant={displayBadge.variant} className="shadow-sm">
                <Sparkles className="w-3 h-3 me-1 inline" />
                {displayBadge.text}
              </Badge>
            )}
            <Badge variant="dark" className="shadow-sm">
              {statusLabel}
            </Badge>
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Price overlay on image for mobile */}
          <div className="absolute bottom-3 start-3 text-white font-bold text-lg font-display-serif drop-shadow-md pointer-events-none">
            {formatCurrency(property.price.sar, 'SAR', language)}
            {property.price.period && (
              <span className="text-xs font-normal opacity-90">
                {' '}
                {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {property?.location?.area?.[language] || ''}, {property?.location?.city?.[language] || ''}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                <ShieldCheck className="w-3 h-3" />
                {language === 'en' ? 'Verified Title' : 'صك معتمد'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display-serif">
              <a
                href={detailsHref}
                onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
                className="hover:text-blue-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                {property?.title?.[language] || ''}
              </a>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {property?.description?.[language] || ''}
            </p>

            {/* Key Specs */}
            <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 max-w-fit">
              <div className="flex items-center gap-1.5 font-medium">
                <Bed className="w-4 h-4 text-blue-600" />
                <span>{property.bedrooms > 0 ? `${property.bedrooms} ${t.properties.beds}` : (language === 'en' ? 'Commercial' : 'تجاري')}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Bath className="w-4 h-4 text-blue-600" />
                <span>{property.bathrooms} {t.properties.baths}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Maximize className="w-4 h-4 text-blue-600" />
                <span>{formatPropertyArea(property, language, { showSecondary: true })}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-slate-900 font-extrabold text-xl font-display-serif hidden md:block">
              {formatCurrency(property.price.sar, 'SAR', language)}
              {property.price.period && (
                <span className="text-xs font-normal text-slate-500">
                  {' '}
                  {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <a
                href={detailsHref}
                onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#0f243e] text-white text-xs font-bold flex-1 sm:flex-none justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 min-h-[40px] shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.cta.viewDetails}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </a>

              {onOpenBookViewingModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBookViewingModal(property);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 text-xs font-semibold flex-1 sm:flex-none justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 min-h-[40px] cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.cta.bookViewing}</span>
                </button>
              )}

              <a
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  language === 'en'
                    ? `Hello HARD Real Estate, I would like more information on "${property?.title?.en || ''}" (Ref: ${property?.id || ''}).`
                    : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property?.title?.ar || ''}" (رقم المرجع: ${property?.id || ''}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-xs font-semibold flex-1 sm:flex-none justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 min-h-[40px] cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.nav.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Default 3-Column Card)
  return (
    <div
      id={`property-card-${property.id}`}
      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
    >
      <div>
        {/* High-Resolution Image Container with Semantic Link */}
        <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
          <a
            href={detailsHref}
            onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
            className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={property?.title?.[language] || (language === 'ar' ? 'عقار' : 'Property')}
          >
            <img
              src={property?.images?.[activeImageIdx] || property?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
              alt={property?.title?.[language] || (language === 'ar' ? 'عقار' : 'Property')}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-70 pointer-events-none" />
          </a>

          {/* Badges on Top */}
          <div className="absolute top-3 start-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {displayBadge && (
              <Badge variant={displayBadge.variant} className="shadow-md">
                <Sparkles className="w-3 h-3 me-1 inline" />
                {displayBadge.text}
              </Badge>
            )}
            <Badge variant="dark" className="shadow-md">
              {statusLabel}
            </Badge>
          </div>

          {/* Share Button on Top Right */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Prominent Price Tag Badge on Bottom of Image */}
          <div className="absolute bottom-3 start-3 text-white font-extrabold text-lg sm:text-xl font-display-serif drop-shadow-lg flex flex-wrap items-baseline gap-1.5 pointer-events-none">
            <span>{formatCurrency(property.price.sar, 'SAR', language)}</span>
            {property.price.period && (
              <span className="text-xs font-medium text-slate-200 me-1">
                {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
              </span>
            )}
            {activeRentalPeriod && property.status === 'for-rent' && property.price.period && property.price.period !== activeRentalPeriod && (
              <span className="text-[11px] font-semibold text-blue-200 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                (~{formatCurrency(getNormalizedPropertyPrice(property, activeRentalPeriod), 'SAR', language)}{' '}
                {activeRentalPeriod === 'month' ? t.propertyDetails.perMonth : t.propertyDetails.perYear})
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Location text */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">
              {property?.location?.area?.[language] || ''}, {property?.location?.city?.[language] || ''}
            </span>
          </div>

          {/* Property Title */}
          <h3
            className="text-base sm:text-lg font-bold text-slate-900 font-display-serif line-clamp-1"
            title={property?.title?.[language] || ''}
          >
            <a
              href={detailsHref}
              onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
              className="hover:text-blue-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {property?.title?.[language] || ''}
            </a>
          </h3>

          {/* Key Specs Icons Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl text-[11px] text-slate-700 border border-slate-100">
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">
                {property.bedrooms > 0 ? `${property.bedrooms} ${t.properties.beds}` : (language === 'ar' ? 'تجاري' : 'Comm.')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{property.bathrooms} {t.properties.baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{formatPropertyArea(property, language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footers */}
      <div className="p-5 pt-0 space-y-2">
        {/* Primary Action: View Property Details */}
        <a
          href={detailsHref}
          onClick={(e) => handleSemanticClick(e, () => onSelectProperty(property))}
          className="w-full inline-flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#0f243e] text-white text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 min-h-[40px] shadow-xs cursor-pointer group/btn"
        >
          <span>{t.cta.viewDetails}</span>
          <ArrowIcon className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>

        {/* Secondary Quick Action Row: Book Viewing & WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenBookViewingModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBookViewingModal(property);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 text-xs font-semibold justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 min-h-[40px] cursor-pointer w-full"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="truncate">{t.cta.bookViewing}</span>
            </button>
          )}

          <a
            href={`https://wa.me/966556125711?text=${encodeURIComponent(
              language === 'en'
                ? `Hello HARD Real Estate, I am inquiring about "${property?.title?.en || ''}" (Ref: ${property?.id || ''}).`
                : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property?.title?.ar || ''}" (رقم المرجع: ${property?.id || ''}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-xs font-semibold justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 min-h-[40px] cursor-pointer w-full"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{t.nav.whatsapp}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
