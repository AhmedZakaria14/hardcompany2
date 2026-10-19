import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  FileCheck,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';

export function ContactSection() {
  const { language, openQuoteModal } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#f8fafc] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl text-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#d0e9fa] text-[#009ee2] text-xs font-bold shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#009ee2]" />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
            {t.contact.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact Info Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Headquarters Card */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#eef7ff] border border-sky-100 text-[#009ee2]">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {t.contact.headquarters}
                </h3>
                <span className="text-xs text-[#009ee2] font-semibold">
                  {isAr ? 'الإدارة العامة والمشاريع الكبرى' : 'Executive Management & Major Tenders'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#009ee2] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="leading-relaxed block">{COMPANY_CREDENTIALS.address[language]}</span>
                  <span className="inline-block text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-mono">
                    {COMPANY_CREDENTIALS.verificationStatus[language]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#009ee2] shrink-0" />
                <a
                  href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                  className="hover:text-[#009ee2] font-semibold dir-ltr text-start text-slate-800"
                >
                  {COMPANY_CREDENTIALS.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#009ee2] shrink-0" />
                <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-[#009ee2] text-slate-800">
                  {COMPANY_CREDENTIALS.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#009ee2] shrink-0" />
                <span>{t.contact.openingHours}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-medium">
                {t.credentials.cr}
              </div>
              <a
                href={COMPANY_CREDENTIALS.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009ee2] hover:text-[#008bc7]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isAr ? 'اتجاهات المقر' : 'Office Directions'}</span>
              </a>
            </div>
          </div>

          {/* Eastern Province Branch Card */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {t.contact.branch}
                </h3>
                <span className="text-xs text-amber-600 font-semibold">
                  {isAr ? 'مشاريع الخبر والدمام والجبيل' : 'Khobar, Dammam & Industrial Coast'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {COMPANY_CREDENTIALS.easternProvinceBranch[language]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <a
                  href={`tel:${COMPANY_CREDENTIALS.mobile.replace(/\s+/g, '')}`}
                  className="hover:text-amber-600 font-semibold dir-ltr text-start text-slate-800"
                >
                  {COMPANY_CREDENTIALS.mobile}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${COMPANY_CREDENTIALS.whatsapp.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 font-semibold text-emerald-600"
                >
                  {isAr ? 'محادثة واتساب الفورية' : 'Instant WhatsApp Dispatch'}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{COMPANY_CREDENTIALS.momrahClassification[language]}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openQuoteModal()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-xs font-bold text-slate-800 hover:text-[#009ee2] border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <span>{t.nav.requestQuote}</span>
                <ArrowIcon className="w-3.5 h-3.5 text-[#009ee2]" />
              </button>
              <a
                href={COMPANY_CREDENTIALS.easternGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 inline-flex items-center gap-1 shrink-0"
                title={isAr ? 'اتجاهات فرع الخبر' : 'Khobar Branch Directions'}
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{isAr ? 'اتجاهات الخبر' : 'Khobar Directions'}</span>
              </a>
            </div>
          </div>

          {/* Interactive Verified Map Visual */}
          <div className="relative rounded-3xl overflow-hidden border border-sky-100 bg-slate-100 flex flex-col justify-between shadow-sm min-h-[340px]">
            {/* Embedded Location Map Frame */}
            <iframe
              title="HARD Contracting HQ Location Map"
              src={`https://maps.google.com/maps?q=${COMPANY_CREDENTIALS.coordinates.lat},${COMPANY_CREDENTIALS.coordinates.lng}&hl=${language}&z=15&output=embed`}
              className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
              loading="lazy"
            />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0f243e]/40 to-transparent pointer-events-none" />

            <div className="relative z-10 p-4 text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-sky-200 text-[#009ee2] text-[11px] font-bold shadow-sm backdrop-blur-xs">
                <Navigation className="w-3.5 h-3.5" />
                <span>{isAr ? 'إحداثيات المقر الرئيسي الموثقة' : 'Verified Office Coordinates'}</span>
              </div>
            </div>

            <div className="relative z-10 p-5 text-start space-y-2 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
              <div className="text-xs font-bold text-[#0f243e]">
                {COMPANY_CREDENTIALS.address[language]}
              </div>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {isAr
                  ? 'الموقع: 24.7958° N, 46.6348° E (طريق الملك فهد، حي الصحافة)'
                  : 'Coordinates: 24.7958° N, 46.6348° E (King Fahd Rd, Al-Sahafa)'}
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={COMPANY_CREDENTIALS.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-center text-xs font-bold transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فتح الملاحة المباشرة' : 'Navigate to Verified Office'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
