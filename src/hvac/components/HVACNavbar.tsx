import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Globe,
  Calendar,
  Menu,
  X,
  Layers,
  Wrench,
  ShieldCheck,
  Star,
  HelpCircle,
  Mail,
  Calculator,
  ListChecks,
  Lock,
  ChevronDown,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
} from 'lucide-react';

const SECTOR_ICONS = {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
};
import { useHVAC } from '../context/HVACContext';
import { HVACBrandLockup } from './HVACBrandLockup';
import { T, pick } from '../translations';
import { PageId } from '../../types';
import { handleSemanticClick } from '../../lib/navigation';
import { HARD_GROUP_SECTORS, SectorId } from '../../lib/sectors';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface HVACNavbarProps {
  onNavigatePage?: (page: PageId) => void;
  onOpenCMS?: () => void;
}

export function HVACNavbar({ onNavigatePage, onOpenCMS }: HVACNavbarProps) {
  const { language, isAr, toggleLanguage, openBookingModal } = useHVAC();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sectorDropdownRef.current &&
        !sectorDropdownRef.current.contains(event.target as Node)
      ) {
        setSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSectorId: SectorId = 'hvac';

  const navLinks = [
    { href: '#services', label: pick(T.nav.services, language), icon: Wrench },
    { href: '#why-us', label: pick(T.nav.whyUs, language), icon: ShieldCheck },
    { href: '#work', label: pick(T.nav.work, language), icon: Layers },
    { href: '#calculator', label: pick(T.nav.calculator, language), icon: Calculator },
    { href: '#checklist', label: pick(T.nav.checklist, language), icon: ListChecks },
    { href: '#reviews', label: pick(T.nav.reviews, language), icon: Star },
    { href: '#faq', label: pick(T.nav.faq, language), icon: HelpCircle },
    { href: '#contact', label: pick(T.nav.contact, language), icon: Mail },
  ];

  return (
    <header
      className={`sticky top-[37px] z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Lockup & Logo */}
        <div className="flex items-center gap-4">
          <a
            href="#hero"
            className="flex items-center focus:outline-none cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <HVACBrandLockup size="md" />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          {navLinks.slice(0, 5).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#0EA5E9] transition-colors py-1 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#reviews"
            className="hover:text-[#0EA5E9] transition-colors py-1 cursor-pointer"
          >
            {pick(T.nav.reviews, language)}
          </a>
          <a
            href="#contact"
            className="hover:text-[#0EA5E9] transition-colors py-1 cursor-pointer"
          >
            {pick(T.nav.contact, language)}
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Orange outlined "Call 24/7" pill */}
          <a
            href="tel:+966550641000"
            className="px-3.5 py-2 rounded-full border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>{pick(T.nav.callPill, language)}</span>
          </a>

          {/* Language toggle: globe icon showing the other language */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-4 h-4 text-[#0EA5E9]" />
            <span className="font-semibold">{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Cyan "Book Service Now" button */}
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{pick(T.nav.bookServiceBtn, language)}</span>
          </button>

          {/* Sector Switcher Dropdown */}
          <div className="relative" ref={sectorDropdownRef}>
            <button
              type="button"
              onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#0EA5E9]" />
              <span>{isAr ? 'قطاعات هارد' : 'HARD Sectors'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {sectorDropdownOpen && (
              <div
                className={`absolute top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-slate-200 text-xs animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isAr ? 'left-0' : 'right-0'
                }`}
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
                </div>
                {HARD_GROUP_SECTORS.map((sector) => {
                  const isCurrent = sector.id === currentSectorId;
                  const SectorIcon = SECTOR_ICONS[sector.iconName] || ThermometerSnowflake;
                  return (
                    <a
                      key={sector.id}
                      href={sector.href}
                      onClick={(e) =>
                        handleSemanticClick(e, () => {
                          setSectorDropdownOpen(false);
                          if (!isCurrent && onNavigatePage) {
                            onNavigatePage(sector.pageId);
                          }
                        })
                      }
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0EA5E9] text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <SectorIcon className="w-4 h-4" />
                        <span>{sector.name[language]}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-sky-200 font-extrabold">
                          {isAr ? 'القطاع الحالي' : 'Active'}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {isAdmin && onOpenCMS && (
            <button
              type="button"
              onClick={onOpenCMS}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              title={pick(T.nav.adminPanel, language)}
            >
              <Lock className="w-4 h-4 text-slate-700" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1"
          >
            <Globe className="w-4 h-4 text-[#0EA5E9]" />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
          {/* HARD Group Sector Navigation */}
          <div className="bg-slate-900 rounded-2xl p-3 text-white space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {HARD_GROUP_SECTORS.map((sector) => {
                const isCurrent = sector.id === currentSectorId;
                const SectorIcon = SECTOR_ICONS[sector.iconName] || ThermometerSnowflake;
                return (
                  <a
                    key={sector.id}
                    href={sector.href}
                    onClick={(e) =>
                      handleSemanticClick(e, () => {
                        setMobileMenuOpen(false);
                        if (!isCurrent && onNavigatePage) {
                          onNavigatePage(sector.pageId);
                        }
                      })
                    }
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0EA5E9] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SectorIcon className="w-4 h-4 text-sky-400" />
                      <span>{sector.name[language]}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-sky-200 font-extrabold">
                        {isAr ? 'القطاع الحالي' : 'Active'}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          <nav className="flex flex-col space-y-2 text-start">
            {navLinks.map((link) => {
              const Icon = link.icon || ThermometerSnowflake;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-sm font-medium"
                >
                  <Icon className="w-4 h-4 text-[#0EA5E9]" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:+966550641000"
              className="w-full py-2.5 rounded-xl border-2 border-[#F97316] text-[#F97316] font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{pick(T.nav.callPill, language)}</span>
              <bdi dir="ltr">+966 55 064 1000</bdi>
            </a>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full py-2.5 rounded-xl bg-[#0EA5E9] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>{pick(T.nav.bookServiceBtn, language)}</span>
            </button>

            {onNavigatePage && (
              <a
                href="/"
                onClick={(e) => {
                  handleSemanticClick(e, () => {
                    setMobileMenuOpen(false);
                    onNavigatePage('portal');
                  });
                }}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{pick(T.nav.portalBack, language)}</span>
              </a>
            )}

            {isAdmin && onOpenCMS && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCMS();
                }}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{pick(T.nav.adminPanel, language)}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
