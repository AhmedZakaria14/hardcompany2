import React from 'react';
import {
  HardHat,
  ShieldCheck,
  Award,
  Lock,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';
import { handleSemanticClick } from '../../lib/navigation';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface FooterProps {
  onNavigate?: (page: any) => void;
  onOpenCMS?: () => void;
}

export function Footer({ onNavigate, onOpenCMS }: FooterProps) {
  const { language, toggleLanguage, openCostEstimator, openQuoteModal } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';

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
    <footer className="bg-[#0b1b2d] text-slate-400 border-t border-slate-800 text-xs">
      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-start">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="HARD Group"
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="font-display-serif font-black text-base text-white">
                {isAr ? 'هارد للمقاولات العامة' : 'HARD Contracting Co.'}
              </div>
              <div className="text-[10px] text-[#009ee2] font-bold">
                {isAr ? 'قطاع الهندسة والإنشاءات' : 'Engineering & Construction'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {t.brand.tagline}. {t.brand.slogan}.
          </p>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div>{t.credentials.cr}</div>
            <div>{isAr ? 'الرقم الضريبي: ' : 'Tax ID: '} {COMPANY_CREDENTIALS.taxId}</div>
          </div>
        </div>

        {/* Col 2: Quick Links & Group Sectors */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display-serif">
              {isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    handleSemanticClick(e, () => {
                      if (onNavigate) onNavigate('portal');
                    });
                  }}
                  className="hover:text-[#009ee2] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span>
                  <span>{isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}</span>
                </a>
              </li>
              <li>
                <a
                  href="/realestate"
                  onClick={(e) => {
                    handleSemanticClick(e, () => {
                      if (onNavigate) onNavigate('home');
                    });
                  }}
                  className="hover:text-[#009ee2] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span>
                  <span>{isAr ? 'هارد للعقارات' : 'HARD Real Estate'}</span>
                </a>
              </li>
              <li>
                <span className="text-[#009ee2] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009ee2]" />
                  <span>{isAr ? 'هارد للإنشاءات (القطاع الحالي)' : 'HARD Construction (Current)'}</span>
                </span>
              </li>
              <li>
                <a
                  href="/hvac"
                  onClick={(e) => {
                    handleSemanticClick(e, () => {
                      if (onNavigate) onNavigate('hvac');
                    });
                  }}
                  className="hover:text-[#009ee2] transition-colors flex items-center gap-1.5 font-medium text-slate-300"
                >
                  <span className="text-slate-500">›</span>
                  <span>{isAr ? 'هارد لصيانة التكييف' : 'HARD HVAC Maintenance'}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white font-display-serif">
              {isAr ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#home" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.projects}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.services}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCostEstimator}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  {t.nav.calculator}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openQuoteModal()}
                  className="text-[#009ee2] hover:text-sky-300 font-bold cursor-pointer"
                >
                  {t.nav.requestQuote}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Col 3: Accreditations */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? 'الاعتمادات والضمانات' : 'Credentials & Codes'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{t.credentials.classA}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.credentials.sbc}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.credentials.warranty}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <HardHat className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{t.credentials.sce}</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Language */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? 'التواصل المباشر' : 'Direct Support'}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a
                href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                className="hover:text-[#009ee2] dir-ltr text-start font-semibold text-slate-200"
              >
                {COMPANY_CREDENTIALS.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-[#009ee2] text-slate-200">
                {COMPANY_CREDENTIALS.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{isAr ? 'الرياض - حي الصحافة' : 'Riyadh - Al Sahafa'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#009ee2]" />
              <span>{language === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
            </button>

            {isAdmin && onOpenCMS && (
              <button
                type="button"
                onClick={onOpenCMS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-700 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.nav.cms}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Footer Copyright */}
      <div className="border-t border-slate-900 py-6 bg-[#071320]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} {isAr ? 'شركة هارد للمقاولات العامة والإنشاءات. جميع الحقوق محفوظة.' : 'HARD Contracting Co. All rights reserved.'}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-medium">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {isAr ? 'قطاعات هارد:' : 'Sectors:'}
            </span>
            <a
              href="/"
              onClick={(e) => {
                handleSemanticClick(e, () => {
                  if (onNavigate) onNavigate('portal');
                });
              }}
              className="hover:text-[#009ee2] transition-colors"
            >
              {isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="/realestate"
              onClick={(e) => {
                handleSemanticClick(e, () => {
                  if (onNavigate) onNavigate('home');
                });
              }}
              className="hover:text-[#009ee2] transition-colors"
            >
              {isAr ? 'هارد للعقارات' : 'HARD Real Estate'}
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-[#009ee2] font-bold">
              {isAr ? 'هارد للإنشاءات (القطاع الحالي)' : 'HARD Construction (Current)'}
            </span>
            <span className="text-slate-700">•</span>
            <a
              href="/hvac"
              onClick={(e) => {
                handleSemanticClick(e, () => {
                  if (onNavigate) onNavigate('hvac');
                });
              }}
              className="hover:text-[#009ee2] transition-colors"
            >
              {isAr ? 'هارد لصيانة التكييف' : 'HARD HVAC Maintenance'}
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold">{isAr ? 'معتمد رسمياً في المملكة' : 'Certified in KSA'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
