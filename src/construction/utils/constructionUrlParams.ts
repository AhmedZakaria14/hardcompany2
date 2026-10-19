import { ConstructionProjectCategory } from '../types';

export const VALID_CONSTRUCTION_CATEGORIES: ConstructionProjectCategory[] = [
  'all',
  'residential',
  'commercial',
  'industrial',
  'finishing',
];

export interface ParsedConstructionUrl {
  projectId: string | null;
  category: ConstructionProjectCategory;
  search: string;
  isCMS: boolean;
  hasExplicitProjectsPath: boolean;
}

/**
 * Parses construction page URLs to extract selected project ID, filters, and section state.
 * Supports:
 * - Direct paths: /construction/projects/:id or /construction/project/:id
 * - Query parameter: /construction?project=:id or /construction/projects?project=:id
 * - Filter query parameters: ?category=residential&search=Riyadh
 * - Section hash: #projects
 */
export function parseConstructionUrl(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
  searchStr: string = typeof window !== 'undefined' ? window.location.search : '',
  hashStr: string = typeof window !== 'undefined' ? window.location.hash : ''
): ParsedConstructionUrl {
  const normPath = (pathname || '').toLowerCase().replace(/\/+$/, '');
  const searchParams = new URLSearchParams(searchStr || '');
  const cleanHash = (hashStr || '').replace(/^#\/?/, '').toLowerCase();

  let projectId: string | null = null;
  let isCMS = false;
  let hasExplicitProjectsPath = false;

  // Check CMS
  if (normPath.endsWith('/cms') || cleanHash === 'cms' || cleanHash === 'construction/cms') {
    isCMS = true;
  }

  // Check explicit /construction/projects list route
  if (normPath === '/construction/projects' || normPath === '/construction/project') {
    hasExplicitProjectsPath = true;
  }

  // Check project ID in pathname:
  // /construction/projects/:id or /construction/project/:id
  const projectsPrefix = '/construction/projects/';
  const projectPrefix = '/construction/project/';

  if (normPath.startsWith(projectsPrefix)) {
    const rawId = (pathname || '').substring(projectsPrefix.length).replace(/\/+$/, '');
    if (rawId && rawId !== 'cms') {
      try {
        projectId = decodeURIComponent(rawId);
      } catch {
        projectId = rawId;
      }
    }
  } else if (normPath.startsWith(projectPrefix)) {
    const rawId = (pathname || '').substring(projectPrefix.length).replace(/\/+$/, '');
    if (rawId && rawId !== 'cms') {
      try {
        projectId = decodeURIComponent(rawId);
      } catch {
        projectId = rawId;
      }
    }
  }

  // Check query parameter fallback (e.g. ?project=hard-proj-01 or ?id=hard-proj-01)
  if (!projectId) {
    const qProject = searchParams.get('project') || searchParams.get('projectId') || searchParams.get('id');
    if (qProject) {
      projectId = qProject.trim();
    }
  }

  // Check legacy hash fragment (e.g. #projects/hard-proj-01 or #project/hard-proj-01)
  if (!projectId && (cleanHash.startsWith('projects/') || cleanHash.startsWith('project/'))) {
    const rawId = cleanHash.split('/')[1];
    if (rawId) {
      try {
        projectId = decodeURIComponent(rawId);
      } catch {
        projectId = rawId;
      }
    }
  }

  // Parse category filter
  let category: ConstructionProjectCategory = 'all';
  const rawCat = searchParams.get('category') || searchParams.get('cat');
  if (rawCat && VALID_CONSTRUCTION_CATEGORIES.includes(rawCat.toLowerCase() as ConstructionProjectCategory)) {
    category = rawCat.toLowerCase() as ConstructionProjectCategory;
  }

  // Parse search query
  const rawSearch = searchParams.get('search') || searchParams.get('q') || '';
  const search = rawSearch.trim();

  return {
    projectId,
    category,
    search,
    isCMS,
    hasExplicitProjectsPath,
  };
}

/**
 * Builds the canonical shareable URL for a specific construction project.
 * Preserves active category and search filter state in query parameters.
 */
export function buildConstructionProjectUrl(
  projectId: string,
  filters?: { category?: ConstructionProjectCategory; search?: string }
): string {
  const base = `/construction/projects/${encodeURIComponent(projectId)}`;
  const params = new URLSearchParams();

  if (filters?.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Builds the canonical URL for the construction projects list.
 * Preserves filter state and optionally includes the #projects anchor.
 */
export function buildConstructionListUrl(
  filters?: { category?: ConstructionProjectCategory; search?: string },
  includeAnchor: boolean = false
): string {
  const base = '/construction';
  const params = new URLSearchParams();

  if (filters?.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  const qs = params.toString();
  const pathWithQuery = qs ? `${base}?${qs}` : base;
  return includeAnchor ? `${pathWithQuery}#projects` : pathWithQuery;
}

/**
 * Synchronizes the browser address bar with the project state.
 * Uses history.pushState when navigating into/out of a project, and replaceState
 * when updating filters or slider-like interactions to avoid polluting history.
 */
export function syncConstructionUrl(
  params: {
    projectId: string | null;
    category?: ConstructionProjectCategory;
    search?: string;
    includeAnchor?: boolean;
  },
  options?: { replace?: boolean }
): void {
  if (typeof window === 'undefined') return;

  const targetUrl = params.projectId
    ? buildConstructionProjectUrl(params.projectId, {
        category: params.category,
        search: params.search,
      })
    : buildConstructionListUrl(
        { category: params.category, search: params.search },
        Boolean(params.includeAnchor)
      );

  const currentPathWithSearch = window.location.pathname + window.location.search;
  const currentFullUrl = currentPathWithSearch + (window.location.hash || '');

  if (currentFullUrl === targetUrl || (!params.includeAnchor && currentPathWithSearch === targetUrl)) {
    return;
  }

  const historyState = {
    page: 'construction',
    projectId: params.projectId,
    category: params.category || 'all',
    search: params.search || '',
  };

  if (options?.replace) {
    window.history.replaceState(historyState, '', targetUrl);
  } else {
    window.history.pushState(historyState, '', targetUrl);
  }
}
