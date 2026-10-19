import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  ArrowUp,
  Building,
  Lock,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { HVACBrandLockup } from './HVACBrandLockup';
import { T, pick } from '../translations';
import { PageId } from '../../types';
import { handleSemanticClick } from '../../lib/navigation';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface HVACFooterProps {
  onNavigatePage?: (page: PageId) => void;
  onOpenCMS?: () => void;
}

export function HVACFooter({ onNavigatePage, onOpenCMS }: HVACFooterProps) {
  const { language, isAr } = useHVAC();
  const [isAdmin, setIsAdmin] = React.useState<boolean>(() => isAuthorizedAdmin());

  React.useEffect(() => {
    const checkAuth = () => setIsAdmin(isAuthorizedAdmin());
    checkAuth();
    window.addEventListener('cms-auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('cms-auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-8 text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1 (4 cols): Brand lockup, Description & Socials */}
          <div className="lg:col-span-4 space-y-4">
            <HVACBrandLockup size="md" />

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              {pick(T.footer.aboutText, language)}
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                {pick(T.footer.followUs, language)}
              </span>

              {/* ONLY TWO SOCIAL ICONS: Instagram & X (Twitter) as requested */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/hardgrp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HARD Group Instagram"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#E1306C] hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="https://x.com/HARDGRP"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HARD Group on X"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-black hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2 (3 cols): Quick Anchor Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">
              {pick(T.footer.quickLinks, language)}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#services" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.footer.servicesLink, language)}
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.nav.whyUs, language)}
                </a>
              </li>
              <li>
                <a href="#work" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.footer.galleryLink, language)}
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.footer.calcLink, language)}
                </a>
              </li>
              <li>
                <a href="#checklist" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.nav.checklist, language)}
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.nav.reviews, language)}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.nav.faq, language)}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#0EA5E9] transition-colors">
                  {pick(T.footer.contactLink, language)}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 (3 cols): HARD Group Divisions */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">
              {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {onNavigatePage && (
                <>
                  <li>
                    <a
                      href="/"
                      onClick={(e) => handleSemanticClick(e, () => onNavigatePage('portal'))}
                      className="hover:text-[#0EA5E9] transition-colors text-start cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <span>{isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/realestate"
                      onClick={(e) => handleSemanticClick(e, () => onNavigatePage('home'))}
                      className="hover:text-[#0EA5E9] transition-colors text-start cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                    >
                      <Building className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <span>{isAr ? 'هارد للعقارات' : 'HARD Real Estate'}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/construction"
                      onClick={(e) => handleSemanticClick(e, () => onNavigatePage('construction'))}
                      className="hover:text-[#0EA5E9] transition-colors text-start cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                    >
                      <Building className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <span>{isAr ? 'هارد للإنشاءات' : 'HARD Construction'}</span>
                    </a>
                  </li>
                  <li>
                    <span className="text-[#0EA5E9] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
                      <span>{isAr ? 'هارد لصيانة التكييف (القطاع الحالي)' : 'HARD HVAC Maintenance (Current)'}</span>
                    </span>
                  </li>
                </>
              )}

              {isAdmin && onOpenCMS && (
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenCMS}
                    className="text-slate-500 hover:text-slate-900 transition-colors text-start cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>{pick(T.nav.adminPanel, language)}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4 (3 cols): Contact Block */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">
              {pick(T.nav.contact, language)}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <a
                href="tel:+966550641000"
                className="flex items-center gap-2 hover:text-[#0EA5E9] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#F97316] shrink-0" />
                <bdi dir="ltr" className="font-semibold text-slate-800">
                  +966 55 064 1000
                </bdi>
              </a>

              <a
                href="mailto:info@hardgp.com"
                className="flex items-center gap-2 hover:text-[#0EA5E9] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <span>info@hardgp.com</span>
              </a>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {pick(T.contact.addressDesc, language)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{pick(T.footer.rights, language)}</p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-medium text-slate-600">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              {isAr ? 'قطاعات هارد:' : 'Sectors:'}
            </span>
            {onNavigatePage && (
              <>
                <a
                  href="/"
                  onClick={(e) => handleSemanticClick(e, () => onNavigatePage('portal'))}
                  className="hover:text-[#0EA5E9] transition-colors"
                >
                  {isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="/realestate"
                  onClick={(e) => handleSemanticClick(e, () => onNavigatePage('home'))}
                  className="hover:text-[#0EA5E9] transition-colors"
                >
                  {isAr ? 'هارد للعقارات' : 'HARD Real Estate'}
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="/construction"
                  onClick={(e) => handleSemanticClick(e, () => onNavigatePage('construction'))}
                  className="hover:text-[#0EA5E9] transition-colors"
                >
                  {isAr ? 'هارد للإنشاءات' : 'HARD Construction'}
                </a>
                <span className="text-slate-300">•</span>
                <span className="text-[#0EA5E9] font-bold">
                  {isAr ? 'هارد لصيانة التكييف (القطاع الحالي)' : 'HARD HVAC Maintenance (Current)'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
