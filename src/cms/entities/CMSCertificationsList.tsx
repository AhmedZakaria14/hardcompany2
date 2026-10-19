import React, { useState } from 'react';
import { Certification, SectorScope } from '../../types/businessEntities';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Lock,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface CMSCertificationsListProps {
  certifications: Certification[];
  onAddCertification: () => void;
  onEditCertification: (cert: Certification) => void;
  onDeleteCertification: (id: string) => void;
  onResetToDefaults: () => void;
  language: Language;
}

export const CMSCertificationsList: React.FC<CMSCertificationsListProps> = ({
  certifications,
  onAddCertification,
  onEditCertification,
  onDeleteCertification,
  onResetToDefaults,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorScope | 'all_filter'>('all_filter');

  const filtered = certifications.filter((item) => {
    const matchesSector =
      selectedSector === 'all_filter' || item.sector === selectedSector || item.sector === 'all';
    const matchesSearch =
      (item.title?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.issuer?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.issuer?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.credentialId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-600 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة الاعتمادات والشهادات الرسمية' : 'Certifications & Accreditations'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'إدارة التراخيص، شهادات الجودة ISO، واعتمادات الجهات الحكومية.'
              : 'Regulatory licenses, ISO quality certifications, and official authority compliance credentials.'}
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
            onClick={onAddCertification}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة اعتماد / شهادة' : 'Add Certification'}</span>
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
            placeholder={isAr ? 'ابحث باسم الشهادة أو الجهة المانحة...' : 'Search by title or issuer...'}
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

      {/* Certifications Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isAr ? 'لا توجد شهادات مطابقة للبحث' : 'No certifications found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      #{cert.order}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      {cert.sector}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      cert.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  {cert.image && (
                    <img
                      src={cert.image}
                      alt={getLocalizedText(cert.title, language)}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {getLocalizedText(cert.title, language)}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {getLocalizedText(cert.issuer, language)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {cert.credentialId && (
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">{isAr ? 'رقم الاعتماد:' : 'Credential ID:'}</span>
                      <strong className="text-slate-800">{cert.credentialId}</strong>
                    </div>
                  )}

                  {cert.issueDate && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isAr ? 'تاريخ الإصدار:' : 'Issued:'}</span>
                      <span className="text-slate-700 font-semibold">{cert.issueDate}</span>
                    </div>
                  )}
                </div>

                {/* Evidence vault badge */}
                {cert.verification?.internalEvidenceNotes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>{isAr ? 'دليل التدقيق الداخلي (حفظ سري)' : 'Internal Audit Evidence (Private Vault)'}</span>
                    </div>
                    <p className="line-clamp-2 text-slate-600 font-mono">
                      {cert.verification.internalEvidenceNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onEditCertification(cert)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(isAr ? 'حذف هذه الشهادة؟' : 'Delete this certification?')) {
                      onDeleteCertification(cert.id);
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
