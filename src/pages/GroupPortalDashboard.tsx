import React, { useState } from 'react';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Globe,
  HardHat,
  ThermometerSnowflake,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { ConstructionShowcaseModal } from '../components/portal/ConstructionShowcaseModal';
import { HVACShowcaseModal } from '../components/portal/HVACShowcaseModal';
import { handleSemanticClick } from '../lib/navigation';
import { SectorNav } from '../components/layout/SectorNav';

interface GroupPortalDashboardProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateToRealEstate: (page?: PageId) => void;
  onNavigateToConstruction?: () => void;
  onNavigateToHVAC?: () => void;
}

export function GroupPortalDashboard({
  language,
  onLanguageChange,
  onNavigateToRealEstate,
  onNavigateToConstruction,
  onNavigateToHVAC,
}: GroupPortalDashboardProps) {
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [constructionModalOpen, setConstructionModalOpen] = useState(false);
  const [hvacModalOpen, setHvacModalOpen] = useState(false);

  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'ar' : 'en');
  };

  const handleConstructionClick = () => {
    if (onNavigateToConstruction) {
      onNavigateToConstruction();
    } else {
      setConstructionModalOpen(true);
    }
  };

  const handleHVACClick = () => {
    if (onNavigateToHVAC) {
      onNavigateToHVAC();
    } else {
      setHvacModalOpen(true);
    }
  };

  const divisions = [
    {
      id: 'realestate',
      nameEn: 'HARD Real Estate',
      nameAr: 'هارد للعقارات',
      descriptionEn:
        'A premier Saudi real estate advisory delivering certified residential sales, commercial leasing, off-plan master developments, and REGA-verified portfolio management across the Kingdom.',
      descriptionAr:
        'الذراع العقاري الرائد في المملكة العربية السعودية، متخصص في التسويق والوساطة المعتمدة من الهيئة العامة للعقار (فال)، وإدارة المحافظ الاستثمارية الكبرى في المنطقة الشرقية والرياض.',
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      linkTextEn: 'Enter Real Estate Portal',
      linkTextAr: 'الدخول للبوابة العقارية',
      href: '/realestate',
      onClick: () => onNavigateToRealEstate('home'),
    },
    {
      id: 'construction',
      nameEn: 'HARD Construction',
      nameAr: 'هارد للإنشاءات',
      descriptionEn:
        'Class-A general contracting division building high-specification commercial structures, modern residential complexes, luxury fit-outs, and turnkey infrastructure projects with rigorous SBC compliance.',
      descriptionAr:
        'الذراع الإنشائي والهندسي لمجموعة هارد، يقدم خدمات المقاولات العامة المصنفة فئة أولى لتنفيذ الأبراج التجارية، المجمعات السكنية، والمنشآت الذكية بأعلى كفاءة ومعايير كود البناء السعودي.',
      image:
        'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80',
      linkTextEn: 'Explore Construction Division',
      linkTextAr: 'استكشاف قطاع الإنشاءات',
      href: '/construction',
      onClick: handleConstructionClick,
    },
    {
      id: 'hvac',
      nameEn: 'HARD HVAC Maintenance',
      nameAr: 'هارد لصيانة التكييف',
      descriptionEn:
        'Specialized electro-mechanical engineering services providing comprehensive chiller overhaul, central VRF installations, smart climate automation, and 24/7 rapid emergency dispatch across Eastern Province & Riyadh.',
      descriptionAr:
        'الذراع التخصصي للخدمات الكهروميكانيكية والتبريد، يقدم عقود الصيانة الوقائية (AMC) للشيلرات، أنظمة VRF الحديثة، وتنقية مجاري الهواء مع طوارئ واستجابة فورية على مدار الساعة.',
      image:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      linkTextEn: 'Explore HVAC Maintenance',
      linkTextAr: 'استكشاف خدمات التكييف',
      href: '/hvac',
      onClick: handleHVACClick,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-ui-sans selection:bg-blue-600 selection:text-white">
      {/* 0. Global Sector Utility Navigation Bar */}
      <SectorNav
        currentPage="portal"
        language={language}
        onNavigate={(pageId) => {
          if (pageId === 'portal') return;
          if (pageId === 'construction') handleConstructionClick();
          else if (pageId === 'hvac') handleHVACClick();
          else onNavigateToRealEstate(pageId);
        }}
      />

      {/* Top Corporate Nav Bar matching Real Estate palette */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* HARD Group Logo and Title with Corporate Group Portal underneath */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 sm:h-14 w-auto flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="HARD Group"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col justify-center text-start">
              <span className="font-display-serif font-black text-lg sm:text-xl text-sky-600 tracking-tight leading-tight">
                {isAr ? 'مجموعة هارد' : 'HARD Group'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
                {isAr ? 'بوابة المجموعة القابضة' : 'Corporate Group Portal'}
              </span>
            </div>
          </div>

          {/* Right Actions: Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-sky-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold font-display-serif text-slate-900 tracking-tight">
            {isAr ? 'مجموعة هارد' : 'HARD Group'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'بوابة موحدة تجمع قطاعات مجموعة هارد في التطوير والوساطة العقارية، المقاولات والإنشاءات، وصيانة أنظمة التكييف والتبريد.'
              : 'Unified corporate gateway connecting HARD Group’s specialized divisions in Real Estate, Construction, and HVAC Maintenance.'}
          </p>
        </div>

        {/* 3 Core Division Sections: Main Image + Brief Description with Title as Hyperlink */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {divisions.map((div) => {
            return (
              <div
                key={div.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* 1. Main Image (clickable) */}
                <a
                  href={div.href}
                  onClick={(e) => handleSemanticClick(e, div.onClick)}
                  className="aspect-16/10 overflow-hidden bg-slate-100 relative block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  aria-label={isAr ? div.nameAr : div.nameEn}
                >
                  <img
                    src={div.image}
                    alt={isAr ? div.nameAr : div.nameEn}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                </a>

                {/* 2. Brief Description with Title as Hyperlink */}
                <div className="p-6 flex-1 flex flex-col space-y-3 text-start">
                  <h2>
                    <a
                      href={div.href}
                      onClick={(e) => handleSemanticClick(e, div.onClick)}
                      className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 hover:text-sky-600 font-display-serif transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      <span>{isAr ? div.nameAr : div.nameEn}</span>
                      <ArrowIcon className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isAr ? div.descriptionAr : div.descriptionEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Corporate Group Footer matching Real Estate palette */}
      <footer className="bg-white border-t border-slate-200/80 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="HARD Group" className="h-5 w-auto object-contain" />
            <span className="font-medium text-slate-700">
              {isAr ? 'مجموعة هارد © ٢٠٢٦' : 'HARD Group © 2026. All rights reserved.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 font-medium">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              {isAr ? 'قطاعات هارد:' : 'Sectors:'}
            </span>
            <span className="text-sky-600 font-bold">
              {isAr ? 'بوابة مجموعة هارد (القطاع الحالي)' : 'HARD Group Portal (Current)'}
            </span>
            <span className="text-slate-300">•</span>
            <a
              href="/realestate"
              onClick={(e) => handleSemanticClick(e, () => onNavigateToRealEstate('home'))}
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              {isAr ? 'هارد للعقارات' : 'HARD Real Estate'}
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="/construction"
              onClick={(e) => handleSemanticClick(e, handleConstructionClick)}
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              {isAr ? 'هارد للإنشاءات' : 'HARD Construction'}
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="/hvac"
              onClick={(e) => handleSemanticClick(e, handleHVACClick)}
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              {isAr ? 'هارد لصيانة التكييف' : 'HARD HVAC Maintenance'}
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <ConstructionShowcaseModal
        isOpen={constructionModalOpen}
        onClose={() => setConstructionModalOpen(false)}
        language={language}
      />
      <HVACShowcaseModal
        isOpen={hvacModalOpen}
        onClose={() => setHvacModalOpen(false)}
        language={language}
      />
    </div>
  );
}
