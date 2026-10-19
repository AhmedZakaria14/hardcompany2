import React, { useState } from 'react';
import { PartnerBrand, SectorScope } from '../../types/businessEntities';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface CMSPartnersListProps {
  partners: PartnerBrand[];
  onAddPartner: () => void;
  onEditPartner: (partner: PartnerBrand) => void;
  onDeletePartner: (id: string) => void;
  onResetToDefaults: () => void;
  language: Language;
}

export const CMSPartnersList: React.FC<CMSPartnersListProps> = ({
  partners,
  onAddPartner,
  onEditPartner,
  onDeletePartner,
  onResetToDefaults,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorScope | 'all_filter'>('all_filter');

  const filtered = partners.filter((item) => {
    const matchesSector =
      selectedSector === 'all_filter' || item.sector === selectedSector || item.sector === 'all';
    const matchesSearch =
      (item.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name?.ar || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-600/10 text-teal-600 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة الشركاء والعلامات الشريكة' : 'Partners & Brand Alliances'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'إدارة شعارات الشركاء الاستراتيجيين والموردين المعتمدين.'
              : 'Strategic partners, enterprise vendors, and official brand alliances.'}
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
            onClick={onAddPartner}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة شريك' : 'Add Partner'}</span>
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
            placeholder={isAr ? 'ابحث باسم الشريك...' : 'Search partners...'}
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

      {/* Partners Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No partners found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-center"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    #{partner.order}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {partner.sector}
                  </span>
                </div>

                <div className="h-20 flex items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                  <img
                    src={partner.logoUrl}
                    alt={getLocalizedText(partner.name, language)}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {getLocalizedText(partner.name, language)}
                </h3>

                {partner.category && (
                  <p className="text-xs text-slate-500 truncate">
                    {getLocalizedText(partner.category, language)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onEditPartner(partner)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(isAr ? 'حذف هذا الشريك؟' : 'Delete this partner?')) {
                      onDeletePartner(partner.id);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
