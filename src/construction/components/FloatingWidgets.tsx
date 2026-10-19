import React, { useState } from 'react';
import { MessageCircle, Calculator, X } from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';

export function FloatingWidgets() {
  const { language, openCostEstimator } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const handleWhatsAppSend = (template: string) => {
    const url = `https://wa.me/${COMPANY_CREDENTIALS.whatsapp.replace('+', '')}?text=${encodeURIComponent(template)}`;
    window.open(url, '_blank');
    setIsWhatsAppOpen(false);
  };

  return (
    <>
      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-6 end-6 z-40 flex flex-col gap-3 items-end">
        {/* WhatsApp Template Popup */}
        {isWhatsAppOpen && (
          <div className="w-72 bg-white border border-sky-100 rounded-2xl shadow-2xl p-4 text-start space-y-3 animate-in slide-in-from-bottom-5 text-slate-900 mb-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-[#0f243e]">
                  {isAr ? 'محادثة هارد للمقاولات' : 'HARD Contracting WhatsApp'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600">
              {isAr
                ? 'مرحباً بك! اختر نموذج الاستفسار للتحدث الفوري مع مهندسينا:'
                : 'Welcome! Select an inquiry template to chat directly with our engineers:'}
            </p>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleWhatsAppSend(
                    isAr
                      ? 'السلام عليكم، أرغب في استشارة هندسية وتسعير مشروع فيلا سكنية فاخرة.'
                      : 'Hello, I would like an engineering consultation for a luxury villa project.'
                  )
                }
                className="w-full text-start p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-[#009ee2] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {isAr ? '🏡 استفسار عن بناء فيلا / قصر' : '🏡 Residential Villa / Palace'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleWhatsAppSend(
                    isAr
                      ? 'السلام عليكم، نود طلب دراسة عروض أسعار لمشروع مبنى / برج تجاري.'
                      : 'Hello, we would like a commercial tower contracting proposal.'
                  )
                }
                className="w-full text-start p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-[#009ee2] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {isAr ? '🏢 تسعير مشروع تجاري / برج' : '🏢 Commercial Tower / Plaza'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleWhatsAppSend(
                    isAr
                      ? 'السلام عليكم، نود الاستفسار عن خدمات التشطيب الفندقي الفاخر والديكور.'
                      : 'Hello, I want to inquire about luxury interior fit-out services.'
                  )
                }
                className="w-full text-start p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-[#009ee2] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {isAr ? '✨ تشطيب وديكور فندقي فاخر' : '✨ Ultra-Luxury Fit-Out'}
              </button>
            </div>
          </div>
        )}

        {/* Cost Estimator Quick Launcher */}
        <button
          type="button"
          onClick={openCostEstimator}
          className="px-4 py-3 rounded-full bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-sky-500/20 hover:scale-105 transition-all cursor-pointer border border-sky-400/40"
          title={t.hero.ctaEstimate}
        >
          <Calculator className="w-4 h-4" />
          <span className="hidden sm:inline">{t.hero.ctaEstimate}</span>
        </button>

        {/* WhatsApp Floating Action Button */}
        <button
          type="button"
          onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
          className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-950/50 hover:scale-105 transition-all cursor-pointer relative"
          aria-label="WhatsApp Hotline"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-25"></span>
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
