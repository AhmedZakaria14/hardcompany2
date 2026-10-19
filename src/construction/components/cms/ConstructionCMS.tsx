import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Building2,
  FileText,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Download,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Eye,
  ShieldCheck,
  Coins,
  Globe,
  Search,
  Filter,
} from 'lucide-react';
import { useConstruction } from '../../context/ConstructionContext';
import { constructionTranslations } from '../../utils/translations';
import { formatAreaBUA } from '../../utils/constructionFormatters';
import { ConstructionProject, ConstructionQuoteLead, LeadStatus } from '../../types';
import { formatSAR } from '../../utils/costCalculator';

interface ConstructionCMSProps {
  onExit: () => void;
}

export function ConstructionCMS({ onExit }: ConstructionCMSProps) {
  const {
    language,
    toggleLanguage,
    projects,
    addProject,
    updateProject,
    deleteProject,
    resetProjectsToDefault,
    services,
    addService,
    updateService,
    deleteService,
    heroContent,
    updateHeroContent,
    companyContent,
    updateCompanyContent,
    workStages,
    updateWorkStages,
    officeLocations,
    updateOfficeLocations,
    leads,
    updateLeadStatus,
    deleteLead,
  } = useConstruction();

  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // PIN Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active CMS Tab
  const [activeTab, setActiveTab] = useState<
    'projects' | 'services' | 'hero_company' | 'stages_guarantees' | 'offices_contact' | 'leads' | 'analytics'
  >('projects');

  // Hero & Company Form State
  const [heroForm, setHeroForm] = useState(heroContent);
  const [companyForm, setCompanyForm] = useState(companyContent);
  const [stagesForm, setStagesForm] = useState(workStages);
  const [officesForm, setOfficesForm] = useState(officeLocations);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    setHeroForm(heroContent);
  }, [heroContent]);

  useEffect(() => {
    setCompanyForm(companyContent);
  }, [companyContent]);

  useEffect(() => {
    setStagesForm(workStages);
  }, [workStages]);

  useEffect(() => {
    setOfficesForm(officeLocations);
  }, [officeLocations]);

  // Leads Filter & Search
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Project Editor Modal State
  const [editingProject, setEditingProject] = useState<ConstructionProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Form State for Project Add/Edit
  const [projForm, setProjForm] = useState<Omit<ConstructionProject, 'id'>>({
    titleAr: '',
    titleEn: '',
    category: 'residential',
    status: 'in-progress',
    locationAr: 'حي حطين، الرياض',
    locationEn: 'Hittin District, Riyadh',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    year: '2025',
    buaM2: 1200,
    durationMonths: 12,
    valueSAR: '8,500,000 ر.س',
    clientAr: 'عميل خاص',
    clientEn: 'Private Client',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    descriptionAr: 'مشروع متميز يتم تنفيذه وفق أعلى معايير كود البناء السعودي.',
    descriptionEn: 'High-end construction project delivered strictly under SBC standards.',
    scopeAr: ['الأعمال الخرسانية وبناء العظم', 'التشطيبات الفاخرة والواجهات'],
    scopeEn: ['Structural concrete framework', 'Luxury facades and fit-out'],
    structuralSystemAr: 'هيكل خرساني مسلح متطور',
    structuralSystemEn: 'Advanced Reinforced Concrete Superstructure',
    finishingLevelAr: 'ديلوكس فاخر',
    finishingLevelEn: 'Deluxe Turnkey',
    highlightsAr: ['مطابق لكود البناء السعودي', 'عوازل مائية وحرارية ١٠ سنوات'],
    highlightsEn: ['100% SBC Compliant', '10-Year Waterproofing Warranty'],
    featured: true,
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError(t.cms.auth.invalidPin);
    }
  };

  const handleInstantUnlock = () => {
    setIsAuthenticated(true);
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      'ReferenceNumber',
      'CreatedAt',
      'ClientName',
      'Phone',
      'Email',
      'City',
      'District',
      'ProjectType',
      'BuiltUpArea',
      'EstimatedValueSAR',
      'Status',
      'Notes',
    ];

    const rows = leads.map((l) => [
      `"${l.referenceNumber}"`,
      `"${l.createdAt}"`,
      `"${l.clientName.replace(/"/g, '""')}"`,
      `"${l.phoneNumber}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.district}"`,
      `"${l.projectType}"`,
      `"${l.builtUpArea || ''}"`,
      `"${l.estimatedValueSAR || ''}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Contracting_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Project Form for Edit
  const handleOpenEditProject = (proj: ConstructionProject) => {
    setEditingProject(proj);
    setProjForm({
      titleAr: proj.titleAr,
      titleEn: proj.titleEn,
      category: proj.category,
      status: proj.status,
      locationAr: proj.locationAr,
      locationEn: proj.locationEn,
      cityAr: proj.cityAr,
      cityEn: proj.cityEn,
      year: proj.year,
      buaM2: proj.buaM2,
      durationMonths: proj.durationMonths,
      valueSAR: proj.valueSAR,
      clientAr: proj.clientAr,
      clientEn: proj.clientEn,
      image: proj.image,
      galleryImages: proj.galleryImages || [],
      descriptionAr: proj.descriptionAr,
      descriptionEn: proj.descriptionEn,
      scopeAr: proj.scopeAr || [],
      scopeEn: proj.scopeEn || [],
      structuralSystemAr: proj.structuralSystemAr || '',
      structuralSystemEn: proj.structuralSystemEn || '',
      finishingLevelAr: proj.finishingLevelAr || '',
      finishingLevelEn: proj.finishingLevelEn || '',
      highlightsAr: proj.highlightsAr || [],
      highlightsEn: proj.highlightsEn || [],
      featured: Boolean(proj.featured),
    });
    setIsNewProjectModalOpen(true);
  };

  // Open Project Form for Create
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjForm({
      titleAr: '',
      titleEn: '',
      category: 'residential',
      status: 'in-progress',
      locationAr: 'الرياض',
      locationEn: 'Riyadh',
      cityAr: 'الرياض',
      cityEn: 'Riyadh',
      year: '2026',
      buaM2: 1500,
      durationMonths: 14,
      valueSAR: '9,000,000 ر.س',
      clientAr: 'عميل خاص',
      clientEn: 'Private Client',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [],
      descriptionAr: 'مشروع مقاولات جديد بنظام تسليم المفتاح.',
      descriptionEn: 'New turnkey construction development.',
      scopeAr: ['أعمال العظم والخرسانات', 'أعمال التشطيب والديكور'],
      scopeEn: ['Concrete framing', 'Finishing & fit-out'],
      structuralSystemAr: 'خرسانة مسلحة',
      structuralSystemEn: 'Reinforced Concrete',
      finishingLevelAr: 'سوبر ديلوكس',
      finishingLevelEn: 'Super Deluxe',
      highlightsAr: ['مطابق لكود البناء السعودي'],
      highlightsEn: ['100% SBC Compliant'],
      featured: false,
    });
    setIsNewProjectModalOpen(true);
  };

  // Save Project Handler
  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, projForm);
    } else {
      addProject(projForm);
    }
    setIsNewProjectModalOpen(false);
    setEditingProject(null);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    const matchesSearch =
      leadSearchQuery.trim() === '' ||
      lead.clientName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.referenceNumber.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.phoneNumber.includes(leadSearchQuery) ||
      lead.city.toLowerCase().includes(leadSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate Pipeline Analytics
  const totalPipelineSAR = leads.reduce((acc, curr) => acc + (curr.estimatedValueSAR || 4500000), 0);
  const totalNewLeads = leads.filter((l) => l.status === 'new').length;
  const totalWonLeads = leads.filter((l) => l.status === 'won').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#eef7ff] border border-sky-100 text-[#009ee2] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display-serif text-[#0f243e]">
              {t.cms.auth.title}
            </h2>
            <p className="text-xs text-slate-500">{t.cms.auth.prompt}</p>
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (2026)"
              className="w-full text-center text-2xl tracking-widest px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:border-[#009ee2] focus:ring-1 focus:ring-[#009ee2] focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>{t.cms.auth.unlockBtn}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleInstantUnlock}
              className="text-xs text-[#009ee2] hover:text-[#008bc7] font-bold underline cursor-pointer"
            >
              {t.cms.auth.instantAccess} (PIN: 2026)
            </button>

            <button
              type="button"
              onClick={onExit}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer pt-2"
            >
              {t.cms.exitCms}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 text-start">
      {/* Top CMS Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#eef7ff] border border-sky-100 text-[#009ee2]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-display-serif text-[#0f243e] flex items-center gap-2">
              <span>{isAr ? 'لوحة تحكم هارد للمقاولات' : 'HARD Contracting CMS'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Live Portal
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">{t.cms.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 cursor-pointer shadow-2xs"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4 text-[#009ee2]" />
          </button>

          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>{t.cms.exitCms}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main CMS Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'المشاريع والمحفظة' : 'Projects & Portfolio'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              {projects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{isAr ? 'الخدمات والحلول' : 'Services & Solutions'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              {services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero_company')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'hero_company'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{isAr ? 'الهيرو ومعلومات الشركة' : 'Hero & Company Info'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages_guarantees')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'stages_guarantees'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'مراحل العمل والضمانات' : 'Work Stages & Warranties'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offices_contact')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'offices_contact'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{isAr ? 'الفروع والتواصل' : 'Offices & Contact'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'طلبات الأسعار' : 'Quotation Leads'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              {leads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#009ee2] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.cms.tabs.analytics}</span>
          </button>
        </div>

        {/* Tab 1: Leads Management */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    placeholder={isAr ? 'بحث بالاسم أو الرقم أو المدينة...' : 'Search name, ref, city...'}
                    className="w-full ps-9 pe-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Filter className="w-3.5 h-3.5 text-[#009ee2]" />
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  >
                    <option value="all">{t.cms.leadsTable.all}</option>
                    <option value="new">{t.cms.leadsTable.new}</option>
                    <option value="contacted">{t.cms.leadsTable.contacted}</option>
                    <option value="proposal_sent">{t.cms.leadsTable.proposalSent}</option>
                    <option value="won">{t.cms.leadsTable.won}</option>
                    <option value="closed">{t.cms.leadsTable.closed}</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#009ee2]" />
                <span>{t.cms.leadsTable.exportCsv}</span>
              </button>
            </div>

            {/* Leads Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.ref}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.client}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.type}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.area}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.city}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.estValue}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.status}</th>
                      <th className="py-3.5 px-4 text-start font-bold">{t.cms.leadsTable.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          {isAr ? 'لا توجد طلبات تطابق معايير البحث' : 'No quotation requests found'}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const statusColors: Record<LeadStatus, string> = {
                          new: 'bg-rose-50 text-rose-600 border-rose-200',
                          contacted: 'bg-amber-50 text-amber-700 border-amber-200',
                          proposal_sent: 'bg-sky-50 text-[#009ee2] border-sky-200',
                          won: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                          closed: 'bg-slate-100 text-slate-600 border-slate-200',
                        };

                        return (
                          <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#009ee2]">
                              {lead.referenceNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#0f243e]">{lead.clientName}</div>
                              <div className="text-[11px] text-slate-500">{lead.phoneNumber}</div>
                            </td>
                            <td className="py-3.5 px-4 capitalize text-slate-700">
                              {lead.projectType.replace('-', ' ')}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">
                              {lead.builtUpArea ? formatAreaBUA(lead.builtUpArea, isAr ? 'ar' : 'en') : '-'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">
                              {lead.city} {lead.district ? `(${lead.district})` : ''}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-600">
                              {lead.estimatedValueSAR
                                ? formatSAR(lead.estimatedValueSAR, isAr)
                                : lead.budgetRangeSAR || '-'}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  updateLeadStatus(lead.id, e.target.value as LeadStatus)
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-white focus:outline-none cursor-pointer ${
                                  statusColors[lead.status]
                                }`}
                              >
                                <option value="new">{t.cms.leadsTable.new}</option>
                                <option value="contacted">{t.cms.leadsTable.contacted}</option>
                                <option value="proposal_sent">{t.cms.leadsTable.proposalSent}</option>
                                <option value="won">{t.cms.leadsTable.won}</option>
                                <option value="closed">{t.cms.leadsTable.closed}</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/${lead.phoneNumber.replace('+', '').replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`tel:${lead.phoneNumber}`}
                                  className="p-1.5 rounded-lg bg-sky-50 hover:bg-[#009ee2] text-[#009ee2] hover:text-white transition-colors"
                                  title="Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => deleteLead(lead.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects CRUD */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {t.cms.tabs.projects}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'إدارة ونشر المشاريع الإنشائية المنجزة والجارية في المحفظة.' : 'Manage and update real construction portfolio projects.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetProjectsToDefault}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.cms.projectForm.resetDefaults}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateProject}
                  className="px-4 py-2 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.cms.projectForm.addNew}</span>
                </button>
              </div>
            </div>

            {/* Projects Table / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div className="relative aspect-16/10 bg-slate-100">
                    <img src={proj.image} alt={proj.titleAr} className="w-full h-full object-cover" />
                    <div className="absolute top-3 end-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-[#009ee2] border border-sky-100 uppercase backdrop-blur-xs">
                      {proj.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#009ee2] font-semibold">{proj.category}</div>
                      <h4 className="text-sm font-bold text-[#0f243e] font-display-serif">
                        {isAr ? proj.titleAr : proj.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {proj.buaM2.toLocaleString()} m² • {proj.year} • {isAr ? proj.cityAr : proj.cityEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-600">{proj.valueSAR}</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(proj)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer border border-slate-200"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#009ee2]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(proj.id)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Services Management */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display-serif text-[#0f243e]">
                  {isAr ? 'إدارة خدمات المقاولات والإنشاءات' : 'Construction Services & Solutions'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr ? 'إضافة وتعديل الخدمات والمسؤوليات والضمانات المعتمدة' : 'Manage construction services, deliverables, and warranties'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-full bg-sky-50 text-[#009ee2] text-xs font-bold border border-sky-100">
                      {isAr ? svc.badgeAr : svc.badgeEn || 'خدمة معتمدة'}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => deleteService(svc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-[#0f243e]">
                    {isAr ? svc.titleAr : svc.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {isAr ? svc.descriptionAr : svc.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{isAr ? `ضمان ${svc.warrantyYears} سنوات` : `${svc.warrantyYears}-Year Warranty`}</span>
                    <span className="text-[#009ee2] font-bold">{svc.startingPriceSAR || 'تواصل للتسعير'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hero & Company Info */}
        {activeTab === 'hero_company' && (
          <div className="space-y-6 animate-in fade-in-50">
            {saveSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs">
                <span>{saveSuccessMsg}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold font-display-serif text-[#0f243e]">
                  {isAr ? 'محتوى الهيرو الرئيسي (Hero Section)' : 'Main Hero Section Content'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'تعديل العناوين والشارات والأوصاف والإحصائيات على الصفحة الرئيسية' : 'Edit hero headlines, badges, subtitles, and statistics'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'الشارة بالعربية' : 'Badge (Arabic)'}</label>
                  <input
                    type="text"
                    value={heroForm.badgeAr}
                    onChange={(e) => setHeroForm({ ...heroForm, badgeAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'الشارة بالإنجليزية' : 'Badge (English)'}</label>
                  <input
                    type="text"
                    value={heroForm.badgeEn}
                    onChange={(e) => setHeroForm({ ...heroForm, badgeEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان الرئيسي (عربي)' : 'Headline (Arabic)'}</label>
                  <textarea
                    rows={2}
                    value={heroForm.headlineAr}
                    onChange={(e) => setHeroForm({ ...heroForm, headlineAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان الرئيسي (إنجليزية)' : 'Headline (English)'}</label>
                  <textarea
                    rows={2}
                    value={heroForm.headlineEn}
                    onChange={(e) => setHeroForm({ ...heroForm, headlineEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف الفرعي (إنجليزية)' : 'Subtitle (English)'}</label>
                  <textarea
                    rows={3}
                    value={heroForm.subtitleEn}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    await updateHeroContent(heroForm);
                    await updateCompanyContent(companyForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ التغييرات بنجاح في قاعدة البيانات' : 'Hero & Company changes saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {isAr ? 'حفظ إعدادات الهيرو والشركة' : 'Save Hero & Company Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Work Stages & Guarantees */}
        {activeTab === 'stages_guarantees' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold font-display-serif text-[#0f243e]">
                  {isAr ? 'مراحل التنفيذ والضمانات الإنشائية' : 'Construction Work Stages & Warranties'}
                </h3>
              </div>

              <div className="space-y-4">
                {stagesForm.map((stg, idx) => (
                  <div key={stg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#009ee2]">
                        {isAr ? `المرحلة ${stg.order}` : `Stage ${stg.order}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{stg.durationAr}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={stg.titleAr}
                        onChange={(e) => {
                          const updated = [...stagesForm];
                          updated[idx].titleAr = e.target.value;
                          setStagesForm(updated);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={stg.titleEn}
                        onChange={(e) => {
                          const updated = [...stagesForm];
                          updated[idx].titleEn = e.target.value;
                          setStagesForm(updated);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    await updateWorkStages(stagesForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ مراحل العمل بنجاح' : 'Work stages saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {isAr ? 'حفظ مراحل العمل' : 'Save Work Stages'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Offices & Contact */}
        {activeTab === 'offices_contact' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold font-display-serif text-[#0f243e]">
                  {isAr ? 'مقار وفروع شركة هارد' : 'HARD Office Locations'}
                </h3>
              </div>

              <div className="space-y-6">
                {officesForm.map((off, idx) => (
                  <div key={off.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#0f243e]">
                        {isAr ? off.nameAr : off.nameEn}
                      </h4>
                      {off.isHQ && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {isAr ? 'المقر الرئيسي' : 'HQ'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">{isAr ? 'الهاتف' : 'Phone'}</label>
                        <input
                          type="text"
                          value={off.phone}
                          onChange={(e) => {
                            const updated = [...officesForm];
                            updated[idx].phone = e.target.value;
                            setOfficesForm(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">{isAr ? 'الواتساب' : 'WhatsApp'}</label>
                        <input
                          type="text"
                          value={off.whatsapp}
                          onChange={(e) => {
                            const updated = [...officesForm];
                            updated[idx].whatsapp = e.target.value;
                            setOfficesForm(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    await updateOfficeLocations(officesForm);
                    setSaveSuccessMsg(isAr ? 'تم حفظ بيانات الفروع بنجاح' : 'Office locations saved successfully');
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {isAr ? 'حفظ بيانات التواصل والفروع' : 'Save Offices & Contact'}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="text-xs text-slate-500">{t.cms.analytics.totalPipeline}</div>
                <div className="text-2xl font-black font-display-serif text-emerald-600">
                  {formatSAR(totalPipelineSAR, isAr)}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="text-xs text-slate-500">{t.cms.analytics.totalLeads}</div>
                <div className="text-2xl font-black font-display-serif text-[#009ee2]">
                  {leads.length}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="text-xs text-slate-500">{t.cms.analytics.activeProjects}</div>
                <div className="text-2xl font-black font-display-serif text-[#0f243e]">
                  {projects.length}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="text-xs text-slate-500">{isAr ? 'العطاءات المكتسبة' : 'Won Contracts'}</div>
                <div className="text-2xl font-black font-display-serif text-[#0f243e]">
                  {totalWonLeads}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                {isAr ? 'توزيع الطلبات حسب القطاع الإنشائي' : 'Inquiries Breakdown by Sector'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">{isAr ? 'القصور والفلل السكنية' : 'Residential Villas'}</div>
                  <div className="text-lg font-bold text-[#0f243e]">
                    {leads.filter((l) => l.projectType === 'villa' || l.projectType === 'duplex').length} {isAr ? 'طلب' : 'Leads'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">{isAr ? 'الأبراج والمباني التجارية' : 'Commercial Buildings'}</div>
                  <div className="text-lg font-bold text-[#0f243e]">
                    {leads.filter((l) => l.projectType === 'commercial-building' || l.projectType === 'residential-compound').length} {isAr ? 'طلب' : 'Leads'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">{isAr ? 'المستودعات والمنشآت الصناعية' : 'Industrial & Warehouses'}</div>
                  <div className="text-lg font-bold text-[#0f243e]">
                    {leads.filter((l) => l.projectType === 'warehouse').length} {isAr ? 'طلب' : 'Leads'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Add/Edit Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold font-display-serif text-[#0f243e]">
                {editingProject ? t.cms.projectForm.edit : t.cms.projectForm.addNew}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectForm} className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.titleAr}</label>
                  <input
                    type="text"
                    required
                    value={projForm.titleAr}
                    onChange={(e) => setProjForm({ ...projForm, titleAr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.titleEn}</label>
                  <input
                    type="text"
                    required
                    value={projForm.titleEn}
                    onChange={(e) => setProjForm({ ...projForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.category}</label>
                  <select
                    value={projForm.category}
                    onChange={(e) =>
                      setProjForm({ ...projForm, category: e.target.value as ConstructionProject['category'] })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  >
                    <option value="residential">{t.projects.filterResidential}</option>
                    <option value="commercial">{t.projects.filterCommercial}</option>
                    <option value="industrial">{t.projects.filterIndustrial}</option>
                    <option value="finishing">{t.projects.filterFinishing}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.status}</label>
                  <select
                    value={projForm.status}
                    onChange={(e) =>
                      setProjForm({ ...projForm, status: e.target.value as ConstructionProject['status'] })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  >
                    <option value="completed">{t.projects.statusCompleted}</option>
                    <option value="in-progress">{t.projects.statusInProgress}</option>
                    <option value="delivered">{t.projects.statusDelivered}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.bua}</label>
                  <input
                    type="number"
                    value={projForm.buaM2}
                    onChange={(e) => setProjForm({ ...projForm, buaM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.value}</label>
                  <input
                    type="text"
                    value={projForm.valueSAR}
                    onChange={(e) => setProjForm({ ...projForm, valueSAR: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.year}</label>
                  <input
                    type="text"
                    value={projForm.year}
                    onChange={(e) => setProjForm({ ...projForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.duration}</label>
                  <input
                    type="number"
                    value={projForm.durationMonths}
                    onChange={(e) => setProjForm({ ...projForm, durationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t.cms.projectForm.image}</label>
                <input
                  type="url"
                  value={projForm.image}
                  onChange={(e) => setProjForm({ ...projForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009ee2] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t.cms.projectForm.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {t.cms.projectForm.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
