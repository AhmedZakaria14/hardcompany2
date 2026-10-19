import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Globe,
  Phone,
  MessageSquare,
  PlusCircle,
  Building,
  Home,
  Layers,
  Megaphone,
  Info,
  BookOpen,
  Mail,
  ChevronDown,
  HardHat,
  ThermometerSnowflake,
  Building2,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import { translations as defaultTranslations } from '../../lib/translations';
import { useTextOverride } from '../../context/TextOverrideContext';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../../lib/navigation';
import { HARD_GROUP_SECTORS } from '../../lib/sectors';
import { subscribeNavigationDoc, NavItem } from '../../lib/cmsNavigationManager';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenListPropertyModal: () => void;
}

const SECTOR_ICONS = {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
};

export function Navbar({
  currentPage,
  onNavigate,
  language,
  onLanguageChange,
  onOpenListPropertyModal,
}: NavbarProps) {
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const isAr = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectorsDropdownOpen, setSectorsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [cmsNavItems, setCmsNavItems] = useState<NavItem[] | null>(null);

  useEffect(() => {
    const unsub = subscribeNavigationDoc('header_realestate', (doc) => {
      if (doc && doc.items && doc.items.length > 0) {
        setCmsNavItems(doc.items.filter((i) => i.isVisible).sort((a, b) => a.order - b.order));
      } else {
        setCmsNavItems(null);
      }
    });
    return () => unsub();
  }, []);

  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'about', label: t.nav.about, icon: Info },
    { id: 'properties', label: t.nav.properties, icon: Building },
    { id: 'projects', label: t.nav.projects, icon: Layers },
    { id: 'marketing', label: t.nav.marketing, icon: Megaphone },
    { id: 'blog', label: t.nav.blog, icon: BookOpen },
    { id: 'contact', label: t.nav.contact, icon: Mail },
  ];

  const handleNavClick = (pageId: PageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    setSectorsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    onLanguageChange(nextLang);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Official HARD Brand Logo (Left) */}
          <a
            href="/realestate"
            onClick={(e) => handleSemanticClick(e, () => handleNavClick('home'))}
            className="cursor-pointer group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
            aria-label={language === 'ar' ? 'الرئيسية - هارد للعقارات' : 'HARD Real Estate Home'}
          >
            <BrandLogo size="md" language={language} variant="dark" />
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse" aria-label="Main Navigation">
            {cmsNavItems && cmsNavItems.length > 0
              ? cmsNavItems.map((item) => {
                  const label = item.label[language] || item.label.en || '';
                  const href = item.targetPath;
                  const isExternal = item.type === 'external';
                  return (
                    <a
                      key={item.id}
                      href={href}
                      target={isExternal || item.openInNewTab ? '_blank' : undefined}
                      rel={isExternal || item.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={(e) => {
                        if (!isExternal) {
                          const route = href.replace(/^\/realestate\/?/, '').replace(/^\//, '');
                          const mappedPage: PageId = (route as PageId) || 'home';
                          handleSemanticClick(e, () => handleNavClick(mappedPage));
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer select-none text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {label}
                    </a>
                  );
                })
              : navItems.map((item) => {
                  const isActive = currentPage === item.id;
                  const href = getPageHref(item.id);
                  return (
                    <a
                      key={item.id}
                      href={href}
                      onClick={(e) => handleSemanticClick(e, () => handleNavClick(item.id))}
                      aria-current={isActive ? 'page' : undefined}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? 'text-blue-700 bg-blue-50/80 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
          </nav>

          {/* Right Actions: Sectors Dropdown, Language Switcher, CTA Button */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Sectors Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSectorsDropdownOpen(!sectorsDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer"
                aria-expanded={sectorsDropdownOpen}
                aria-haspopup="true"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'قطاعات هارد' : 'Group Sectors'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    sectorsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {sectorsDropdownOpen && (
                <div className="absolute end-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
                  </div>
                  <div className="p-1.5 space-y-1">
                    {HARD_GROUP_SECTORS.map((sector) => {
                      const Icon = SECTOR_ICONS[sector.iconName] || Building2;
                      const isCurrent = sector.id === 'realestate';
                      return (
                        <a
                          key={sector.id}
                          href={sector.href}
                          onClick={(e) =>
                            handleSemanticClick(e, () => {
                              if (!isCurrent) handleNavClick(sector.pageId);
                              else setSectorsDropdownOpen(false);
                            })
                          }
                          aria-current={isCurrent ? 'page' : undefined}
                          className={`flex items-start gap-2.5 p-2 rounded-xl text-start transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCurrent ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs">{sector.name[language]}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                                  {isAr ? 'الحالي' : 'Active'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {sector.tagline[language]}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer"
              title={language === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Primary CTA: List Your Property */}
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenListPropertyModal}
              className="font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.listProperty}</span>
            </Button>
          </div>

          {/* Mobile Right Bar: Lang toggle + Burger Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 border border-slate-200"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Dedicated HARD Group Sectors Switcher */}
          <div className="bg-slate-900 rounded-2xl p-3 text-white space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
            </div>
            <div className="space-y-1">
              {HARD_GROUP_SECTORS.map((sector) => {
                const Icon = SECTOR_ICONS[sector.iconName] || Building2;
                const isCurrent = sector.id === 'realestate';
                return (
                  <a
                    key={sector.id}
                    href={sector.href}
                    onClick={(e) =>
                      handleSemanticClick(e, () => {
                        if (!isCurrent) onNavigate(sector.pageId);
                        setMobileMenuOpen(false);
                      })
                    }
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sector.name[language]}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 text-blue-200 uppercase font-extrabold">
                        {isAr ? 'القطاع الحالي' : 'Active'}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Real Estate Site Navigation */}
          <nav className="flex flex-col space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
              {isAr ? 'صفحات العقارات' : 'Real Estate Pages'}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon || Building2;
              const isActive = currentPage === item.id;
              const href = getPageHref(item.id);
              return (
                <a
                  key={item.id}
                  href={href}
                  onClick={(e) => handleSemanticClick(e, () => handleNavClick(item.id))}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenListPropertyModal();
              }}
              className="w-full justify-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.listProperty}</span>
            </Button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:+966556125711"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.nav.callUs}</span>
              </a>
              <a
                href="https://wa.me/966556125711"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.nav.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
