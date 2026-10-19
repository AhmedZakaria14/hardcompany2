import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Instagram,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import { translations as defaultTranslations } from '../../lib/translations';
import { useTextOverride } from '../../context/TextOverrideContext';
import { useData } from '../../context/DataContext';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../../lib/navigation';
import { HARD_GROUP_SECTORS } from '../../lib/sectors';
import { isAuthorizedAdmin } from '../../lib/adminAuth';
import { ComplianceVerificationModal } from '../modals/ComplianceVerificationModal';
import { PrivacyTermsModal } from '../modals/PrivacyTermsModal';
import { SitemapModal } from '../modals/SitemapModal';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

const SECTOR_ICONS = {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
};

export function Footer({ onNavigate, language }: FooterProps) {
  const { translations } = useTextOverride();
  const { addSubscriber } = useData();
  const t = translations[language] || defaultTranslations[language];
  const isAr = language === 'ar';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyInitialTab, setPrivacyInitialTab] = useState<'privacy' | 'terms'>('privacy');
  const [isSitemapModalOpen, setIsSitemapModalOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthorizedAdmin());

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setLoading(true);
    setSubError('');
    try {
      await submitCustomerForm({
        formType: 'newsletter_signup',
        sector: 'group',
        name: newsletterEmail.split('@')[0],
        email: newsletterEmail.trim(),
        language,
        message: `Newsletter subscription via main website footer (${language.toUpperCase()})`,
        details: {
          source: 'Website Footer',
        },
      });
      await addSubscriber(newsletterEmail.trim(), 'Website Footer', `Subscribed via ${language.toUpperCase()} site`);
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setSubError(
        err?.message || (isAr
          ? 'تعذر تسليم الاشتراك حالياً. تم حفظ البريد المدخل، يرجى إعادة المحاولة.'
          : 'Subscription delivery failed. Your email is preserved. Please click retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (pageId: PageId) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-20">
      {/* 4-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand / Bio */}
          <div className="space-y-4">
            <a
              href="/realestate"
              onClick={(e) => handleSemanticClick(e, () => handleLinkClick('home'))}
              className="cursor-pointer group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
              aria-label={isAr ? 'الرئيسية - هارد للعقارات' : 'HARD Real Estate Home'}
            >
              <BrandLogo size="md" language={language} variant="light" />
            </a>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.brandBio}
            </p>

            <button
              type="button"
              onClick={() => setIsComplianceModalOpen(true)}
              className="pt-2 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer group text-start focus-visible:outline-none focus-visible:underline"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>
                {language === 'en'
                  ? 'Officially Licensed REGA Brokerage • View Audit'
                  : 'مؤسسة وساطة عقارية مرخصة رسمياً (عرض السجل)'}
              </span>
            </button>

            {/* Social handles */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/hardgrp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-slate-800/90 hover:border-pink-500/40 transition-all group shadow-xs"
                aria-label="Instagram"
                title="Instagram (@hardgrp)"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://x.com/HARDGRP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/90 hover:border-slate-600 transition-all group shadow-xs"
                aria-label="X / Twitter"
                title="X / Twitter (@HARDGRP)"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: HARD Group Sectors (Standardized Sector Navigation) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-ui-sans flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {HARD_GROUP_SECTORS.map((sector) => {
                const Icon = SECTOR_ICONS[sector.iconName] || Building2;
                const isCurrent = sector.id === 'realestate';
                return (
                  <li key={sector.id}>
                    <a
                      href={sector.href}
                      onClick={(e) =>
                        handleSemanticClick(e, () => {
                          if (!isCurrent) handleLinkClick(sector.pageId);
                        })
                      }
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-950/70 border-blue-800 text-blue-200 font-semibold'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isCurrent ? 'text-blue-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{sector.name[language]}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {isAr ? 'القطاع الحالي' : 'Current'}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">›</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Real Estate Sitemap */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-ui-sans">
              {isAr ? 'صفحات العقارات' : 'Real Estate Navigation'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { id: 'home', label: t.nav.home },
                { id: 'properties', label: t.nav.properties },
                { id: 'projects', label: t.nav.projects },
                { id: 'marketing', label: t.nav.marketing },
                { id: 'about', label: t.nav.about },
                { id: 'blog', label: t.nav.blog },
                { id: 'contact', label: t.nav.contact },
              ].map((link) => {
                const href = getPageHref(link.id as PageId);
                return (
                  <li key={link.id}>
                    <a
                      href={href}
                      onClick={(e) => handleSemanticClick(e, () => handleLinkClick(link.id as PageId))}
                      className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300 focus-visible:outline-none focus-visible:underline py-0.5"
                    >
                      <span className="text-blue-500 opacity-60">›</span>
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Legal & Sitemap Controls */}
            <div className="pt-3 border-t border-slate-900/80 space-y-1.5 text-xs">
              <a
                href="/realestate/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyInitialTab('privacy');
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-blue-400 text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <span className="text-slate-600">•</span>
                <span>{t.footer.privacy}</span>
              </a>

              <a
                href="/realestate/terms"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyInitialTab('terms');
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-blue-400 text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <span className="text-slate-600">•</span>
                <span>{t.footer.terms}</span>
              </a>

              <a
                href="/realestate/sitemap"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSitemapModalOpen(true);
                }}
                className="hover:text-blue-400 text-slate-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <span className="text-blue-400">•</span>
                <span>{t.footer.sitemap} (HTML)</span>
              </a>
            </div>
          </div>

          {/* Column 4: Contact & Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-ui-sans">
              {t.footer.contactInfo}
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300 pb-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {language === 'en'
                    ? 'Prince Mutaib Road, Hajr Dist., Dammam, KSA'
                    : 'طريق الأمير متعب، حي هجر، الدمام، السعودية'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="tel:+966556125711"
                  dir="ltr"
                  className="hover:text-blue-400 transition-colors font-medium text-left"
                >
                  <bdi dir="ltr">+966 55 612 5711</bdi>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="mailto:info@hardgp.com"
                  dir="ltr"
                  className="hover:text-blue-400 transition-colors"
                >
                  info@hardgp.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/966556125711"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-left"
                >
                  <bdi dir="ltr">+966 55 612 5711</bdi>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-ui-sans">
                {t.footer.newsletterTitle}
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                {t.footer.newsletterSubtitle}
              </p>

              {subscribed ? (
                <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-blue-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'en' ? 'Subscribed' : 'تم الاشتراك'}</span>
                  </div>
                  <p className="text-[11px]">{t.footer.newsletterSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  {subError && (
                    <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-[11px] leading-relaxed animate-in fade-in">
                      <p>{subError}</p>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder={t.footer.newsletterPlaceholder}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                    className="w-full justify-center text-xs py-2"
                  >
                    <span>{t.footer.newsletterButton}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar with Direct Legal & Cross-Sector Links */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
            <p>{t.footer.copyright}</p>
            <span className="hidden sm:inline text-slate-800">•</span>
            {/* Legal Links */}
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <a
                href="/realestate/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyInitialTab('privacy');
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                {t.footer.privacy}
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/realestate/terms"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyInitialTab('terms');
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                {t.footer.terms}
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/realestate/sitemap"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSitemapModalOpen(true);
                }}
                className="hover:text-blue-400 font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                {t.footer.sitemap}
              </a>
            </div>
          </div>

          {/* Standardized Direct Sector Destination Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-medium text-slate-400">
            <span className="text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              {isAr ? 'قطاعات هارد:' : 'Sectors:'}
            </span>
            <a
              href="/"
              onClick={(e) => handleSemanticClick(e, () => handleLinkClick('portal'))}
              className="hover:text-blue-400 transition-colors"
            >
              {isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-blue-400 font-bold">
              {isAr ? 'هارد للعقارات (القطاع الحالي)' : 'HARD Real Estate (Current)'}
            </span>
            <span className="text-slate-700">•</span>
            <a
              href="/construction"
              onClick={(e) => handleSemanticClick(e, () => handleLinkClick('construction'))}
              className="hover:text-blue-400 transition-colors"
            >
              {isAr ? 'هارد للإنشاءات' : 'HARD Construction'}
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="/hvac"
              onClick={(e) => handleSemanticClick(e, () => handleLinkClick('hvac'))}
              className="hover:text-blue-400 transition-colors font-medium text-slate-300"
            >
              {isAr ? 'هارد لصيانة التكييف' : 'HARD HVAC Maintenance'}
            </a>
            {isAdmin && (
              <>
                <span className="text-slate-700">•</span>
                <a
                  href="/realestate/admin"
                  onClick={(e) => handleSemanticClick(e, () => handleLinkClick('admin'))}
                  className="hover:text-blue-400 font-semibold inline-flex items-center gap-1 text-slate-400 transition-colors"
                  title="Admin CMS Portal"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>{language === 'en' ? 'Admin CMS' : 'بوابة الإدارة (CMS)'}</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <ComplianceVerificationModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        language={language}
        initialTab="licensing"
      />

      <PrivacyTermsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        language={language}
        initialTab={privacyInitialTab}
      />

      <SitemapModal
        isOpen={isSitemapModalOpen}
        onClose={() => setIsSitemapModalOpen(false)}
        language={language}
        onNavigate={onNavigate}
      />
    </footer>
  );
}
