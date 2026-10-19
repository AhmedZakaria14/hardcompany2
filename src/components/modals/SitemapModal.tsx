import React from 'react';
import { Modal } from '../ui/Modal';
import {
  Map,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  Compass,
  FileText,
  Building,
  Layers,
  Phone,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Language, PageId, Property, Project } from '../../types';
import { translations } from '../../lib/translations';
import { useData } from '../../context/DataContext';
import { HARD_GROUP_SECTORS } from '../../lib/sectors';
import { getPageHref } from '../../lib/navigation';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigate: (page: PageId) => void;
  onSelectProperty?: (property: Property) => void;
}

export function SitemapModal({
  isOpen,
  onClose,
  language,
  onNavigate,
  onSelectProperty,
}: SitemapModalProps) {
  const isAr = language === 'ar';
  const t = translations[language];
  const { properties, projects } = useData();

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

  const handleLinkClick = (pageId: PageId) => {
    onClose();
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertyClick = (property: Property) => {
    onClose();
    if (onSelectProperty) {
      onSelectProperty(property);
    } else {
      onNavigate('property-details');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'خريطة الموقع الكاملة (HTML Sitemap)' : 'HTML Master Sitemap'}
      maxWidth="xl"
    >
      <div className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header Summary */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <Map className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {isAr ? 'خريطة التنقل المباشر للمجموعة:' : 'Complete Sector & Route Navigation:'}
            </span>
            <p className="text-blue-800 text-xs">
              {isAr
                ? 'تتيح هذه الخريطة الوصول المباشر لكافة قطاعات مجموعة هارد، صفحات العقارات الرئيسية، أحدث المشاريع التطويرية، والعقارات الفاخرة المتاحة للبيع والإيجار.'
                : 'This HTML sitemap provides direct, accessible links to all HARD Group corporate divisions, real estate search indexes, major developments, and featured active property listings.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm max-h-[65vh] overflow-y-auto pe-2">
          {/* SECTION 1: HARD Group Corporate Sectors */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 font-display-serif text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{isAr ? '1. قطاعات مجموعة هارد' : '1. HARD Group Corporate Sectors'}</span>
            </h3>
            <ul className="space-y-2">
              {HARD_GROUP_SECTORS.map((sector) => (
                <li key={sector.id}>
                  <a
                    href={sector.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(sector.pageId);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-colors text-slate-800 hover:text-blue-900 group"
                  >
                    <div className="flex items-center gap-2.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{sector.name[language]}</span>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-blue-600 font-mono">
                      {sector.href}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: Real Estate Main Pages */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 font-display-serif text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>{isAr ? '2. الصفحات الرئيسية للعقارات' : '2. Real Estate Main Pages'}</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'home', label: t.nav.home, href: '/realestate' },
                { id: 'properties', label: t.nav.properties, href: '/realestate/properties' },
                { id: 'projects', label: t.nav.projects, href: '/realestate/projects' },
                { id: 'marketing', label: t.nav.marketing, href: '/realestate/marketing' },
                { id: 'about', label: t.nav.about, href: '/realestate/about' },
                { id: 'blog', label: t.nav.blog, href: '/realestate/blog' },
                { id: 'contact', label: t.nav.contact, href: '/realestate/contact' },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.id as PageId);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-900 transition-colors"
                  >
                    <ChevronRight className={`w-3.5 h-3.5 text-blue-500 ${isAr ? 'rotate-180' : ''}`} />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: Featured Active Properties */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-bold text-slate-900 font-display-serif text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>
                {isAr ? `3. العقارات الفاخرة النشطة (${properties.length})` : `3. Featured Active Properties (${properties.length})`}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  type="button"
                  onClick={() => handlePropertyClick(prop)}
                  className="text-start p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-1 text-xs">
                    {prop.title[language]}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                    <span>{prop.location.city[language]}</span>
                    <span className="font-bold text-blue-700">{prop.price.formattedSAR}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: Major Off-Plan Projects */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-bold text-slate-900 font-display-serif text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                {isAr ? `4. المشاريع الكبرى والإطلاقات (${projects.length})` : `4. Major Master Developments (${projects.length})`}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => handleLinkClick('projects')}
                  className="text-start p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-1 text-xs">
                    {proj.title[language]}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{proj.location[language]}</span>
                    <span className="text-emerald-700 font-bold">{proj.startingPriceSAR}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Executive Admin & Verification Portals */}
          {isAdmin && (
            <div className="space-y-3 md:col-span-2">
              <h3 className="font-bold text-slate-900 font-display-serif text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '5. البوابات الإدارية والاعتمادات' : '5. Admin Portals & Regulatory Audits'}</span>
              </h3>
              <div className="flex flex-wrap gap-3 text-xs">
                <a
                  href="/realestate/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('admin');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>{isAr ? 'بوابة إدارة المحتوى (CMS Portal)' : 'Executive CMS Admin Portal'}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق الخريطة' : 'Close Sitemap'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
