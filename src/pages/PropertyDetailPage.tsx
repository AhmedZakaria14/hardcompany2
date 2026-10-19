import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Building,
  Car,
  RefreshCw,
} from 'lucide-react';
import { Language, PageId, Property } from '../types';
import { translations } from '../lib/translations';
import { mockProperties } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { getLocalizedText } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatPropertyArea, getNormalizedAmenities } from '../lib/utils';
import { PropertyInquiryForm } from '../components/forms/PropertyInquiryForm';
import { getPageHref, handleSemanticClick } from '../lib/navigation';
import { getPropertyTypeLabel } from '../lib/propertyTaxonomy';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onNavigate: (page: PageId) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal?: (property: Property) => void;
}

export function PropertyDetailPage({
  property,
  onBack,
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
}: PropertyDetailPageProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 font-ui-sans">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-600">
          {language === 'ar' ? 'جاري تحميل تفاصيل العقار...' : 'Loading property details...'}
        </p>
      </div>
    );
  }

  const similarProperties = mockProperties.filter((p) => p.id !== property.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <a
        href={getPageHref('properties')}
        onClick={(e) => handleSemanticClick(e, onBack)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
      >
        <ArrowIcon className="w-4 h-4" />
        <span>{t.propertyDetails.backToListings}</span>
      </a>

      {/* Main Header & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={property.status === 'for-sale' ? 'gradient' : 'dark'}>
              {property.status === 'for-sale'
                ? t.properties.filters.forSale
                : property.status === 'for-rent'
                ? t.properties.filters.forRent
                : t.properties.filters.offPlan}
            </Badge>
            <Badge variant="outline">{getPropertyTypeLabel(property.type, language)}</Badge>
            <span className="text-xs text-slate-400">ID: {property.id}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight leading-tight">
            {getLocalizedText(property.title, language)}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{getLocalizedText(property.location?.address || property.location?.city, language)}</span>
          </div>
        </div>

        {/* Price & Action Box */}
        <div className="text-start lg:text-end space-y-3">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">
              {t.propertyDetails.price}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-display-serif">
              {formatCurrency(property.price.sar, 'SAR', language)}
              {property.price.period && (
                <span className="text-sm font-normal text-slate-500">
                  {' '}
                  {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-3">
        {/* Main large image */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
          <img
            src={property.images[activeImageIndex] || property.images[0]}
            alt={
              language === 'ar'
                ? `${property.title[language]} - صورة ${activeImageIndex + 1} من ${property.images.length}`
                : `${property.title[language]} - Photo ${activeImageIndex + 1} of ${property.images.length}`
            }
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnails */}
        {property.images.length > 1 && (
          <div
            className="flex items-center gap-3 overflow-x-auto pb-2"
            role="region"
            aria-label={language === 'ar' ? 'معرض صور العقار' : 'Property photo gallery'}
          >
            {property.images.map((img, idx) => {
              const isSelected = activeImageIndex === idx;
              const imagePositionLabel = language === 'ar'
                ? `صورة العقار ${idx + 1} من ${property.images.length}`
                : `Property photo ${idx + 1} of ${property.images.length}`;
              const selectionStatus = isSelected
                ? (language === 'ar' ? 'محددة حالياً' : 'currently selected')
                : (language === 'ar' ? 'انقر للرؤية' : 'click to select');

              return (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`${imagePositionLabel} - ${selectionStatus}`}
                  aria-pressed={isSelected}
                  className={`relative w-24 sm:w-32 aspect-16/10 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={imagePositionLabel}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Details & Sticky Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Details, Specs, Amenities, Mortgage Calc (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.bedrooms}
              </span>
              <p className="text-base font-bold text-slate-900">
                {property.bedrooms > 0 ? `${property.bedrooms} ${t.properties.beds}` : (language === 'ar' ? 'تجاري' : 'Commercial')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.bathrooms}
              </span>
              <p className="text-base font-bold text-slate-900">{property.bathrooms} {t.properties.baths}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.area}
              </span>
              <p className="text-base font-bold text-slate-900">
                {formatPropertyArea(property, language, { showSecondary: true })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.parking}
              </span>
              <p className="text-base font-bold text-slate-900">
                {property.features.parkingSpaces}{' '}
                {language === 'ar'
                  ? (property.features.parkingSpaces === 1 ? 'موقف' : 'مواقف')
                  : (property.features.parkingSpaces === 1 ? 'Space' : 'Spaces')}
              </p>
            </div>
          </div>

          {/* Description / Overview */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.overview}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {getLocalizedText(property.description, language)}
            </p>
          </div>

          {/* Detailed Specifications Matrix */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.specifications}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.propertyType}:</span>
                <span className="font-semibold text-slate-900">{getPropertyTypeLabel(property.type, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.yearBuilt}:</span>
                <span className="font-semibold text-slate-900">{property.features?.yearBuilt}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.furnishing}:</span>
                <span className="font-semibold text-slate-900">{getLocalizedText(property.features?.furnishing, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.view}:</span>
                <span className="font-semibold text-slate-900">{getLocalizedText(property.features?.view, language)}</span>
              </div>
            </div>
          </div>

          {/* Luxury Amenities */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.amenities}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getNormalizedAmenities(property, language).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Property Inquiry Form */}
          <PropertyInquiryForm property={property} language={language} />
        </div>

        {/* Right Column: Sticky Action & Direct Agent Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct CTA Box */}
          <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif">
              {language === 'en' ? 'Inquire or Tour Property' : 'طلب معاينة أو استفسار'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.propertyDetails.bookViewingSubtitle}
            </p>

            {/* Mandatory "Book a Viewing" CTA */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenBookViewingModal(property)}
              className="w-full shadow-md justify-center font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.cta.bookViewing}</span>
            </Button>

            {/* Mandatory "Chat on WhatsApp" Direct CTA */}
            <Button
              href={`https://wa.me/966556125711?text=${encodeURIComponent(
                language === 'en'
                  ? `Hello HARD Real Estate, I'm inquiring about "${property?.title?.en || ''}" (Ref: ${property?.id || ''}).`
                  : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property?.title?.ar || ''}" (رقم المرجع: ${property?.id || ''}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              size="lg"
              className="w-full justify-center"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.cta.chatOnWhatsApp}</span>
            </Button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'en' ? 'Verified Title Deed & Escrow Protected' : 'صك ملكية موثق ومعتمد وضمان بنكي'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      <div className="pt-12 border-t border-slate-200 space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
          {t.propertyDetails.similarProperties}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {similarProperties.map((sim) => (
            <a
              key={sim.id}
              href={getPageHref('property-details', `id=${encodeURIComponent(sim.id)}`)}
              onClick={(e) => {
                handleSemanticClick(e, () => {
                  onSelectProperty(sim);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="relative sm:w-48 aspect-16/10 sm:aspect-auto overflow-hidden bg-slate-100">
                <img
                  src={sim.images[0]}
                  alt={getLocalizedText(sim.title, language)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[11px] text-blue-600 font-semibold">{getLocalizedText(sim.location?.area || sim.location?.city, language)}</span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {getLocalizedText(sim.title, language)}
                  </h4>
                </div>
                <div className="text-sm font-bold text-slate-900 font-display-serif">
                  {sim.price.formattedSAR || `${sim.price.sar?.toLocaleString()} SAR`}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
