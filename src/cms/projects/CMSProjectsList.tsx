import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle2,
  Building,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  ChevronDown,
  Percent,
} from 'lucide-react';
import { Language, Project, ProjectStatus } from '../../types';
import { PreDeleteReferenceModal } from '../components/PreDeleteReferenceModal';
import { getLocalizedText } from '../../lib/utils';

interface CMSProjectsListProps {
  projects: Project[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFeatured: (project: Project) => void;
  onQuickStatusChange: (project: Project, newStatus: ProjectStatus) => void;
  onViewLive: (project: Project) => void;
  language: Language;
}

export const CMSProjectsList: React.FC<CMSProjectsListProps> = ({
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFeatured,
  onQuickStatusChange,
  onViewLive,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [projectForDelete, setProjectForDelete] = useState<Project | null>(null);

  const statusOptions: { value: ProjectStatus; labelEn: string; labelAr: string; color: string }[] = [
    { value: 'planning', labelEn: 'Planning & Design', labelAr: 'مرحلة التخطيط والتصميم', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'off-plan', labelEn: 'Phase 1 Launch', labelAr: 'طرح المرحلة الأولى', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'under-construction', labelEn: 'Under Construction', labelAr: 'قيد الإنشاء والتطوير', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'completed', labelEn: 'Completed / Handover', labelAr: 'مكتمل وجاهز للتسليم', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ];

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = searchQuery.toLowerCase().trim();
      const titleEn = getLocalizedText(project.title, 'en').toLowerCase();
      const titleAr = getLocalizedText(project.title, 'ar').toLowerCase();
      const devEn = getLocalizedText(project.developer, 'en').toLowerCase();
      const devAr = getLocalizedText(project.developer, 'ar').toLowerCase();
      const locEn = getLocalizedText(project.location, 'en').toLowerCase();
      const locAr = getLocalizedText(project.location, 'ar').toLowerCase();

      const matchesSearch =
        !q ||
        titleEn.includes(q) ||
        titleAr.includes(q) ||
        devEn.includes(q) ||
        devAr.includes(q) ||
        locEn.includes(q) ||
        locAr.includes(q);

      const matchesStatus =
        statusFilter === 'all' || (project.status || 'under-construction') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Aggregate Metrics
  const totalUnits = useMemo(
    () => projects.reduce((sum, p) => sum + (p.unitsTotal || 0), 0),
    [projects]
  );
  const availableUnits = useMemo(
    () => projects.reduce((sum, p) => sum + (p.unitsAvailable || 0), 0),
    [projects]
  );
  const avgProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((acc, p) => acc + (p.progressPercentage || 50), 0);
    return Math.round(sum / projects.length);
  }, [projects]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title_EN', 'Title_AR', 'Developer', 'Location', 'StartingPrice', 'UnitsTotal', 'UnitsAvailable', 'Progress%', 'Status'];
    const rows = filteredProjects.map((p) => [
      p.id,
      `"${getLocalizedText(p.title, 'en').replace(/"/g, '""')}"`,
      `"${getLocalizedText(p.title, 'ar').replace(/"/g, '""')}"`,
      `"${getLocalizedText(p.developer, 'en').replace(/"/g, '""')}"`,
      `"${getLocalizedText(p.location, 'en').replace(/"/g, '""')}"`,
      `"${p.startingPriceSAR}"`,
      p.unitsTotal,
      p.unitsAvailable,
      `${p.progressPercentage || 0}%`,
      p.status || 'under-construction',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display-serif">
            {isAr ? 'إدارة المشاريع التطويرية الكبرى' : 'Major Development Projects'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إدارة الأبراج، المجمعات السكنية، ومشاريع البيع على الخارطة مع تتبع نسب الإنجاز'
              : 'Manage master-planned developments, off-plan projects, and track construction timelines'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title={isAr ? 'تصدير كملف CSV' : 'Export CSV'}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{isAr ? 'تصدير البيانات' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onAddProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm font-bold hover:from-blue-700 hover:to-sky-600 transition-all shadow-md shadow-blue-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مشروع جديد' : 'New Project'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'إجمالي المشاريع' : 'Active Projects'}
            </span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {projects.length}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAr ? 'مشاريع مسجلة بالكتالوج' : 'Master developments catalog'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'إجمالي الوحدات' : 'Total Units'}
            </span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {totalUnits.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {availableUnits} {isAr ? 'وحدة متاحة للحجز' : 'units available for sale'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'متوسط نسبة الإنجاز' : 'Avg Construction'}
            </span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {avgProgress}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'مشاريع مميزة (Featured)' : 'Featured Spotlight'}
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {projects.filter((p) => p.featured).length}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAr ? 'معروضة بالصفحة الرئيسية' : 'Promoted on homepage'}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isAr ? 'بحث باسم المشروع، المطور، أو الموقع...' : 'Search projects by title, developer, or location...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters and View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'كافة الحالات (All Statuses)' : 'All Statuses'}</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isAr ? opt.labelAr : opt.labelEn}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List Content */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isAr ? 'لا توجد مشاريع مطابقة للبحث' : 'No matching development projects found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? 'جرّب تعديل كلمات البحث أو تصفية الحالات، أو أضف مشروعاً تطويرياً جديداً'
              : 'Try adjusting your search criteria or add a new development project to the catalog'}
          </p>
          <button
            onClick={onAddProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة مشروع' : 'Add Project'}</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 text-start">{isAr ? 'المشروع والمطور' : 'Project & Developer'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الموقع' : 'Location'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'يبدأ من' : 'Starting Price'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الوحدات المتاحة' : 'Units & Availability'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'نسبة الإنجاز' : 'Progress'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProjects.map((project) => {
                  const currentStatus = project.status || 'under-construction';
                  const statusInfo = statusOptions.find((s) => s.value === currentStatus) || statusOptions[2];
                  const progress = project.progressPercentage || 50;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Project & Developer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.image}
                            alt={getLocalizedText(project.title, language)}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs truncate max-w-xs block">
                                {getLocalizedText(project.title, language)}
                              </span>
                              {project.featured && (
                                <span className="p-0.5 rounded bg-amber-100 text-amber-700" title="Featured">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {getLocalizedText(project.developer, language)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="truncate max-w-[140px] block">{getLocalizedText(project.location, language)}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {project.startingPriceSAR}
                      </td>

                      {/* Units */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {project.unitsAvailable} / {project.unitsTotal}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {isAr ? 'وحدة متوفرة' : 'units left'}
                          </span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-600">
                            <span className="font-bold">{progress}%</span>
                            <span className="text-[9px] text-slate-400">{getLocalizedText(project.handoverDate, language)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => onQuickStatusChange(project, e.target.value as ProjectStatus)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusInfo.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {isAr ? opt.labelAr : opt.labelEn}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleFeatured(project)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              project.featured
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title={isAr ? 'تمييز المشروع' : 'Toggle Featured'}
                          >
                            <Star className={`w-3.5 h-3.5 ${project.featured ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => onEditProject(project)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title={isAr ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicateProject(project)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title={isAr ? 'تكرار المشروع' : 'Duplicate'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setProjectForDelete(project)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isAr ? 'أرشفة ونقل لسلة المهملات' : 'Move to Trash'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const currentStatus = project.status || 'under-construction';
            const statusInfo = statusOptions.find((s) => s.value === currentStatus) || statusOptions[2];
            const progress = project.progressPercentage || 50;

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image cover */}
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                    <img
                      src={project.image}
                      alt={getLocalizedText(project.title, language)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 start-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${statusInfo.color}`}>
                        {isAr ? statusInfo.labelAr : statusInfo.labelEn}
                      </span>
                    </div>
                    {project.featured && (
                      <div className="absolute top-3 end-3 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>{isAr ? 'مميز' : 'Featured'}</span>
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                        {getLocalizedText(project.category, language)}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm font-display-serif line-clamp-1">
                        {getLocalizedText(project.title, language)}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{getLocalizedText(project.developer, language)}</p>
                    </div>

                    {/* Pricing & Units metric */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'يبدأ من' : 'Starts at'}</span>
                        <span className="font-bold text-slate-900">{project.startingPriceSAR}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'الوحدات المتبقية' : 'Available'}</span>
                        <span className="font-bold text-emerald-600">{project.unitsAvailable} / {project.unitsTotal}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{isAr ? 'نسبة الإنجاز' : 'Completion'}: <strong className="text-slate-900">{progress}%</strong></span>
                        <span className="text-[10px] text-slate-400">{getLocalizedText(project.handoverDate, language)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => onToggleFeatured(project)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      project.featured
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${project.featured ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <button
                      onClick={() => onEditProject(project)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{isAr ? 'تعديل' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => onDuplicateProject(project)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      title={isAr ? 'تكرار' : 'Duplicate'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setProjectForDelete(project)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                      title={isAr ? 'أرشفة ونقل لسلة المهملات' : 'Move to Trash'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pre-Deletion Reference Check & Soft Delete Modal */}
      {projectForDelete && (
        <PreDeleteReferenceModal
          isOpen={!!projectForDelete}
          onClose={() => setProjectForDelete(null)}
          entityType="project"
          entityId={projectForDelete.id}
          entityTitle={projectForDelete.title}
          originalCollection="construction_projects"
          originalData={projectForDelete}
          currentUser={{
            uid: 'admin-1',
            email: 'admin@hard.sa',
            role: 'superadmin',
          }}
          language={language}
          onSoftDeleteSuccess={() => {
            onDeleteProject(projectForDelete.id);
            setProjectForDelete(null);
          }}
        />
      )}
    </div>
  );
};
