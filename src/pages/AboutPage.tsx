import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Users2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { translations } from '../lib/translations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../lib/navigation';
import { ComplianceVerificationModal } from '../components/modals/ComplianceVerificationModal';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function AboutPage({ onNavigate, language }: AboutPageProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">{language === 'en' ? 'Who We Are' : 'عن شركتنا'}</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.about.pageTitle}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t.about.pageSubtitle}
        </p>
      </div>

      {/* Mission Section with visual card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            {t.about.missionTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.about.missionText}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => setIsComplianceModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{language === 'en' ? 'REGA Regulated Brokerage (View Audit)' : 'وساطة مرخصة رسمياً (عرض الاعتماد)'}</span>
            </button>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Award className="w-4 h-4 text-blue-600" />
              {language === 'en' ? 'Global Investor Network' : 'شبكة مستثمرين دولية'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            alt="HARD Headquarters"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Governance & Legal Identity Card */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {language === 'en' ? 'Verified Corporate Identity' : 'الهوية المؤسسية المعتمدة'}
            </span>
            <h3 className="text-2xl font-bold font-display-serif text-white">
              {language === 'en' ? 'HARD Real Estate Group (هارد للعقارات)' : 'مجموعة هارد العقارية'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsComplianceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>{language === 'en' ? 'View Official Licensing Audit' : 'عرض السجل والترخيص المعتمد'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? 'REGA Brokerage License' : 'ترخيص الهيئة العامة للعقار'}</span>
            <span className="font-mono font-bold text-slate-200">7200018492</span>
            <span className="text-[11px] text-emerald-400 block">{language === 'en' ? '✓ Active & Verified' : '✓ ساري ومعتمد'}</span>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? 'Commercial Registration (CR)' : 'السجل التجاري'}</span>
            <span className="font-mono font-bold text-slate-200">2051254311</span>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'Al Khobar, Eastern Province' : 'الخبر، المنطقة الشرقية'}</span>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? 'Headquarters' : 'المقر الرئيسي'}</span>
            <span className="font-bold text-slate-200">{language === 'en' ? 'Al Khobar, KSA' : 'الخبر، المملكة العربية السعودية'}</span>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'King Fahd Road District' : 'حي طريق الملك فهد'}</span>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? 'Core Jurisdiction' : 'نطاق العمل الرئيسي'}</span>
            <span className="font-bold text-slate-200">{language === 'en' ? 'Eastern Province & KSA' : 'المنطقة الشرقية والمملكة'}</span>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'Residential & Commercial' : 'سكني وتجاري وتطوير'}</span>
          </div>
        </div>

        {/* Executive Transparency Note */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3 text-xs text-slate-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">
              {language === 'en' ? 'Leadership Disclosure Standard:' : 'معيار الشفافية والإفصاح القيادي:'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'To maintain 100% compliance with client privacy standards and avoid fictional marketing claims, individual senior broker profiles and advisory team biographies are made available directly to registered clients upon signing a formal representation agreement.'
                : 'التزاماً بأعلى معايير الشفافية وسرية بيانات العملاء، يتم مشاركة السير الذاتية لفريق المستشارين والقيادات التنفيذية مباشرة مع العملاء عقب توقيع اتفاقيات التمثيل الرسمية.'}
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Our Core Brokerage Pillars' : 'أركان العمل والوساطة الأساسية'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'en' ? 'The foundational principles that guide every property transaction.' : 'المبادئ التوجيهية التي تحكم كل صفقة عقارية واستشارة نقدمها.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.about.values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm font-display-serif">
                0{idx + 1}
              </div>
              <h4 className="text-base font-bold text-slate-900 font-display-serif">
                {val.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-5 max-w-3xl mx-auto flex flex-col items-center">
        <BrandLogo size="lg" language={language} variant="light" />
        <h3 className="text-xl sm:text-2xl font-bold font-display-serif">
          {language === 'en' ? 'Ready to Work with HARD Real Estate?' : 'جاهز للبدء مع هارد للعقارات؟'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {language === 'en'
            ? 'Connect with a senior brokerage advisor today for tailored acquisition and listing solutions.'
            : 'تواصل مع أحد كبار مستشارينا اليوم للحصول على حلول شراء واستثمار مخصصة.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <a
            href={getPageHref('contact')}
            onClick={(e) => handleSemanticClick(e, () => onNavigate('contact'))}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-md"
          >
            <span>{t.cta.getInTouch}</span>
            <ArrowIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      <ComplianceVerificationModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        language={language}
        initialTab="licensing"
      />
    </div>
  );
}
