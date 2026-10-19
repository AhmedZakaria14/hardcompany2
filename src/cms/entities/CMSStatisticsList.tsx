import React, { useState } from 'react';
import { BusinessStatistic, SectorScope } from '../../types/businessEntities';
import { Language } from '../../types';
import {
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface CMSStatisticsListProps {
  statistics: BusinessStatistic[];
  onAddStatistic: () => void;
  onEditStatistic: (stat: BusinessStatistic) => void;
  onDeleteStatistic: (id: string) => void;
  onResetToDefaults: () => void;
  language: Language;
}

export const CMSStatisticsList: React.FC<CMSStatisticsListProps> = ({
  statistics,
  onAddStatistic,
  onEditStatistic,
  onDeleteStatistic,
  onResetToDefaults,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorScope | 'all_filter'>('all_filter');

  const filtered = statistics.filter((item) => {
    const matchesSector =
      selectedSector === 'all_filter' || item.sector === selectedSector || item.sector === 'all';
    const matchesSearch =
      (item.value || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.label?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.label?.ar || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة الأرقام والمؤشرات الإحصائية' : 'Key Business Metrics & Claims'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'إدارة الأرقام والإحصائيات وأدلة التدقيق المالي والإنجازات.'
              : 'Enterprise metric claims, financial volume figures, and audit evidence.'}
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
            onClick={onAddStatistic}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مؤشر إحصائي' : 'Add Metric'}</span>
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
            placeholder={isAr ? 'ابحث بالقيمة أو عنوان الإحصائية...' : 'Search by value or label...'}
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

      {/* Statistics Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isAr ? 'لا توجد إحصائيات مطابقة للبحث' : 'No metrics found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      #{stat.order}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      {stat.sector}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      stat.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {stat.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-2xl font-black font-mono text-emerald-600 block">
                    {stat.value}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {isAr ? stat.label.ar : stat.label.en}
                  </h3>
                  {stat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {isAr ? stat.description.ar : stat.description.en}
                    </p>
                  )}
                </div>

                {/* Audit Evidence Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  {stat.verification?.isVerified ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{stat.verification.verifierName || (isAr ? 'مدقق مالياً' : 'Audited Claim')}</span>
                      {stat.verification.verificationId && (
                        <span className="text-[10px] text-slate-500 font-mono ms-auto">
                          [{stat.verification.verificationId}]
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {isAr ? 'غير مدقق مستقلاً' : 'Self-Reported Claim'}
                    </div>
                  )}

                  {stat.verification?.internalEvidenceNotes && (
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-start gap-1.5 text-[10px] text-slate-600 font-mono">
                      <Lock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {stat.verification.internalEvidenceNotes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onEditStatistic(stat)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(isAr ? 'حذف هذا المؤشر؟' : 'Delete this metric?')) {
                      onDeleteStatistic(stat.id);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
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
