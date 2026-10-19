/**
 * HARD REAL ESTATE & GROUP - DYNAMIC SITEMAP GENERATOR
 * 
 * Generates dynamic HTML & XML sitemaps strictly from valid published routes and entities.
 * Excludes drafts, unlisted items, and non-indexable routes.
 * Enforces canonical URLs consistent with domain configuration.
 */

import { Property, Project, BlogPost } from '../../types';
import { PageSeoConfig, getStoredSeoConfigs, sanitizeSeoString } from './seoManager';

export interface SitemapEntry {
  url: string;
  path: string;
  title: string;
  lastModified: string;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  type: 'page' | 'property' | 'project' | 'article';
}

/**
 * Generates dynamic array of published sitemap entries.
 * Strictly excludes drafts and non-indexable pages.
 */
export function buildPublicSitemapEntries(
  properties: Property[],
  projects: Project[],
  blogPosts: BlogPost[],
  domainOrigin?: string
): SitemapEntry[] {
  const origin = domainOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://ai-hard-real-estate.vercel.app');
  const seoConfigs = getStoredSeoConfigs();
  const entries: SitemapEntry[] = [];
  const now = new Date().toISOString().slice(0, 10);

  // 1. Static Published Pages
  const staticPages: { key: string; path: string; priority: number; changeFreq: SitemapEntry['changeFreq'] }[] = [
    { key: 'portal', path: '/', priority: 1.0, changeFreq: 'daily' },
    { key: 'home', path: '/realestate', priority: 0.9, changeFreq: 'daily' },
    { key: 'properties', path: '/realestate/properties', priority: 0.9, changeFreq: 'daily' },
    { key: 'projects', path: '/realestate/projects', priority: 0.8, changeFreq: 'weekly' },
    { key: 'marketing', path: '/realestate/marketing', priority: 0.7, changeFreq: 'monthly' },
    { key: 'about', path: '/realestate/about', priority: 0.6, changeFreq: 'monthly' },
    { key: 'blog', path: '/realestate/blog', priority: 0.8, changeFreq: 'weekly' },
    { key: 'contact', path: '/realestate/contact', priority: 0.7, changeFreq: 'monthly' },
    { key: 'construction', path: '/construction', priority: 0.8, changeFreq: 'weekly' },
    { key: 'hvac', path: '/hvac', priority: 0.8, changeFreq: 'weekly' },
    { key: 'privacy', path: '/privacy', priority: 0.4, changeFreq: 'yearly' },
    { key: 'terms', path: '/terms', priority: 0.4, changeFreq: 'yearly' },
  ];

  staticPages.forEach((pg) => {
    const config = seoConfigs[pg.key];
    // Skip if page is non-indexable
    if (config && config.indexable === false) return;

    entries.push({
      url: `${origin}${pg.path}`,
      path: pg.path,
      title: sanitizeSeoString(config ? config.title.en : pg.key),
      lastModified: now,
      changeFreq: pg.changeFreq,
      priority: pg.priority,
      type: 'page',
    });
  });

  // 2. Published Properties (STRICT DRAFT EXCLUSION)
  (properties || []).forEach((prop) => {
    // Exclude if draft or archived
    if (
      prop.status === ('draft' as any) ||
      (prop as any).publicationStatus === 'draft' ||
      (prop as any).publicationStatus === 'archived'
    ) {
      return;
    }

    const propPath = `/realestate/properties?id=${encodeURIComponent(prop.id)}`;
    entries.push({
      url: `${origin}${propPath}`,
      path: propPath,
      title: sanitizeSeoString(prop.title?.en || prop.title?.ar || 'Property Listing'),
      lastModified: now,
      changeFreq: 'weekly',
      priority: prop.featured ? 0.8 : 0.7,
      type: 'property',
    });
  });

  // 3. Published Off-Plan / Construction Projects (STRICT DRAFT EXCLUSION)
  (projects || []).forEach((proj) => {
    if (
      proj.status === ('draft' as any) ||
      (proj as any).publicationStatus === 'draft' ||
      (proj as any).publicationStatus === 'archived'
    ) {
      return;
    }

    const projPath = `/realestate/projects?id=${encodeURIComponent(proj.id)}`;
    entries.push({
      url: `${origin}${projPath}`,
      path: projPath,
      title: sanitizeSeoString(proj.title?.en || proj.title?.ar || 'Master Development'),
      lastModified: now,
      changeFreq: 'weekly',
      priority: 0.8,
      type: 'project',
    });
  });

  // 4. Published Blog Articles (STRICT DRAFT EXCLUSION)
  (blogPosts || []).forEach((post) => {
    if (post.status !== 'published') {
      return;
    }

    const postPath = `/realestate/blog?id=${encodeURIComponent(post.id)}`;
    entries.push({
      url: `${origin}${postPath}`,
      path: postPath,
      title: sanitizeSeoString(post.title?.en || post.title?.ar || 'Market Insight'),
      lastModified: post.date || now,
      changeFreq: 'monthly',
      priority: 0.6,
      type: 'article',
    });
  });

  return entries;
}

/**
 * Generates compliant XML sitemap string (sitemap.xml format)
 */
export function generateSitemapXml(
  properties: Property[],
  projects: Project[],
  blogPosts: BlogPost[],
  domainOrigin?: string
): string {
  const entries = buildPublicSitemapEntries(properties, projects, blogPosts, domainOrigin);

  const xmlUrls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}
