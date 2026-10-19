import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Phone,
  FileText,
  Calculator,
  Globe,
  Lock,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';
import { handleSemanticClick } from '../../lib/navigation';
import { HARD_GROUP_SECTORS } from '../../lib/sectors';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface NavbarProps {
  onNavigate?: (page: any) => void;
  onNavigateToPortal?: () => void;
  onNavigateToRealEstate?: () => void;
  onOpenCMS?: () => void;
}

export function Navbar({
  onNavigate,
  onNavigateToPortal,
  onNavigateToRealEstate,
  onOpenCMS,
}: NavbarProps) {
  const {
    language,
    toggleLanguage,
    openCostEstimator,
    openQuoteModal,
    closeProjectModal,
    selectedProjectForModal,
    unknownProjectId,
  } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthorizedAdmin());

  useEffect(() => {
    const checkAuth = () => setIsAdmin(isAuthorizedAdmin());
    checkAuth();
    window.addEventListener('cms-auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('cms-auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: t.nav.home },
    { href: '#about', label: t.nav.about },
    { href: '#projects', label: t.nav.projects },
    { href: '#services', label: t.nav.services },
    { href: '#calculator', label: t.nav.calculator, isCalc: true },
    { href: '#contact', label: t.nav.contact },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isCalc?: boolean) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (selectedProjectForModal || unknownProjectId) {
      closeProjectModal();
    }
    if (isCalc) {
      openCostEstimator();
      return;
    }
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Top Credentials Micro-Bar */}
      <div className="bg-[#f8fafc] text-slate-600 text-[11px] font-medium border-b border-slate-200/80 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 divide-x divide-slate-200 rtl:divide-x-reverse">
            <div className="flex items-center gap-1.5 text-[#009ee2] font-semibold">
              <HardHat className="w-3.5 h-3.5" />
              <span>{t.credentials.classA}</span>
            </div>
            <div className="ps-4 flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.credentials.sbc}</span>
            </div>
            <div className="ps-4 text-amber-600 font-semibold">
              <span>{t.credentials.warranty}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>{COMPANY_CREDENTIALS.sceAccreditation[language]}</span>
            <span className="text-slate-300">•</span>
            <span>{t.credentials.cr}</span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm py-2.5'
            : 'bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <a
              href="/construction"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={(e) => {
                handleSemanticClick(e, () => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              }}
            >
              <img
                src="/logo.svg"
                alt="HARD Group"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col text-start">
                <span className="font-display-serif font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                  <span className="text-[#009ee2]">{isAr ? 'هارد' : 'HARD'}</span>
                  <span>{isAr ? 'للمقاولات العامة' : 'Contracting Co.'}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  {isAr ? 'مقاولات عامة وتطوير إنشائي' : 'General Contracting & Development'}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700">
            {navLinks.map((link, idx) => {
              const isHome = idx === 0;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href, link.isCalc)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isHome
                      ? 'bg-[#e8f4fc] text-[#009ee2] font-bold border border-[#d0e9fa]/80 shadow-2xs'
                      : link.isCalc
                      ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold inline-flex items-center gap-1'
                      : 'hover:text-[#009ee2] hover:bg-slate-50'
                  }`}
                >
                  {link.isCalc && <Calculator className="w-3.5 h-3.5" />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Direct Call Button */}
            <a
              href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              title={COMPANY_CREDENTIALS.phone}
            >
              <Phone className="w-3.5 h-3.5 text-[#009ee2]" />
              <span className="dir-ltr">{COMPANY_CREDENTIALS.phone}</span>
            </a>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-[#009ee2]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* CMS Portal Trigger (Admins Only) */}
            {isAdmin && onOpenCMS && (
              <button
                type="button"
                onClick={onOpenCMS}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                title={t.nav.cms}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">{t.nav.cms}</span>
              </button>
            )}

            {/* Instant Quote CTA */}
            <button
              type="button"
              onClick={() => openQuoteModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold transition-all shadow-sm shadow-[#009ee2]/20 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.nav.requestQuote}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200"
            >
              <Globe className="w-4 h-4 text-[#009ee2]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 shadow-lg max-h-[85vh] overflow-y-auto">
            {/* Dedicated HARD Group Sectors Switcher */}
            <div className="bg-slate-900 rounded-2xl p-3 text-white space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
              </div>
              <div className="space-y-1">
                {HARD_GROUP_SECTORS.map((sector) => {
                  const isCurrent = sector.id === 'construction';
                  return (
                    <a
                      key={sector.id}
                      href={sector.href}
                      onClick={(e) =>
                        handleSemanticClick(e, () => {
                          if (!isCurrent && onNavigate) {
                            onNavigate(sector.pageId);
                          }
                          setMobileMenuOpen(false);
                        })
                      }
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#009ee2] text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{sector.name[language]}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 text-sky-200 uppercase font-extrabold">
                          {isAr ? 'القطاع الحالي' : 'Active'}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                {isAr ? 'أقسام الموقع' : 'Construction Navigation'}
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href, link.isCalc)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 ${
                    link.isCalc ? 'text-amber-600 font-bold' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuoteModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.nav.requestQuote}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCostEstimator();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{t.hero.ctaEstimate}</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                {isAdmin && onOpenCMS && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenCMS) onOpenCMS();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.nav.cms}</span>
                  </button>
                )}

                <a
                  href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#009ee2] font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{COMPANY_CREDENTIALS.phone}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
