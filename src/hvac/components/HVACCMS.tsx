import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Users,
  Wrench,
  Image as ImageIcon,
  Star,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Eye,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';
import { HVACLead, HVACLeadStatus, HVACService, HVACGalleryItem, HVACTestimonial } from '../types';

interface HVACCMSProps {
  onExit: () => void;
}

export function HVACCMS({ onExit }: HVACCMSProps) {
  const {
    language,
    isAr,
    leads,
    updateLeadStatus,
    deleteLead,
    services,
    addService,
    updateService,
    deleteService,
    serviceAreas,
    updateServiceAreas,
    heroContent,
    updateHeroContent,
    operatingHours,
    updateOperatingHours,
    bookingCopy,
    updateBookingCopy,
    galleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetAllToDefaults,
  } = useHVAC();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'leads' | 'services' | 'service_areas' | 'hero_booking' | 'portfolio' | 'testimonials' | 'hours_contact' | 'gallery' | 'reviews'
  >('leads');

  // Form states
  const [heroForm, setHeroForm] = useState(heroContent);
  const [hoursForm, setHoursForm] = useState(operatingHours);
  const [bookingForm, setBookingForm] = useState(bookingCopy);
  const [areasForm, setAreasForm] = useState(serviceAreas);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    setHeroForm(heroContent);
  }, [heroContent]);

  useEffect(() => {
    setHoursForm(operatingHours);
  }, [operatingHours]);

  useEffect(() => {
    setBookingForm(bookingCopy);
  }, [bookingCopy]);

  useEffect(() => {
    setAreasForm(serviceAreas);
  }, [serviceAreas]);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === '2026' || pinInput.trim() === 'admin' || pinInput === '0000') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleInstantUnlock = () => {
    setPinInput('2026');
    setIsAuthenticated(true);
    setPinError(false);
  };

  // Export Leads to CSV
  const handleExportLeadsCSV = () => {
    const headers = [
      'RefNumber',
      'ClientName',
      'PhoneNumber',
      'Email',
      'City',
      'Service',
      'Date',
      'Status',
      'IsUrgent',
      'Notes',
    ];

    const rows = leads.map((l) => [
      `"${l.referenceNumber}"`,
      `"${l.clientName}"`,
      `"${l.phoneNumber}"`,
      `"${l.email || ''}"`,
      `"${l.city}"`,
      `"${l.service}"`,
      `"${l.createdAt}"`,
      `"${l.status}"`,
      `"${l.isUrgent ? 'YES' : 'NO'}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HARD_HVAC_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Service Active
  const handleToggleService = (id: string) => {
    const target = services.find((s) => s.id === id);
    if (target) {
      updateService(id, { active: !target.active });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">
              {pick(T.cms.authTitle, language)}
            </h2>
            <p className="text-xs text-slate-400">
              {pick(T.cms.pinPrompt, language)}
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="2026"
                className="w-full ps-11 pe-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                {isAr ? 'رمز الدخول غير صحيح (جرب 2026)' : 'Invalid PIN code (Try 2026)'}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {pick(T.cms.unlockBtn, language)}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-700/60 space-y-2">
            <button
              type="button"
              onClick={handleInstantUnlock}
              className="w-full py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
            >
              {pick(T.cms.instantUnlock, language)}
            </button>

            <button
              type="button"
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {pick(T.cms.exitBtn, language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-ui-sans">
      {/* Top Header */}
      <header className="bg-[#1E293B] text-white px-6 py-4 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/20 text-[#0EA5E9] flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="text-start">
            <h1 className="font-semibold text-base sm:text-lg">
              {pick(T.cms.title, language)}
            </h1>
            <p className="text-xs text-slate-400">
              {isAr ? 'لوحة إدارة ومتابعة بلاغات التكييف والمحتوى' : 'HVAC Operations & Content Management'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetAllToDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title={isAr ? 'استعادة البيانات الافتراضية' : 'Reset to Default Sample Data'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'استعادة الافتراضي' : 'Reset Data'}</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{pick(T.cms.exitBtn, language)}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{pick(T.cms.tabLeads, language)}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {leads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{pick(T.cms.tabServices, language)}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('service_areas')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'service_areas'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{isAr ? 'مناطق الخدمة والمدن' : 'Service Areas'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {serviceAreas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero_booking')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hero_booking'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? 'محتوى الهيرو والحجز' : 'Hero & Booking Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{pick(T.cms.tabGallery, language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'testimonials'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>{pick(T.cms.tabReviews, language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hours_contact')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hours_contact'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{isAr ? 'ساعات العمل والتواصل' : 'Hours & Emergency Contact'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Tab 1: Leads View */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {isAr ? 'سجل طلبات الصيانة وعروض الأسعار (Source: HVAC)' : 'HVAC Inquiries & Service Leads'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr ? 'كافة الطلبات الواردة عبر الموقع ومحسوبة بالرقم المرجعي' : 'Real-time recorded leads with status tracking & reference IDs.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportLeadsCSV}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تصدير الطلبات (CSV)' : 'Export CSV'}</span>
              </button>
            </div>

            {/* Leads Table / Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 text-start">{isAr ? 'المرجع والوقت' : 'Ref & Date'}</th>
                      <th className="p-3.5 text-start">{isAr ? 'العميل والجوال' : 'Client & Phone'}</th>
                      <th className="p-3.5 text-start">{isAr ? 'المدينة والخدمة' : 'City & Service'}</th>
                      <th className="p-3.5 text-start">{isAr ? 'ملاحظات / حالة الطوارئ' : 'Notes / Urgency'}</th>
                      <th className="p-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="p-3.5 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          {isAr ? 'لا توجد طلبات مسجلة حتى الآن' : 'No service leads recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Ref & Date */}
                          <td className="p-3.5 align-top">
                            <div className="font-mono font-bold text-[#0EA5E9] text-xs">
                              <bdi dir="ltr">{lead.referenceNumber}</bdi>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Client & Phone */}
                          <td className="p-3.5 align-top">
                            <div className="font-semibold text-slate-900">{lead.clientName}</div>
                            <a
                              href={`tel:${lead.phoneNumber}`}
                              className="text-[11px] text-[#0EA5E9] hover:underline block font-mono"
                            >
                              <bdi dir="ltr">{lead.phoneNumber}</bdi>
                            </a>
                            {lead.email && (
                              <div className="text-[11px] text-slate-400">{lead.email}</div>
                            )}
                          </td>

                          {/* City & Service */}
                          <td className="p-3.5 align-top">
                            <div className="font-medium text-slate-800">{lead.city}</div>
                            <div className="text-[11px] text-slate-500">{lead.service}</div>
                            {lead.preferredDate && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-[#0EA5E9]" />
                                <span>{lead.preferredDate}</span>
                              </div>
                            )}
                          </td>

                          {/* Notes / Urgency */}
                          <td className="p-3.5 align-top max-w-xs">
                            {lead.isUrgent && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[10px] mb-1">
                                ⚠️ {isAr ? 'طوارئ عاجلة' : 'URGENT'}
                              </span>
                            )}
                            <p className="text-slate-600 line-clamp-2 leading-relaxed">
                              {lead.notes || '—'}
                            </p>
                          </td>

                          {/* Status Select */}
                          <td className="p-3.5 align-top">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                updateLeadStatus(lead.id, e.target.value as HVACLeadStatus)
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                                lead.status === 'new'
                                  ? 'bg-sky-50 text-[#0EA5E9] border-sky-200'
                                  : lead.status === 'contacted'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : lead.status === 'scheduled'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : lead.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="new">{isAr ? 'جديد' : 'New'}</option>
                              <option value="contacted">{isAr ? 'تم التواصل' : 'Contacted'}</option>
                              <option value="scheduled">{isAr ? 'مجدول للزيارة' : 'Scheduled'}</option>
                              <option value="completed">{isAr ? 'تم الإنجاز' : 'Completed'}</option>
                              <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 align-top text-center">
                            <button
                              type="button"
                              onClick={() => deleteLead(lead.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title={isAr ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Service Areas */}
        {activeTab === 'service_areas' && (
          <div className="space-y-6">
            {saveSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>{saveSuccessMsg}</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {isAr ? 'مناطق التغطية والخدمة (الشرقية والرياض)' : 'Service Areas & City Coverage'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr ? 'إدارة المدن المشمولة وأزمنة استجابة الطوارئ بدقة' : 'Manage covered cities and emergency response dispatch SLAs'}
                </p>
              </div>

              <div className="space-y-4">
                {areasForm.map((city, idx) => (
                  <div key={city.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900">
                        {isAr ? city.cityNameAr : city.cityNameEn} ({isAr ? city.regionAr : city.regionEn})
                      </div>
                      <div className="text-xs text-slate-500">
                        {city.isPrimaryArea ? (isAr ? 'منطقة تغطية رئيسية' : 'Primary SLA Zone') : (isAr ? 'فرع ثانوي' : 'Secondary Zone')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <label className="text-slate-600 font-medium">{isAr ? 'زمن الاستجابة (دقيقة):' : 'Response (min):'}</label>
                        <input
                          type="number"
                          value={city.responseTimeMin}
                          onChange={(e) => {
                            const updated = [...areasForm];
                            updated[idx].responseTimeMin = Number(e.target.value);
                            setAreasForm(updated);
                          }}
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...areasForm];
                          updated[idx].active = !updated[idx].active;
                          setAreasForm(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          city.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {city.active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateServiceAreas(areasForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ مناطق الخدمة بنجاح' : 'Service areas saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? 'حفظ مناطق التغطية' : 'Save Service Areas'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Hero & Booking Copy */}
        {activeTab === 'hero_booking' && (
          <div className="space-y-6">
            {saveSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>{saveSuccessMsg}</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {isAr ? 'تعديل محتوى الهيرو ونموذج الحجز' : 'Hero & Booking Copy Editor'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان الرئيسي (عربي)' : 'Headline (Arabic)'}</label>
                  <textarea
                    rows={2}
                    value={heroForm.headlineAr}
                    onChange={(e) => setHeroForm({ ...heroForm, headlineAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان الرئيسي (إنجليزية)' : 'Headline (English)'}</label>
                  <textarea
                    rows={2}
                    value={heroForm.headlineEn}
                    onChange={(e) => setHeroForm({ ...heroForm, headlineEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف الفرعي (عربي)' : 'Subtitle (Arabic)'}</label>
                  <textarea
                    rows={3}
                    value={heroForm.subtitleAr}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitleAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف الفرعي (إنجليزية)' : 'Subtitle (English)'}</label>
                  <textarea
                    rows={3}
                    value={heroForm.subtitleEn}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateHeroContent(heroForm);
                    await updateBookingCopy(bookingForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ نصوص الهيرو والحجز بنجاح' : 'Hero & booking copy saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? 'حفظ النصوص والمحتوى' : 'Save Content'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Hours & Contact */}
        {activeTab === 'hours_contact' && (
          <div className="space-y-6">
            {saveSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>{saveSuccessMsg}</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {isAr ? 'ساعات العمل وهاتف طوارئ التكييف' : 'Operating Hours & Emergency Contact'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'هاتف الطوارئ (Emergency Phone)' : 'Emergency Phone'}</label>
                  <input
                    type="text"
                    value={hoursForm.emergencyPhone}
                    onChange={(e) => setHoursForm({ ...hoursForm, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'رقم الواتساب السريع' : 'WhatsApp Number'}</label>
                  <input
                    type="text"
                    value={hoursForm.whatsappNumber}
                    onChange={(e) => setHoursForm({ ...hoursForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'ساعات العمل الأسبوعية (عربي)' : 'Weekday Hours (Arabic)'}</label>
                  <input
                    type="text"
                    value={hoursForm.hoursWeekdayAr}
                    onChange={(e) => setHoursForm({ ...hoursForm, hoursWeekdayAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'ساعات العمل الأسبوعية (إنجليزية)' : 'Weekday Hours (English)'}</label>
                  <input
                    type="text"
                    value={hoursForm.hoursWeekdayEn}
                    onChange={(e) => setHoursForm({ ...hoursForm, hoursWeekdayEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateOperatingHours(hoursForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ بيانات الاتصال وساعات العمل' : 'Hours and contact info saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? 'حفظ بيانات الاتصال' : 'Save Contact Info'}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isAr ? 'إدارة خدمات التكييف (٦ بطاقات أساسية)' : 'Manage HVAC Services'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr ? 'تفعيل أو إخفاء الخدمات المعروضة على الموقع' : 'Toggle active status of service offerings.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className={`bg-white border rounded-2xl p-5 space-y-3 flex flex-col justify-between ${
                    s.active ? 'border-slate-200 shadow-xs' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="space-y-2 text-start">
                    <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 relative">
                      <img src={s.image} alt={s.titleEn} className="w-full h-full object-cover" />
                      <div
                        className={`absolute top-2 end-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {s.active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-900">
                      {isAr ? s.titleAr : s.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {isAr ? s.descriptionAr : s.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">ID: {s.slug}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleService(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        s.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {s.active ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Gallery Management */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isAr ? 'إدارة معرض الأعمال الميدانية' : 'Manage Field Work Gallery'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr ? 'المشاريع وصور الصيانة الميدانية في المنطقة الشرقية' : 'Portfolio of real field maintenance jobs.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-start">
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                    <img src={item.image} alt={item.titleEn} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#0EA5E9] font-semibold block uppercase">
                      {isAr ? item.categoryAr : item.categoryEn} • {isAr ? item.locationAr : item.locationEn}
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 mt-0.5">
                      {isAr ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAr ? item.captionAr : item.captionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isAr ? 'تقييمات وآراء العملاء' : 'Client Testimonials'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr ? 'التقييمات المعتمدة الظاهرة في الموقع' : 'Customer reviews and ratings.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-start">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 italic">
                    "{isAr ? rev.quoteAr : rev.quoteEn}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">
                      {isAr ? rev.nameAr : rev.nameEn} ({isAr ? rev.cityAr : rev.cityEn})
                    </span>
                    <span className="text-[#0EA5E9] font-medium">{isAr ? rev.serviceAr : rev.serviceEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
