/**
 * HARD REAL ESTATE - SUPABASE CLIENT & REST ADAPTER
 * 
 * Provides connectivity to Supabase PostgreSQL or seamlessly
 * falls back to persistent reactive local storage with instant hydration.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../../types';
import { LeadRecord } from '../integrations/crmSync';
import { mockProperties, mockProjects, mockBlogPosts, mockTestimonials, mockSubscribers } from '../../data/mockData';

// Clean and normalize the Supabase URL
const DEFAULT_SUPABASE_URL = 'https://uybfzgpxlwkatqucmlpu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmZ6Z3B4bHdrYXRxdWNtbHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTYxNzYsImV4cCI6MjEwMzY5MjE3Nn0.3KjXILa6q6weNZWvFzElj1Fzre8IlgXTwkUzfui1cOo';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http')
);

// Instantiate the official Supabase JavaScript SDK client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const PROPERTIES_STORAGE_KEY = 'hard_real_estate_properties_v2';
const LEADS_STORAGE_KEY = 'hard_real_estate_leads_v2';
const PROJECTS_STORAGE_KEY = 'hard_real_estate_projects_v2';
const BLOG_STORAGE_KEY = 'hard_real_estate_blog_v2';
const TESTIMONIALS_STORAGE_KEY = 'hard_real_estate_testimonials_v2';
const SUBSCRIBERS_STORAGE_KEY = 'hard_real_estate_subscribers_v2';

/**
 * Direct Supabase REST fetch helper
 */
async function supabaseFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers: Record<string, string> = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[Supabase REST Error] ${res.status} ${res.statusText}:`, errText);
      throw new Error(`Supabase API responded with status ${res.status}: ${errText}`);
    }
    return await res.json() as T;
  } catch (err) {
    console.warn('[Supabase REST Warning]:', err);
    throw err;
  }
}

/**
 * Local Storage Persistence Layer
 */
export function getStoredProperties(): Property[] {
  try {
    const data = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Property) => {
          if (p.agent && (p.agent.whatsapp === '966501234567' || !p.agent.whatsapp)) {
            return { ...p, agent: { ...p.agent, whatsapp: '966556125711' } };
          }
          return p;
        });
      }
    }
  } catch (e) {
    console.error('Error reading properties from storage', e);
  }
  // Initialize with rich dataset
  saveStoredProperties(mockProperties);
  return mockProperties;
}

export function saveStoredProperties(properties: Property[]): void {
  try {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  } catch (e) {
    console.error('Error saving properties to storage', e);
  }
}

export function getStoredLeads(): LeadRecord[] {
  try {
    const data = localStorage.getItem(LEADS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading leads from storage', e);
  }
  return [];
}

export function saveStoredLeads(leads: LeadRecord[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Error saving leads to storage', e);
  }
}

export function getStoredProjects(): Project[] {
  try {
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading projects from storage', e);
  }
  saveStoredProjects(mockProjects);
  return mockProjects;
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to storage', e);
  }
}

export function getStoredBlogPosts(): BlogPost[] {
  try {
    const data = localStorage.getItem(BLOG_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading blog posts from storage', e);
  }
  saveStoredBlogPosts(mockBlogPosts);
  return mockBlogPosts;
}

export function saveStoredBlogPosts(posts: BlogPost[]): void {
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error saving blog posts to storage', e);
  }
}

export function getStoredTestimonials(): Testimonial[] {
  try {
    const data = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading testimonials from storage', e);
  }
  saveStoredTestimonials(mockTestimonials);
  return mockTestimonials;
}

export function saveStoredTestimonials(testimonials: Testimonial[]): void {
  try {
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonials));
  } catch (e) {
    console.error('Error saving testimonials to storage', e);
  }
}

export function getStoredSubscribers(): JoinListSubscriber[] {
  try {
    const data = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading subscribers from storage', e);
  }
  saveStoredSubscribers(mockSubscribers);
  return mockSubscribers;
}

export function saveStoredSubscribers(subscribers: JoinListSubscriber[]): void {
  try {
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
  } catch (e) {
    console.error('Error saving subscribers to storage', e);
  }
}

export { supabaseFetch };
