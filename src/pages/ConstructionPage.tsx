import React, { useState, useEffect } from 'react';
import { Language, PageId } from '../types';
import { ConstructionProvider, useConstruction } from '../construction/context/ConstructionContext';
import { Navbar } from '../construction/components/Navbar';
import { Hero } from '../construction/components/Hero';
import { AboutSection } from '../construction/components/AboutSection';
import { ProjectsSection } from '../construction/components/ProjectsSection';
import { ServicesSection } from '../construction/components/ServicesSection';
import { ContactSection } from '../construction/components/ContactSection';
import { Footer } from '../construction/components/Footer';
import { CostEstimatorModal } from '../construction/components/CostEstimatorModal';
import { QuoteModal } from '../construction/components/QuoteModal';
import { ProjectDetailModal } from '../construction/components/ProjectDetailModal';
import { FloatingWidgets } from '../construction/components/FloatingWidgets';
import { getPageTitle, updateDocumentTitle } from '../lib/pageTitles';
import { SectorNav } from '../components/layout/SectorNav';

interface ConstructionPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (page: PageId) => void;
}

function ConstructionPageInner({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { language, selectedProjectForModal, unknownProjectId } = useConstruction();

  // Synchronize document title based on construction state
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    const isProjectList =
      pathname === '/construction/projects' || pathname === '/construction/project';

    const title = getPageTitle({
      page: 'construction',
      language,
      constructionProjectTitle: selectedProjectForModal
        ? {
            ar: selectedProjectForModal.titleAr,
            en: selectedProjectForModal.titleEn,
          }
        : null,
      isConstructionUnknownProject: !!unknownProjectId,
      isConstructionProjectList:
        !selectedProjectForModal && !unknownProjectId && isProjectList,
    });

    updateDocumentTitle(title);
  }, [language, selectedProjectForModal, unknownProjectId]);

  // Listen for route/hash changes (genuine section anchors like #services, #projects)
  useEffect(() => {
    const handleUrlState = () => {
      const pathname = window.location.pathname.toLowerCase();
      const rawHash = window.location.hash.toLowerCase();
      const hash = rawHash.replace(/^#\/?/, '');

      if (pathname.endsWith('/cms') || hash === 'cms' || hash === 'construction/cms') {
        // Redirect legacy construction CMS URL to canonical admin dashboard
        onNavigate('admin');
      } else {
        // Clean duplicate route hash #construction if present
        if (hash === 'construction') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else if (hash) {
          // Genuine section anchor (e.g. #services, #about, #projects, #contact)
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (pathname === '/construction/projects' || pathname === '/construction/project') {
          // Direct entry to project list route: scroll to projects section
          const el = document.getElementById('projects');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    const timer = setTimeout(handleUrlState, 100);
    window.addEventListener('popstate', handleUrlState);
    window.addEventListener('hashchange', handleUrlState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handleUrlState);
      window.removeEventListener('hashchange', handleUrlState);
    };
  }, [onNavigate]);

  const handleOpenCMS = () => {
    onNavigate('admin');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-ui-sans selection:bg-[#009ee2] selection:text-white">
      {/* 0. Global Sector Utility Navigation Bar */}
      <SectorNav
        currentPage="construction"
        language={language}
        onNavigate={onNavigate}
      />

      {/* Sticky Top Header */}
      <Navbar
        onNavigate={onNavigate}
        onOpenCMS={handleOpenCMS}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <ProjectsSection />
        <ServicesSection />
        <ContactSection />
      </main>

      {/* Detailed Corporate Footer */}
      <Footer onNavigate={onNavigate} onOpenCMS={handleOpenCMS} />

      {/* Interactive Global Modals */}
      <CostEstimatorModal />
      <QuoteModal />
      <ProjectDetailModal />

      {/* Floating Speed Actions (WhatsApp & Quick Estimator) */}
      <FloatingWidgets />
    </div>
  );
}

export function ConstructionPage({
  language,
  onLanguageChange,
  onNavigate,
}: ConstructionPageProps) {
  return (
    <ConstructionProvider
      initialLanguage={language}
      onLanguageChangeExternal={onLanguageChange}
    >
      <ConstructionPageInner onNavigate={onNavigate} />
    </ConstructionProvider>
  );
}
