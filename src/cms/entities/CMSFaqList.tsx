import React, { useState } from 'react';
import { FaqEntity, SectorScope } from '../../types/businessEntities';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CMSFaqListProps {
  faqs: FaqEntity[];
  onAddFaq: () => void;
  onEditFaq: (faq: FaqEntity) => void;
  onDeleteFaq: (id: string) => void;
  onResetToDefaults: () => void;
  language: Language;
}

export const CMSFaqList: React.FC<CMSFaqListProps> = ({
  faqs,
  onAddFaq,
  onEditFaq,
  onDeleteFaq,
  onResetToDefaults,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorScope | 'all_filter'>('all_filter');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = faqs.filter((item) => {
    const matchesSector =
      selectedSector === 'all_filter' || item.sector === selectedSector || item.sector === 'all';
    const matchesSearch =
      (item.question?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.question?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.answer?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.answer?.ar || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-600/10 text-sky-600 font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة الأسئلة الشائعة (FAQs)' : 'Frequently Asked Questions (FAQs)'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'مكتبة الأسئلة الموحدة والإجابات المعتمدة لكل قطاع.'
              : 'Centralized FAQ repository mapped across sectors and page section references.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetToDefaults}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {isAr ? 'عادة ضبط الافتراضي' : 'Reset Defaults'}
          </button>
          <button
            onClick={onAddFaq}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة سؤال جديد' : 'Add FAQ'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث بالسؤال أو الإجابة...' : 'Search questions or answers...'}
            className="w-full ps-10 pe-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as any)}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="all_filter">{isAr ? 'جميع القطاعات' : 'All Sectors'}</option>
            <option value="realestate">{isAr ? 'قطاع العقارات' : 'Real Estate'}</option>
            <option value="construction">{isAr ? 'قطاع المقاولات' : 'Construction'}</option>
            <option value="hvac">{isAr ? 'قطاع التكييف' : 'HVAC'}</option>
            <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
          </select>
        </div>
      </div>

      {/* FAQ Accordion / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isAr ? 'لا توجد أسئلة تطابق البحث' : 'No FAQ items found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-blue-600 font-mono shrink-0">
                      #{faq.order}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase shrink-0">
                      {faq.sector}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {getLocalizedText(faq.question, language)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        faq.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {faq.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p>{isAr ? faq.answer.ar : faq.answer.en}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isAr ? 'التصنيف:' : 'Category:'}{' '}
                        <strong className="text-slate-700 font-bold">
                          {isAr ? faq.category?.ar : faq.category?.en}
                        </strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditFaq(faq)}
                          className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100/60 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تعديل' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(isAr ? 'حذف هذا السؤال؟' : 'Delete this FAQ item?')) {
                              onDeleteFaq(faq.id);
                            }
                          }}
                          className="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100/60 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
