import React, { useState } from 'react';
import { OfficeLocation, SectorScope } from '../../types/businessEntities';
import { Language } from '../../types';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Clock,
  Building2,
  Crown,
} from 'lucide-react';

interface CMSOfficesListProps {
  offices: OfficeLocation[];
  onAddOffice: () => void;
  onEditOffice: (office: OfficeLocation) => void;
  onDeleteOffice: (id: string) => void;
  onResetToDefaults: () => void;
  language: Language;
}

export const CMSOfficesList: React.FC<CMSOfficesListProps> = ({
  offices,
  onAddOffice,
  onEditOffice,
  onDeleteOffice,
  onResetToDefaults,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorScope | 'all_filter'>('all_filter');

  const filtered = offices.filter((item) => {
    const matchesSector =
      selectedSector === 'all_filter' || item.sector === selectedSector || item.sector === 'all';
    const matchesSearch =
      (item.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city?.ar || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة الفروع والمقرات الرئيسية' : 'Office Locations & Headquarters'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'إدارة عناوين ومواقع فروع المجموعة في المملكة.'
              : 'Corporate office locations, regional hubs, and headquarters data.'}
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
            onClick={onAddOffice}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة فرع / مقر' : 'Add Office'}</span>
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
            placeholder={isAr ? 'ابحث باسم الفرع أو المدينة...' : 'Search offices or city...'}
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

      {/* Offices Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isAr ? 'لا توجد فروع مطابقة للبحث' : 'No office locations found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((office) => (
            <div
              key={office.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Office Image Banner */}
                <div className="h-40 relative bg-slate-900">
                  <img
                    src={office.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                    alt={isAr ? office.name.ar : office.name.en}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute top-3 start-3 flex items-center gap-1.5">
                    {office.isHeadquarters && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white font-bold text-[10px] backdrop-blur-md">
                      {isAr ? (office.city?.ar || office.city?.en || 'الخبر') : (office.city?.en || office.city?.ar || 'Khobar')}
                    </span>
                  </div>

                  <span
                    className={`absolute top-3 end-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      office.status === 'published'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {office.status}
                  </span>

                  <div className="absolute bottom-3 start-3 end-3 text-white">
                    <h3 className="text-sm font-bold truncate">
                      {isAr ? office.name.ar : office.name.en}
                    </h3>
                  </div>
                </div>

                {/* Office Info */}
                <div className="p-5 space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{isAr ? office.address.ar : office.address.en}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 font-semibold">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{office.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{office.email}</span>
                    </div>

                    {office.workingHours && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{isAr ? office.workingHours.ar : office.workingHours.en}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onEditOffice(office)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100/60 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(isAr ? 'حذف هذا الفرع؟' : 'Delete this office?')) {
                      onDeleteOffice(office.id);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100/60 rounded-xl transition-colors flex items-center gap-1.5"
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
