/**
 * HARD GROUP - CMS DASHBOARD REAL DATABASE METRICS SERVICE
 * 
 * Aggregates real Firestore metrics:
 * - Pending inquiries & customer request statuses
 * - Real-time appointment statuses (pending, confirmed, rescheduled, completed, cancelled)
 * - Live published content vs active CMS drafts in `cms_drafts`
 * - Sector-specific inventory (Residential, Commercial, Off-Plan, Mansions)
 * - Clear date range filtering (All Time, 30 Days, 90 Days, Year-to-Date)
 * - Strict discipline: Never labels requests as sales, conversions, or revenue without verified events.
 */

import { collection, getDocs, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../../types';
import { LeadRecord } from '../integrations/crmSync';
import { FirestoreAppointment } from '../appointments/appointmentService';

export type MetricDateRange = 'all' | '30d' | '90d' | 'ytd';

export interface SectorMetrics {
  sectorId: string;
  labelEn: string;
  labelAr: string;
  count: number;
  listedSarValue: number;
  unitsCount?: number;
  availableCount?: number;
}

export interface DashboardMetricsSummary {
  dateRange: MetricDateRange;
  
  // Requests & Leads
  totalLeads: number;
  pendingLeads: number; // status 'new' or 'under_negotiation'
  contactedLeads: number; // 'contacted' or 'qualified'
  archivedLeads: number;
  leadsInDateRange: number;

  // Appointments
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  rescheduledAppointments: number;
  cancelledAppointments: number;
  appointmentsInDateRange: number;

  // Content & Drafts
  publishedProperties: number;
  publishedProjects: number;
  publishedBlogPosts: number;
  publishedTestimonials: number;
  activeSubscribers: number;
  totalCmsDrafts: number;
  totalRevisionSnapshots: number;

  // Sector Breakdown
  sectors: SectorMetrics[];
  totalListedSarValuation: number;
}

/**
 * Filter date by selected date range helper
 */
function isWithinDateRange(createdAtIsoOrYmd: string | undefined, range: MetricDateRange): boolean {
  if (!createdAtIsoOrYmd || range === 'all') return true;
  
  const date = new Date(createdAtIsoOrYmd);
  if (isNaN(date.getTime())) return true;

  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

  if (range === '30d') return diffDays <= 30;
  if (range === '90d') return diffDays <= 90;
  if (range === 'ytd') return date.getFullYear() === now.getFullYear();

  return true;
}

/**
 * Fetch total CMS draft count directly from `cms_drafts` Firestore collection
 */
export async function fetchCmsDraftsCount(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'cms_drafts'));
    return snap.size;
  } catch (err) {
    console.warn('Unable to fetch cms_drafts count:', err);
    return 0;
  }
}

/**
 * Fetch total revision snapshots count directly from `revisions` Firestore collection
 */
export async function fetchRevisionsCount(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'revisions'));
    return snap.size;
  } catch (err) {
    console.warn('Unable to fetch revisions count:', err);
    return 0;
  }
}

/**
 * Subscribe to real-time appointments summary from Firestore appointment_requests
 */
export function subscribeAppointmentsMetrics(
  onUpdate: (appointments: FirestoreAppointment[]) => void
): () => void {
  try {
    const q = query(collection(db, 'appointment_requests'));
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          trackingCode: data.trackingCode || `APPT-${doc.id.slice(0, 6)}`,
          appointmentType: data.appointmentType || 'property_viewing',
          sector: data.sector || 'realestate',
          preferredDate: data.preferredDate || new Date().toISOString().split('T')[0],
          preferredTimeWindow: data.preferredTimeWindow || '10:00 - 12:00',
          localTimezone: data.localTimezone || 'Asia/Riyadh',
          isConfirmed: Boolean(data.isConfirmed || data.status === 'confirmed'),
          confirmedDate: data.confirmedDate,
          confirmedTimeWindow: data.confirmedTimeWindow,
          referenceType: data.referenceType || 'property',
          referenceId: data.referenceId || null,
          referenceTitle: data.referenceTitle || null,
          customerName: data.customerName || data.clientName || 'Client',
          customerEmail: data.customerEmail || data.clientEmail || '',
          customerPhone: data.customerPhone || data.clientPhone || '',
          customerNotes: data.customerNotes || data.notes || '',
          status: (data.status || 'pending') as any,
          auditTrail: data.auditTrail || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirestoreAppointment;
      });
      onUpdate(appointments);
    }, (err) => {
      console.warn('Appointments listener fallback:', err);
      onUpdate([]);
    });
  } catch (err) {
    console.warn('Failed setting up appointments listener:', err);
    onUpdate([]);
    return () => {};
  }
}

/**
 * Subscribe to real-time subscribers from Firestore
 */
export function subscribeSubscribersMetrics(
  onUpdate: (subscribers: JoinListSubscriber[]) => void
): () => void {
  try {
    const q = query(collection(db, 'subscribers'));
    return onSnapshot(q, (snapshot) => {
      const subscribers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JoinListSubscriber[];
      onUpdate(subscribers);
    }, (err) => {
      console.warn('Subscribers listener fallback:', err);
      onUpdate([]);
    });
  } catch (err) {
    console.warn('Failed setting up subscribers listener:', err);
    onUpdate([]);
    return () => {};
  }
}

/**
 * Computes complete database-derived metric summary from raw entities
 */
export function computeDashboardMetrics(params: {
  properties: Property[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  leads: LeadRecord[];
  appointments: FirestoreAppointment[];
  draftsCount: number;
  revisionsCount: number;
  dateRange: MetricDateRange;
}): DashboardMetricsSummary {
  const {
    properties,
    projects,
    blogPosts,
    testimonials,
    subscribers,
    leads,
    appointments,
    draftsCount,
    revisionsCount,
    dateRange,
  } = params;

  // Filter Leads by Range
  const leadsFiltered = leads.filter(l => isWithinDateRange(l.created_at, dateRange));
  const pendingLeads = leads.filter(l => l.status === 'new' || l.status === 'under_negotiation' || !l.status).length;
  const contactedLeads = leads.filter(l => l.status === 'contacted' || l.status === 'qualified').length;
  const archivedLeads = leads.filter(l => l.status === 'archived' || l.status === 'closed').length;

  // Filter Appointments by Range
  const appointmentsFiltered = appointments.filter(a => isWithinDateRange(a.preferredDate || (a as any).createdAt, dateRange));
  const pendingAppointments = appointments.filter(a => a.status === 'pending' || !a.status).length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const rescheduledAppointments = appointments.filter(a => a.status === 'rescheduled').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  // Content Counts
  const publishedProperties = properties.length;
  const publishedProjects = projects.length;
  const publishedBlogPosts = blogPosts.filter(b => (b.status || 'published') === 'published').length;
  const publishedTestimonials = testimonials.length;
  const activeSubscribers = subscribers.filter(s => s.status === 'active' || !s.status).length;

  // Sector Breakdown
  // 1. Residential Portfolio
  const residentialProps = properties.filter(p => p.type === 'villa' || p.type === 'apartment' || p.type === 'penthouse' || p.type === 'townhouse');
  const residentialValuation = residentialProps.reduce((sum, p) => sum + (p.price?.sar || 0), 0);

  // 2. Commercial Real Estate
  const commercialProps = properties.filter(p => p.type === 'commercial');
  const commercialValuation = commercialProps.reduce((sum, p) => sum + (p.price?.sar || 0), 0);

  // 3. Ultra Luxury Mansions
  const mansionProps = properties.filter(p => p.type === 'mansion');
  const mansionValuation = mansionProps.reduce((sum, p) => sum + (p.price?.sar || 0), 0);

  // 4. Off-Plan & Development Masterplans
  const offPlanProps = properties.filter(p => p.status === 'off-plan');
  const projectUnits = projects.reduce((sum, pr) => sum + (pr.unitsTotal || 0), 0);
  const offPlanValuation = offPlanProps.reduce((sum, p) => sum + (p.price?.sar || 0), 0);

  const totalListedSarValuation = properties.reduce((sum, p) => sum + (p.price?.sar || 0), 0);

  const sectors: SectorMetrics[] = [
    {
      sectorId: 'residential_real_estate',
      labelEn: 'Residential Portfolio',
      labelAr: 'المحفظة السكنية',
      count: residentialProps.length,
      listedSarValue: residentialValuation,
    },
    {
      sectorId: 'commercial_real_estate',
      labelEn: 'Commercial & Corporate',
      labelAr: 'المحفظة التجارية والمكاتب',
      count: commercialProps.length,
      listedSarValue: commercialValuation,
    },
    {
      sectorId: 'ultra_luxury_mansions',
      labelEn: 'Luxury Mansions',
      labelAr: 'القصر والقصور الفاخرة',
      count: mansionProps.length,
      listedSarValue: mansionValuation,
    },
    {
      sectorId: 'development_masterplans',
      labelEn: 'Off-Plan & Masterplans',
      labelAr: 'المشاريع والتطوير المخطط',
      count: projects.length,
      listedSarValue: offPlanValuation,
      unitsCount: projectUnits,
    },
  ];

  return {
    dateRange,
    totalLeads: leads.length,
    pendingLeads,
    contactedLeads,
    archivedLeads,
    leadsInDateRange: leadsFiltered.length,

    totalAppointments: appointments.length,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    rescheduledAppointments,
    cancelledAppointments,
    appointmentsInDateRange: appointmentsFiltered.length,

    publishedProperties,
    publishedProjects,
    publishedBlogPosts,
    publishedTestimonials,
    activeSubscribers,
    totalCmsDrafts: draftsCount,
    totalRevisionSnapshots: revisionsCount,

    sectors,
    totalListedSarValuation,
  };
}
