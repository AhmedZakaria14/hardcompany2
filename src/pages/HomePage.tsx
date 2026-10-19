import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Home,
  CheckCircle2,
  Building,
  Key,
  TrendingUp,
  SlidersHorizontal,
  Compass,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Language, PageId, Property, PropertyFilterParams, Project } from '../types';
import { translations as defaultTranslations } from '../lib/translations';
import { mockProjects, mockTestimonials } from '../data/mockData';
import { SAUDI_CITIES } from '../data/cities';
import { CitySearchDropdown } from '../components/ui/CitySearchDropdown';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PropertyCard } from '../components/ui/PropertyCard';
import { TestimonialSlider } from '../components/ui/TestimonialSlider';
import { ServicesSection } from '../components/home/ServicesSection';
import { ComplianceVerificationModal } from '../components/modals/ComplianceVerificationModal';
import { useData } from '../context/DataContext';
import { useTextOverride } from '../context/TextOverrideContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../lib/navigation';

interface HomePageProps {
  onNavigate: (page: PageId, filters?: PropertyFilterParams) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal: (property: Property) => void;
  onOpenListPropertyModal: () => void;
  onOpenInquiryModal: () => void;
  onOpenProjectInquiryModal?: (project: Project) => void;
}

export function HomePage({
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
  onOpenListPropertyModal,
  onOpenInquiryModal,
  onOpenProjectInquiryModal,
}: HomePageProps) {
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const { properties, testimonials } = useData();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Search Filter State in Hero
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'off-plan'>('buy');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchBudget, setSearchBudget] = useState('all');

  // Compliance & Evidence Verification Modal State
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [complianceTab, setComplianceTab] = useState<'licensing' | 'reviews' | 'financials' | 'stats'>('stats');

  // Featured properties: 3-column top listings fetched directly from the database layer
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 3).length > 0
    ? properties.filter((p) => p.featured).slice(0, 3)
    : properties.slice(0, 3);
  const spotlightProject = mockProjects[0];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();

    let min = 0;
    let max = activeTab === 'rent' ? 500000 : 50000000;

    if (activeTab === 'rent') {
      if (searchBudget === 'rent-under-100k') {
        min = 0;
        max = 100000;
      } else if (searchBudget === 'rent-100k-200k') {
        min = 100000;
        max = 200000;
      } else if (searchBudget === 'rent-200k-350k') {
        min = 200000;
        max = 350000;
      } else if (searchBudget === 'rent-350k+') {
        min = 350000;
        max = 500000;
      }
    } else {
      if (searchBudget === '500k-1m') {
        min = 500000;
        max = 1000000;
      } else if (searchBudget === '1m-3m') {
        min = 1000000;
        max = 3000000;
      } else if (searchBudget === '3m-6m') {
        min = 3000000;
        max = 6000000;
      } else if (searchBudget === '6m-12m') {
        min = 6000000;
        max = 12000000;
      } else if (searchBudget === '12m+') {
        min = 12000000;
        max = 50000000;
      }
    }

    const statusMap: Record<string, string> = {
      buy: 'for-sale',
      rent: 'for-rent',
      'off-plan': 'off-plan',
    };

    onNavigate('properties', {
      city: searchLocation || 'all',
      type: searchType,
      status: statusMap[activeTab] || 'all',
      rentalPeriod: 'year',
      minPrice: min,
      maxPrice: max,
      priceRange: searchBudget,
    });
  };

  const statList = [
    { value: t.home.stats.volume, label: t.home.stats.volumeLabel },
    { value: t.home.stats.properties, label: t.home.stats.propertiesLabel },
    { value: t.home.stats.clients, label: t.home.stats.clientsLabel },
    { value: t.home.stats.advisors, label: t.home.stats.advisorsLabel },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32 pb-20">
      {/* 1. HERO SECTION */}
      <section
        id="home-hero-section"
        className="relative bg-slate-950 text-white min-h-[660px] sm:min-h-[720px] flex items-center overflow-visible pb-24 sm:pb-32"
      >
        {/* High-End Architectural Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=90"
            alt="Luxury Modern Architecture"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-65 brightness-110 contrast-105 scale-105 transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-900/15" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/25 to-slate-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full space-y-10 overflow-visible">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{t.home.heroTag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display-serif leading-tight">
              {t.home.heroTitlePrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-blue-400">
                {t.home.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              {t.home.heroSubtitle}
            </p>
          </div>

          {/* Prominent, Simplified Search Bar (Location, Property Type, Price Range) - 25% wider container with full dropdown visibility */}
          <div className="relative z-30 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 text-slate-900 max-w-5xl lg:max-w-6xl w-full overflow-visible">
            {/* Search Tab Switcher: Buy, Rent, Off-Plan */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200/80 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'buy'
                    ? 'bg-hard-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.home.searchTabs.buy}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'rent'
                    ? 'bg-hard-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.home.searchTabs.rent}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('off-plan')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'off-plan'
                    ? 'bg-hard-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.home.searchTabs.offPlan}
              </button>
            </div>

            {/* Filter Form Bar: Location, Property Type, Price Range */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-30 overflow-visible">
              {/* Location / City Input with embedded 50 Saudi cities dropdown & search */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  {t.properties.filters.city}
                </label>
                <CitySearchDropdown
                  value={searchLocation}
                  onChange={(city) => setSearchLocation(city === 'all' ? '' : city)}
                  language={language}
                  placeholder={language === 'en' ? 'Search by city name' : 'ابحث باسم المدينة'}
                  showAllOption={false}
                  id="hero-city-search"
                />
              </div>

              {/* Property Type Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  {t.properties.filters.type}
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">{t.properties.filters.allTypes}</option>
                  <option value="villa">{t.properties.filters.villa}</option>
                  <option value="apartment">{t.properties.filters.apartment}</option>
                  <option value="penthouse">{t.properties.filters.penthouse}</option>
                  <option value="mansion">{t.properties.filters.mansion}</option>
                  <option value="townhouse">{t.properties.filters.townhouse}</option>
                  <option value="commercial">{t.properties.filters.commercial}</option>
                </select>
              </div>

              {/* Price Range Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  {t.properties.filters.priceRange}
                </label>
                <select
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {activeTab === 'rent' ? (
                    <>
                      <option value="all">{language === 'en' ? 'Any Rental Budget' : 'جميع ميزانيات الإيجار'}</option>
                      <option value="rent-under-100k">{language === 'en' ? 'Under 100,000 SAR / yr' : 'أقل من 100,000 ر.س / سنوياً'}</option>
                      <option value="rent-100k-200k">{language === 'en' ? '100,000 - 200,000 SAR / yr' : '100,000 - 200,000 ر.س / سنوياً'}</option>
                      <option value="rent-200k-350k">{language === 'en' ? '200,000 - 350,000 SAR / yr' : '200,000 - 350,000 ر.س / سنوياً'}</option>
                      <option value="rent-350k+">{language === 'en' ? '350,000+ SAR / yr' : 'أكثر من 350,000 ر.س / سنوياً'}</option>
                    </>
                  ) : (
                    <>
                      <option value="all">{language === 'en' ? 'Any Purchase Budget' : 'جميع ميزانيات الشراء'}</option>
                      <option value="500k-1m">{language === 'en' ? '500,000 - 1,000,000 SAR' : '500,000 - 1,000,000 ريال'}</option>
                      <option value="1m-3m">{language === 'en' ? '1,000,000 - 3,000,000 SAR' : '1,000,000 - 3,000,000 ريال'}</option>
                      <option value="3m-6m">{language === 'en' ? '3,000,000 - 6,000,000 SAR' : '3,000,000 - 6,000,000 ريال'}</option>
                      <option value="6m-12m">{language === 'en' ? '6,000,000 - 12,000,000 SAR' : '6,000,000 - 12,000,000 ريال'}</option>
                      <option value="12m+">{language === 'en' ? '12,000,000+ SAR' : '12,000,000+ ريال'}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Search Submit Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center h-11 font-bold shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.cta.viewAvailableProperties}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* TRUST STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse sm:divide-slate-100">
          {statList.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center text-center space-y-1.5 px-3 py-2"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-700 font-display-serif tracking-tight text-center">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium text-center leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setComplianceTab('stats');
              setIsComplianceModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {language === 'en'
                ? 'Audited Corporate Metrics & Evidence Basis (Q3 2026 Audit)'
                : 'إحصائيات موثقة وأدلة الاعتماد والتراخيص (تحديث أكتوبر 2026)'}
            </span>
          </button>
        </div>
      </section>

      {/* 2. FEATURED LISTINGS GRID (3-Column Card Layout) */}
      <section id="featured-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="primary">
              <Sparkles className="w-3 h-3 me-1 inline" />
              {language === 'en' ? 'Prime Selection' : 'مختارات مميزة'}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
              {t.home.featuredSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.home.featuredSectionSubtitle}
            </p>
          </div>

          <a
            href={getPageHref('properties')}
            onClick={(e) => handleSemanticClick(e, () => onNavigate('properties'))}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>{t.cta.viewAvailableProperties}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3-Column Card Grid displaying top properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProperties.map((property, idx) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelectProperty={onSelectProperty}
              onOpenBookViewingModal={onOpenBookViewingModal}
              badgeType={idx === 0 ? 'featured' : idx === 2 ? 'new' : 'featured'}
            />
          ))}
        </div>
      </section>

      {/* 3. OUR SERVICES: ALTERNATING ROWS (Brokerage, Marketing, Advisory) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesSection
          language={language}
          onNavigate={onNavigate}
          onOpenListPropertyModal={onOpenListPropertyModal}
          onOpenInquiryModal={onOpenInquiryModal}
        />
      </section>

      {/* 4. TESTIMONIALS SLIDER COMPONENT */}
      <section id="testimonials-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary" className="mx-auto">
            <Sparkles className="w-3 h-3 me-1 inline" />
            {t.home.testimonialsTag}
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
            {t.home.testimonialsSectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.home.testimonialsSectionSubtitle}
          </p>
        </div>

        {/* The Testimonial Slider Component */}
        <TestimonialSlider testimonials={testimonials.length > 0 ? testimonials : mockTestimonials} language={language} />
      </section>

      {/* MASTER PROJECT SPOTLIGHT */}
      {spotlightProject && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-slate-950">
              <img
                src={spotlightProject.image}
                alt={spotlightProject.title[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {spotlightProject.financialMetric?.isVerified ? (
                <div className="absolute top-4 start-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{spotlightProject.financialMetric.value} {spotlightProject.financialMetric.metricLabel?.[language]}</span>
                </div>
              ) : (
                <div
                  className="absolute top-4 start-4 bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1.5"
                  title={spotlightProject.financialMetric?.statusNote?.[language]}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{spotlightProject.financialMetric?.verificationStatus?.[language] || spotlightProject.roiProjected}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{language === 'en' ? 'Exclusive Master Project' : 'مشروع تطويري حصري'}</Badge>
                  <span className="text-xs text-blue-300 font-medium">{spotlightProject.developer[language]}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
                  {spotlightProject.title[language]}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {spotlightProject.description[language]}
                </p>

                {spotlightProject.financialMetric && !spotlightProject.financialMetric.isVerified && spotlightProject.financialMetric.statusNote && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 leading-relaxed">
                    <strong className="text-amber-400 block mb-0.5">{language === 'en' ? 'Financial Audit Notice:' : 'إشعار التدقيق المالي:'}</strong>
                    <span>{spotlightProject.financialMetric.statusNote[language]}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-medium">{t.projects.startingFrom}:</span>
                    <strong className="text-base sm:text-lg text-blue-400 font-display-serif">
                      {spotlightProject.startingPriceSAR}
                    </strong>
                  </div>
                  <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 block font-medium">{t.projects.handover}:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {spotlightProject.lastUpdated || '2026-10-09'}
                      </span>
                    </div>
                    <strong className="text-base sm:text-lg text-slate-200 font-medium block">
                      {spotlightProject.handoverDate[language]}
                    </strong>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{t.projects.progress}: {spotlightProject.progressPercentage || 68}%</span>
                      <span className="text-blue-400 font-semibold">{t.projects.underConstruction}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={getPageHref('projects')}
                  onClick={(e) => handleSemanticClick(e, () => onNavigate('projects'))}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold justify-center shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span>{t.cta.exploreProjects}</span>
                  <ArrowIcon className="w-4 h-4" />
                </a>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (onOpenProjectInquiryModal && spotlightProject) {
                      onOpenProjectInquiryModal(spotlightProject);
                    } else {
                      onOpenInquiryModal();
                    }
                  }}
                  className="justify-center"
                >
                  <span>{t.projects.inquireProject}</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GLOBAL LISTING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-hard-gradient text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs">
                <BrandLogo size="xs" isIconOnly={true} />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-100">
                {language === 'en' ? 'Sell or Lease with HARD' : 'اعرض عقارك للبيع أو الإيجار'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
              {t.home.marketingBannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed">
              {t.home.marketingBannerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="lg"
              onClick={onOpenListPropertyModal}
              className="font-bold text-blue-900 shadow-xl"
            >
              <span>{t.cta.listProperty}</span>
              <ArrowIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Compliance & Verification Audit Modal */}
      <ComplianceVerificationModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        language={language}
        initialTab={complianceTab}
      />
    </div>
  );
}
