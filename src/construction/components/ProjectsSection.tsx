import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { ConstructionProjectCategory, ConstructionProject } from '../types';
import { constructionTranslations } from '../utils/translations';
import { buildConstructionProjectUrl } from '../utils/constructionUrlParams';
import { getLocalizedCategoryLabel, formatAreaBUA } from '../utils/constructionFormatters';

export function ProjectsSection() {
  const {
    language,
    projects,
    openProjectModal,
    openQuoteModal,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    resetProjectFilters,
  } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const filterTabs = [
    { id: 'all' as const, label: t.projects.filterAll },
    { id: 'residential' as const, label: t.projects.filterResidential },
    { id: 'commercial' as const, label: t.projects.filterCommercial },
    { id: 'industrial' as const, label: t.projects.filterIndustrial },
    { id: 'finishing' as const, label: t.projects.filterFinishing },
  ];

  const filteredProjects = projects.filter((proj) => {
    const matchesCategory = activeCategory === 'all' || proj.category === activeCategory;
    const title = isAr ? proj.titleAr : proj.titleEn;
    const location = isAr ? proj.locationAr : proj.locationEn;
    const matchesSearch =
      searchQuery.trim() === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status?: ConstructionProject['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: t.projects.statusCompleted || (isAr ? 'مكتمل' : 'Completed'),
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'delivered':
        return {
          label: t.projects.statusDelivered || (isAr ? 'تم التسليم' : 'Delivered'),
          classes: 'bg-sky-50 text-[#0072b8] border-sky-200',
          icon: CheckCircle2,
        };
      case 'in-progress':
      default:
        return {
          label: t.projects.statusInProgress || (isAr ? 'قيد التنفيذ' : 'In Progress'),
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
        };
    }
  };

  return (
    <section id="projects" className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl text-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#d0e9fa] text-[#0072b8] text-xs font-bold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#0072b8]" />
              <span>{t.projects.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
              {t.projects.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {t.projects.subtitle}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المشاريع أو المواقع...' : 'Search projects or locations...'}
              className="w-full ps-10 pe-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:bg-white focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#0f243e] text-white shadow-md shadow-[#0f243e]/20'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#f8fafc] border border-slate-200 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-base font-bold text-slate-700">
              {isAr ? 'لا توجد مشاريع تطابق البحث الحالي' : 'No projects match your filter criteria'}
            </div>
            <button
              type="button"
              onClick={resetProjectFilters}
              className="px-4 py-2 text-xs font-bold text-[#009ee2] hover:underline cursor-pointer"
            >
              {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((proj) => {
              const statusInfo = getStatusBadge(proj.status) || {
                label: isAr ? 'قيد التنفيذ' : 'In Progress',
                classes: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Clock,
              };
              const StatusIcon = statusInfo?.icon || Clock;
              const projectUrl = buildConstructionProjectUrl(proj.id, {
                category: activeCategory,
                search: searchQuery,
              });

              return (
                <div
                  key={proj.id}
                  className="bg-[#f8fafc] border border-sky-100 rounded-2xl overflow-hidden hover:border-[#009ee2] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group shadow-sm"
                >
                  {/* Project Image & Status Badge (Clickable) */}
                  <a
                    href={projectUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      openProjectModal(proj);
                    }}
                    className="relative aspect-16/10 overflow-hidden bg-slate-900 block cursor-pointer"
                    aria-label={isAr ? proj.titleAr || '' : proj.titleEn || ''}
                  >
                    <img
                      src={proj.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80'}
                      alt={isAr ? proj.titleAr || '' : proj.titleEn || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/80 via-transparent to-transparent" />

                    {/* Status Pill */}
                    <div
                      className={`absolute top-3 end-3 px-3 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-2xs ${statusInfo.classes || ''}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusInfo.label || ''}</span>
                    </div>

                    {/* Category & City Label */}
                    <div className="absolute bottom-3 start-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0f243e]/85 text-sky-200 border border-sky-400/30 backdrop-blur-xs">
                        {getLocalizedCategoryLabel(proj.category, language)}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {isAr ? proj.cityAr : proj.cityEn}
                      </span>
                    </div>
                  </a>

                  {/* Body Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between text-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-[#009ee2] shrink-0" />
                        <span>{isAr ? proj.locationAr : proj.locationEn}</span>
                      </div>

                      <a
                        href={projectUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          openProjectModal(proj);
                        }}
                        className="block focus:outline-none"
                      >
                        <h3 className="text-lg font-bold text-[#0f243e] font-display-serif group-hover:text-[#009ee2] transition-colors cursor-pointer">
                          {isAr ? proj.titleAr : proj.titleEn}
                        </h3>
                      </a>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {isAr ? proj.descriptionAr : proj.descriptionEn}
                      </p>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{formatAreaBUA(proj.buaM2, language)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-[#0072b8] shrink-0" />
                        <span className="truncate">{proj.year}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={projectUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          openProjectModal(proj);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-sky-50 text-xs font-bold text-slate-800 hover:text-[#009ee2] border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#009ee2]" />
                        <span>{t.projects.viewSpecs}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          openQuoteModal({
                            projectType:
                              proj.category === 'residential'
                                ? 'villa'
                                : proj.category === 'commercial'
                                ? 'commercial-building'
                                : proj.category === 'industrial'
                                ? 'warehouse'
                                : 'villa',
                            builtUpArea: proj.buaM2,
                            source: 'project_inquiry',
                            inquiredProjectId: proj.id,
                            notes: `Inquiry regarding similar project: ${isAr ? proj.titleAr : proj.titleEn} (${proj.locationEn})`,
                          })
                        }
                        className="p-2.5 rounded-xl bg-[#eef7ff] hover:bg-[#009ee2] text-[#009ee2] hover:text-white border border-sky-200 transition-colors cursor-pointer"
                        title={t.projects.inquireSimilar}
                      >
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
