import React, { useState } from 'react';
import {
  ShieldCheck,
  HardHat,
  Layers,
  Award,
  CheckCircle2,
  Cpu,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  Building2,
  Bookmark,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';

export function AboutSection() {
  const { language, companyContent } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const aboutTitle = isAr ? companyContent.aboutTitleAr : companyContent.aboutTitleEn;
  const aboutText = isAr ? companyContent.aboutTextAr : companyContent.aboutTextEn;
  const visionText = isAr ? companyContent.visionAr : companyContent.visionEn;
  const missionText = isAr ? companyContent.missionAr : companyContent.missionEn;

  const [activeTab, setActiveTab] = useState<'quality' | 'safety' | 'management'>('quality');

  return (
    <section id="about" className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#d0e9fa] text-[#009ee2] text-xs font-bold shadow-2xs">
            <Bookmark className="w-3.5 h-3.5 text-[#009ee2]" />
            <span>{isAr ? 'نبذة عن شركة هارد' : 'About HARD Contracting'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight leading-snug">
            {aboutTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            {aboutText}
          </p>
        </div>

        {/* Vision & Mission 2-Card Row matching image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision Card (Right in RTL) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#f8fafc] border border-sky-100 shadow-sm text-start space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#009ee2] text-white shadow-md shadow-[#009ee2]/20">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#009ee2] uppercase tracking-wider">
                  {isAr ? 'التطلعات المستقبلية' : 'Future Aspirations'}
                </div>
                <h3 className="text-xl font-black font-display-serif text-[#0f243e]">
                  {isAr ? 'رؤيتنا' : 'Our Vision'}
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {visionText}
            </p>
          </div>

          {/* Mission Card (Left in RTL) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#f8fafc] border border-sky-100 shadow-sm text-start space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#0f243e] text-white shadow-md">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {isAr ? 'الالتزام والهدف' : 'Commitment & Purpose'}
                </div>
                <h3 className="text-xl font-black font-display-serif text-[#0f243e]">
                  {isAr ? 'رسالتنا' : 'Our Mission'}
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {missionText}
            </p>
          </div>
        </div>

        {/* Interactive Tabbed Pillars (Quality, Safety, Management) */}
        <div className="bg-[#f8fafc] border border-sky-100/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-slate-200 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('quality')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'quality'
                  ? 'bg-[#009ee2] text-white shadow-md shadow-[#009ee2]/20'
                  : 'bg-white text-slate-700 hover:text-[#009ee2] hover:bg-sky-50 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.about.tabs.quality}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'safety'
                  ? 'bg-[#009ee2] text-white shadow-md shadow-[#009ee2]/20'
                  : 'bg-white text-slate-700 hover:text-[#009ee2] hover:bg-sky-50 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.about.tabs.safety}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('management')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'management'
                  ? 'bg-[#009ee2] text-white shadow-md shadow-[#009ee2]/20'
                  : 'bg-white text-slate-700 hover:text-[#009ee2] hover:bg-sky-50 border border-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{t.about.tabs.management}</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="text-start">
            {activeTab === 'quality' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#0f243e] font-display-serif">
                    {t.about.tabs.quality}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.about.qualityDesc}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'فحوصات كسر المكعبات الخرسانية (Cube Test) مع كل صبة موثقة' : 'Mandatory certified concrete cube break testing with every batch'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'استخدام حديد سابك واليمامة المعتمد مع شهادات المنشأ الأصلية' : '100% SABIC & Al-Yamamah certified high-yield reinforcement steel'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'اختبارات العزل المائي بالغمر لمدة ٧٢ ساعة قبل الدفن والتشطيب' : '72-hour hydrostatic ponding test for waterproofing membrane verification'}</span>
                    </li>
                  </ul>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-16/10 border border-sky-100 bg-slate-100 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
                    alt="Quality Inspection"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 start-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-bold text-[#009ee2] shadow-sm">
                    {isAr ? 'إشراف هندسي يومي موثق' : 'Daily Documented Supervision'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#0f243e] font-display-serif">
                    {t.about.tabs.safety}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.about.safetyDesc}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isAr ? 'صفر حوادث مهنية مع تدريب مستمر لمشرفي المواقع' : 'Zero-accident safety record with weekly certified site safety toolboxes'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isAr ? 'أنظمة حماية وسقالات معتمدة ومطابقة لاشتراطات الدفاع المدني' : 'Engineered safety scaffolding inspected and compliant with Civil Defense'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isAr ? 'التأمين الشامل على كافة العاملين ومواقع العمل (CAR Insurance)' : 'Comprehensive Contractors All Risks (CAR) insurance on all active sites'}</span>
                    </li>
                  </ul>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-16/10 border border-sky-100 bg-slate-100 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80"
                    alt="Safety Standards"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 start-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-bold text-emerald-600 shadow-sm">
                    {isAr ? 'شهادات السلامة المعتمدة' : 'Safety Compliant Certification'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#0f243e] font-display-serif">
                    {t.about.tabs.management}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.about.managementDesc}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'تقارير إلكترونية أسبوعية مع تتبع نسب الإنجاز بالصور والفيديو' : 'Weekly digital progress reports with HD photo/drone milestone tracking'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'نمذجة معلومات البناء 4D BIM لتفادي أي أخطاء أو تأخير زمني' : '4D BIM digital modeling eliminating costly clashes prior to site execution'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-[#009ee2] shrink-0" />
                      <span>{isAr ? 'إدارة مالية دقيقة تضمن عدم تجاوز ميزانية العقد المعتمدة' : 'Strict cost control and transparent milestone billing without hidden charges'}</span>
                    </li>
                  </ul>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-16/10 border border-sky-100 bg-slate-100 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"
                    alt="BIM Engineering"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 start-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-bold text-[#009ee2] shadow-sm">
                    {isAr ? 'إدارة مشاريع بنظام BIM المتطور' : '4D BIM Integrated Governance'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4-Step Milestone Process */}
        <div className="space-y-8 pt-4">
          <div className="text-start space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009ee2] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'منهجية العمل' : 'Execution Lifecycle'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display-serif text-[#0f243e]">
              {t.about.timelineTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.about.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 text-start space-y-3 relative group hover:border-[#009ee2] hover:shadow-md transition-all shadow-xs"
              >
                <div className="text-3xl font-black font-display-serif text-[#009ee2] group-hover:scale-105 transition-transform">
                  {step.num}
                </div>
                <h4 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
