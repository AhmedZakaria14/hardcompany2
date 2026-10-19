import React, { useState, useEffect } from 'react';
import { Language, PageId, Property, PropertyFilterParams, Project } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MarketingPage } from './pages/MarketingPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { CMSApp } from './cms/CMSApp';
import { GroupPortalDashboard } from './pages/GroupPortalDashboard';
import { ConstructionPage } from './pages/ConstructionPage';
import { HVACPage } from './pages/HVACPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BookViewingModal } from './components/modals/BookViewingModal';
import { ListPropertyModal } from './components/modals/ListPropertyModal';
import { InquiryModal } from './components/modals/InquiryModal';
import { ProjectInquiryModal } from './components/modals/ProjectInquiryModal';
import { FloatingTextEditor } from './components/ui/FloatingTextEditor';
import { DataProvider, useData } from './context/DataContext';
import { TextOverrideProvider } from './context/TextOverrideContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { parsePropertyQueryParams, serializePropertyQueryParams } from './lib/propertyUrlParams';
import { getPageTitle, getPageDescription, updateDocumentTitle } from './lib/pageTitles';
import { getStoredSeoConfigs, applyPageSeoToHead } from './lib/seo/seoManager';
import { PrivacyTermsModal } from './components/modals/PrivacyTermsModal';
import { mockProperties } from './data/mockData';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/**
 * Detects if a URL hash fragment is a copy of a route path or an old SPA route fragment
 * rather than a genuine in-page section ID.
 */
function isRouteDuplicateHash(hash: string, pathname: string): boolean {
  if (!hash) return false;
  const normalizedHash = hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');
  const normalizedPath = pathname.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');

  // Exact duplicate of current path (e.g. /realestate/projects with #realestate/projects)
  if (normalizedHash === normalizedPath) return true;

  // Multi-segment route paths (e.g. realestate/projects, construction/cms, etc.)
  if (
    normalizedHash.startsWith('realestate/') ||
    normalizedHash.startsWith('construction/') ||
    normalizedHash.startsWith('hvac/') ||
    normalizedHash.startsWith('maintenance/')
  ) {
    return true;
  }

  // Exact duplicate of page segment on realestate routes (e.g. /realestate/projects with #projects)
  if (normalizedPath.startsWith('realestate/')) {
    const sub = normalizedPath.substring('realestate/'.length);
    if (normalizedHash === sub || normalizedHash === 'realestate') return true;
  }

  // Standalone route names duplicating the current top-level route
  if (normalizedPath === normalizedHash) {
    return true;
  }
  if (normalizedPath === 'construction' && normalizedHash === 'construction') return true;
  if ((normalizedPath === 'hvac' || normalizedPath === 'maintenance') && (normalizedHash === 'hvac' || normalizedHash === 'maintenance')) return true;
  if (normalizedPath === 'realestate' && normalizedHash === 'realestate') return true;
  if ((normalizedPath === '' || normalizedPath === 'portal') && normalizedHash === 'portal') return true;

  return false;
}

function detectRouteFromLocation(): {
  page: PageId;
  attemptedPath: string;
  filters: PropertyFilterParams | null;
} {
  let rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const rawHash = window.location.hash.toLowerCase();
  const hash = rawHash.replace(/^#\/?/, '');
  const attemptedPath = window.location.pathname;

  let detectedPage: PageId = 'portal';

  // 1. Sector landing pages & specific top-level paths (path-based routing takes precedence)
  if (rawPath === '/construction' || rawPath === '/construction/') {
    detectedPage = 'construction';
  } else if (rawPath.startsWith('/construction/')) {
    const sub = rawPath.substring('/construction/'.length).split('?')[0].replace(/\/+$/, '');
    if (sub === '' || sub === 'cms' || sub === 'projects' || sub === 'project') {
      detectedPage = 'construction';
    } else {
      detectedPage = 'not-found';
    }
  } else if (
    rawPath === '/hvac' ||
    rawPath === '/hvac/' ||
    rawPath === '/maintenance' ||
    rawPath === '/maintenance/'
  ) {
    detectedPage = 'hvac';
  } else if (rawPath.startsWith('/hvac/') || rawPath.startsWith('/maintenance/')) {
    const prefix = rawPath.startsWith('/hvac/') ? '/hvac/' : '/maintenance/';
    const sub = rawPath.substring(prefix.length).split('?')[0].replace(/\/+$/, '');
    if (sub === '' || sub === 'cms') {
      detectedPage = 'hvac';
    } else {
      detectedPage = 'not-found';
    }
  } else if (rawPath === '/admin' || rawPath === '/admin/') {
    detectedPage = 'admin';
  } else if (rawPath.startsWith('/admin/')) {
    const sub = rawPath.substring('/admin/'.length).split('?')[0].replace(/\/+$/, '');
    if (sub === '' || sub === 'cms') {
      detectedPage = 'admin';
    } else {
      detectedPage = 'not-found';
    }
  } else if (rawPath === '/portal') {
    detectedPage = 'portal';
  } else if (rawPath === '/properties' || rawPath === '/properties/') {
    detectedPage = 'properties';
  } else if (rawPath.startsWith('/properties/')) {
    detectedPage = 'property-details';
  } else if (rawPath === '/projects' || rawPath === '/projects/') {
    detectedPage = 'projects';
  } else if (rawPath === '/blog' || rawPath === '/blog/') {
    detectedPage = 'blog';
  } else if (rawPath.startsWith('/blog/')) {
    detectedPage = 'blog';
  } else if (rawPath === '/about' || rawPath === '/about/') {
    detectedPage = 'about';
  } else if (rawPath === '/contact' || rawPath === '/contact/') {
    detectedPage = 'contact';
  } else if (rawPath === '/marketing' || rawPath === '/services') {
    detectedPage = 'marketing';
  } else if (rawPath === '/privacy' || rawPath === '/privacy/') {
    detectedPage = 'privacy';
  } else if (rawPath === '/terms' || rawPath === '/terms/') {
    detectedPage = 'terms';
  } else if (rawPath === '/realestate' || rawPath.startsWith('/realestate/')) {
    let sub = rawPath.substring('/realestate'.length).replace(/^\/+/, '');
    sub = sub.split('?')[0].replace(/\/+$/, '');

    if (sub === '' || sub === 'home') {
      detectedPage = 'home';
    } else if (sub === 'admin' || sub === 'cms') {
      detectedPage = 'admin';
    } else if (sub === 'properties') {
      detectedPage = 'properties';
    } else if (sub === 'projects') {
      detectedPage = 'projects';
    } else if (sub === 'about') {
      detectedPage = 'about';
    } else if (sub === 'contact') {
      detectedPage = 'contact';
    } else if (sub === 'marketing' || sub === 'services') {
      detectedPage = 'marketing';
    } else if (sub === 'blog') {
      detectedPage = 'blog';
    } else if (sub === 'property-details') {
      detectedPage = 'property-details';
    } else {
      detectedPage = 'not-found';
    }
  } else if (rawPath === '' || rawPath === '/') {
    // Root path: check hash for backward compatibility with legacy anchor/hash links
    if (hash === '' || hash === 'portal') {
      detectedPage = 'portal';
    } else if (
      hash === 'admin' ||
      hash === 'cms' ||
      hash === '/admin' ||
      hash === '/cms'
    ) {
      detectedPage = 'admin';
    } else if (
      hash === 'properties' ||
      hash === '/properties'
    ) {
      detectedPage = 'properties';
    } else if (
      hash === 'construction' ||
      hash === '/construction' ||
      hash.startsWith('construction/') ||
      hash.startsWith('/construction')
    ) {
      detectedPage = 'construction';
    } else if (
      hash === 'hvac' ||
      hash === '/hvac' ||
      hash === 'maintenance' ||
      hash === '/maintenance' ||
      hash.startsWith('hvac/') ||
      hash.startsWith('/hvac') ||
      hash.startsWith('maintenance/')
    ) {
      detectedPage = 'hvac';
    } else if (hash.startsWith('realestate')) {
      let sub = hash.substring('realestate'.length).replace(/^\/+/, '');
      sub = sub.split('?')[0].replace(/\/+$/, '');
      if (sub === '' || sub === 'home') {
        detectedPage = 'home';
      } else if (sub === 'properties') {
        detectedPage = 'properties';
      } else if (sub === 'projects') {
        detectedPage = 'projects';
      } else if (sub === 'about') {
        detectedPage = 'about';
      } else if (sub === 'contact') {
        detectedPage = 'contact';
      } else if (sub === 'marketing' || sub === 'services') {
        detectedPage = 'marketing';
      } else if (sub === 'blog') {
        detectedPage = 'blog';
      } else if (sub === 'property-details') {
        detectedPage = 'property-details';
      } else if (sub === 'admin' || sub === 'cms') {
        detectedPage = 'admin';
      } else {
        detectedPage = 'not-found';
      }
    } else {
      detectedPage = 'portal';
    }
  } else {
    detectedPage = 'not-found';
  }

  // Strip duplicate route hash if present
  if (hash && isRouteDuplicateHash(hash, rawPath)) {
    try {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(window.history.state, '', cleanUrl);
    } catch {
      // ignore
    }
  }

  let filters: PropertyFilterParams | null = null;
  if (detectedPage === 'properties') {
    const parsed = parsePropertyQueryParams(window.location.search);
    filters = {
      searchQuery: parsed.searchQuery,
      city: parsed.city,
      type: parsed.type,
      status: parsed.status,
      rentalPeriod: parsed.rentalPeriod,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      bedroom: parsed.bedroom,
      sortBy: parsed.sortBy,
      viewMode: parsed.viewMode,
    };
  }

  return { page: detectedPage, attemptedPath, filters };
}

function AppContent() {
  const [language, setLanguage] = useState<Language>('ar');
  const [initialRoute] = useState(() => detectRouteFromLocation());
  const [currentPage, setCurrentPage] = useState<PageId>(initialRoute.page);
  const [attemptedPath, setAttemptedPath] = useState<string>(initialRoute.attemptedPath);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilterParams | null>(initialRoute.filters);
  const { properties } = useData();

  // Modals state
  const [bookViewingProperty, setBookViewingProperty] = useState<Property | null>(null);
  const [isListPropertyModalOpen, setIsListPropertyModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');
  const [projectInquiryModalOpen, setProjectInquiryModalOpen] = useState(false);
  const [selectedProjectForInquiry, setSelectedProjectForInquiry] = useState<Project | null>(null);

  // Handle URL pathname and hash routing dynamically on navigation events
  useEffect(() => {
    const handleUrlRoute = () => {
      const routeInfo = detectRouteFromLocation();
      setAttemptedPath(routeInfo.attemptedPath);
      setCurrentPage(routeInfo.page);
      if (routeInfo.filters) {
        setPropertyFilters(routeInfo.filters);
      }
    };

    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Synchronize selected property when properties collection or URL query param updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const propId = params.get('id');
    if (propId && properties.length > 0) {
      const match = properties.find((p) => p.id === propId || p.slug === propId);
      if (match) {
        setSelectedProperty(match);
      }
    }
  }, [properties]);

  // Synchronize document dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Synchronize document title and OpenGraph metadata across all sectors and pages
  useEffect(() => {
    const seoConfigs = getStoredSeoConfigs();
    const pageConfig = seoConfigs[currentPage];
    if (pageConfig) {
      applyPageSeoToHead(pageConfig, language);
    } else {
      const titleOptions = {
        page: currentPage,
        language,
        propertyTitle: selectedProperty && selectedProperty.title
          ? {
              ar: typeof selectedProperty.title === 'string'
                ? selectedProperty.title
                : (selectedProperty.title?.ar || selectedProperty.title?.en || ''),
              en: typeof selectedProperty.title === 'string'
                ? selectedProperty.title
                : (selectedProperty.title?.en || selectedProperty.title?.ar || ''),
            }
          : null,
      };
      const title = getPageTitle(titleOptions);
      const description = getPageDescription(titleOptions);
      updateDocumentTitle(title, description);
    }

    // Set 404 HTTP status metadata hints for prerenderers and crawlers when on not-found page
    if (currentPage === 'not-found') {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, follow');

      let prerenderStatusMeta = document.querySelector('meta[name="prerender-status-code"]');
      if (!prerenderStatusMeta) {
        prerenderStatusMeta = document.createElement('meta');
        prerenderStatusMeta.setAttribute('name', 'prerender-status-code');
        document.head.appendChild(prerenderStatusMeta);
      }
      prerenderStatusMeta.setAttribute('content', '404');
    }
  }, [currentPage, language, selectedProperty]);

  const handleNavigate = (page: PageId, filters?: PropertyFilterParams) => {
    if (filters) {
      setPropertyFilters(filters);
    }
    setCurrentPage(page);

    // Update URL bar based on single authoritative pathname
    let newPath = '/';

    if (page === 'portal') {
      newPath = '/';
    } else if (page === 'construction') {
      newPath = '/construction';
    } else if (page === 'hvac') {
      newPath = '/hvac';
    } else if (page === 'home') {
      newPath = '/realestate';
    } else if (page === 'not-found') {
      newPath = window.location.pathname;
    } else if (page === 'properties') {
      const qStr = filters
        ? serializePropertyQueryParams({
            city: filters.city,
            type: filters.type as any,
            status: filters.status as any,
            rentalPeriod: filters.rentalPeriod,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            searchQuery: filters.searchQuery,
            bedroom: filters.bedroom as any,
            sortBy: filters.sortBy as any,
            viewMode: filters.viewMode as any,
          })
        : '';
      newPath = qStr ? `/realestate/properties?${qStr}` : '/realestate/properties';
    } else {
      newPath = `/realestate/${page}`;
    }

    try {
      window.history.pushState({ page }, '', newPath);
    } catch {
      // fallback
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentPage('property-details');
    try {
      window.history.pushState(
        { page: 'property-details', slug: property.slug },
        '',
        `/realestate/property-details?id=${encodeURIComponent(property.id)}`
      );
    } catch {
      // fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBookViewing = (property: Property) => {
    setBookViewingProperty(property);
  };

  const handleOpenInquiryModal = (subject?: string) => {
    setInquirySubject(subject || '');
    setInquiryModalOpen(true);
  };

  const handleOpenProjectInquiryModal = (project: Project) => {
    setSelectedProjectForInquiry(project);
    setProjectInquiryModalOpen(true);
  };

  // 1. Root HARD Group Corporate Multi-Division Dashboard (assigned to /)
  if (currentPage === 'portal') {
    return (
      <ErrorBoundary>
        <GroupPortalDashboard
          language={language}
          onLanguageChange={setLanguage}
          onNavigateToRealEstate={(targetPage = 'home') => handleNavigate(targetPage)}
          onNavigateToConstruction={() => handleNavigate('construction')}
          onNavigateToHVAC={() => handleNavigate('hvac')}
        />
      </ErrorBoundary>
    );
  }

  // 2. HARD Construction Division Page (/construction)
  if (currentPage === 'construction') {
    return (
      <ErrorBoundary>
        <ConstructionPage
          language={language}
          onLanguageChange={setLanguage}
          onNavigate={handleNavigate}
        />
      </ErrorBoundary>
    );
  }

  // 3. HARD HVAC Maintenance Division Page (/hvac or /maintenance)
  if (currentPage === 'hvac') {
    return (
      <ErrorBoundary>
        <HVACPage
          language={language}
          onLanguageChange={setLanguage}
          onNavigatePage={handleNavigate}
        />
      </ErrorBoundary>
    );
  }

  // 3. Dedicated Full-Screen Enterprise CMS Mode (/realestate/admin or /admin)
  if (currentPage === 'admin') {
    return (
      <ErrorBoundary>
        <CMSApp
          onReturnToSite={() => handleNavigate('home')}
          onViewPropertyOnSite={(prop) => handleSelectProperty(prop)}
          language={language}
          onLanguageChange={setLanguage}
        />
      </ErrorBoundary>
    );
  }

  // 3. HARD Real Estate Sub-Website (/realestate)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-ui-sans">
      {/* Global Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
        onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
      />

      {/* Main Page Layout Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
            onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
            onOpenInquiryModal={() => handleOpenInquiryModal('General Inquiry')}
            onOpenProjectInquiryModal={handleOpenProjectInquiryModal}
          />
        )}

        {currentPage === 'properties' && (
          <PropertiesPage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
            initialFilters={propertyFilters}
          />
        )}

        {currentPage === 'property-details' && (
          <PropertyDetailPage
            property={
              selectedProperty ||
              properties.find((p) => p.id === new URLSearchParams(window.location.search).get('id')) ||
              properties[0] ||
              mockProperties[0]
            }
            onBack={() => handleNavigate('properties')}
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            onNavigate={handleNavigate}
            language={language}
            onOpenInquiryModal={handleOpenInquiryModal}
            onOpenProjectInquiryModal={handleOpenProjectInquiryModal}
          />
        )}

        {currentPage === 'marketing' && (
          <MarketingPage
            onNavigate={handleNavigate}
            language={language}
            onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} language={language} />
        )}

        {currentPage === 'blog' && (
          <BlogPage onNavigate={handleNavigate} language={language} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={handleNavigate} language={language} />
        )}

        {currentPage === 'not-found' && (
          <NotFoundPage
            language={language}
            onNavigate={handleNavigate}
            attemptedPath={attemptedPath}
            onLanguageChange={setLanguage}
          />
        )}
      </main>

      {/* Global 4-Column Footer */}
      <Footer onNavigate={handleNavigate} language={language} />

      {/* Floating Developer Text Editor (Centered at Bottom) */}
      <FloatingTextEditor
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Global Dialog Modals */}
      <BookViewingModal
        isOpen={!!bookViewingProperty}
        onClose={() => setBookViewingProperty(null)}
        property={bookViewingProperty}
        language={language}
      />

      <ListPropertyModal
        isOpen={isListPropertyModalOpen}
        onClose={() => setIsListPropertyModalOpen(false)}
        language={language}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        language={language}
        initialSubject={inquirySubject}
      />

      <ProjectInquiryModal
        isOpen={projectInquiryModalOpen}
        onClose={() => {
          setProjectInquiryModalOpen(false);
          setSelectedProjectForInquiry(null);
        }}
        language={language}
        project={selectedProjectForInquiry}
      />

      <PrivacyTermsModal
        isOpen={currentPage === 'privacy' || currentPage === 'terms'}
        onClose={() => handleNavigate('home')}
        language={language}
        initialTab={currentPage === 'terms' ? 'terms' : 'privacy'}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <SiteSettingsProvider>
          <TextOverrideProvider>
            <AppContent />
          </TextOverrideProvider>
        </SiteSettingsProvider>
      </DataProvider>
    </ErrorBoundary>
  );
}
