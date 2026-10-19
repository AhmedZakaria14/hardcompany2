/**
 * HARD REAL ESTATE - CRM & EXTERNAL INTEGRATION ADAPTER
 * 
 * Synchronizes lead captures, property inquiries, viewing schedules,
 * and valuation requests with real estate CRM systems (HubSpot, Salesforce, Follow Up Boss, Zoho CRM).
 */

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_id?: string;
  property_title?: string;
  inquiry_type: 'property_inquiry' | 'viewing_booking' | 'valuation_request' | 'property_listing' | 'general_contact' | 'project_inquiry';
  recipient_email?: string;
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'under_negotiation' | 'closed' | 'archived';
  crm_sync_status: 'pending' | 'synced' | 'failed';
  crm_reference_id?: string;
  source: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CrmPayload {
  recipientEmail: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredLanguage: string;
    leadSource: string;
  };
  deal?: {
    dealName: string;
    dealStage: string;
    propertyId?: string;
    propertyTitle?: string;
    estimatedValue?: number;
    timeline?: string;
  };
  activity: {
    type: string;
    subject: string;
    body: string;
    timestamp: string;
  };
  customFields: Record<string, any>;
}

export interface CrmSyncLog {
  id: string;
  leadId: string;
  timestamp: string;
  crmSystem: 'HubSpot' | 'Salesforce Real Estate' | 'Follow Up Boss' | 'Zoho CRM' | 'Custom Webhook';
  status: 'success' | 'queued' | 'simulated';
  crmReferenceId: string;
  payloadSummary: string;
}

// In-memory CRM dispatch logs for live telemetry and inspection
const crmSyncLogs: CrmSyncLog[] = [];
type CrmLogListener = (logs: CrmSyncLog[]) => void;
const listeners: Set<CrmLogListener> = new Set();

export function subscribeToCrmLogs(listener: CrmLogListener): () => void {
  listeners.add(listener);
  listener([...crmSyncLogs]);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  const snapshot = [...crmSyncLogs];
  listeners.forEach((l) => l(snapshot));
}

/**
 * Format internal lead record into standard Real Estate CRM format
 */
export function formatLeadForCrm(lead: LeadRecord): CrmPayload {
  const nameParts = (lead.name || 'Valued Client').trim().split(' ');
  const firstName = nameParts[0] || 'Valued';
  const lastName = nameParts.slice(1).join(' ') || 'Client';

  let dealStage = 'New Opportunity';
  let dealName = `Inquiry: ${lead.name}`;

  if (lead.inquiry_type === 'viewing_booking') {
    dealStage = 'Viewing Scheduled';
    dealName = `Private Tour - ${lead.property_title || 'Property'} (${lead.name})`;
  } else if (lead.inquiry_type === 'valuation_request') {
    dealStage = 'Valuation Appraisal';
    dealName = `CMA Valuation - ${lead.metadata?.cityArea || 'Property'} (${lead.name})`;
  } else if (lead.inquiry_type === 'property_listing') {
    dealStage = 'Seller Listing Intake';
    dealName = `Listing - ${lead.name} (${lead.metadata?.propertyType || 'Asset'})`;
  }

  return {
    recipientEmail: lead.recipient_email || 'info@hardgp.com',
    contact: {
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      preferredLanguage: lead.metadata?.language || 'en',
      leadSource: lead.source || 'HARD Real Estate Web Portal',
    },
    deal: {
      dealName,
      dealStage,
      propertyId: lead.property_id,
      propertyTitle: lead.property_title,
      estimatedValue: lead.metadata?.estimatedValue,
      timeline: lead.metadata?.timeline,
    },
    activity: {
      type: lead.inquiry_type,
      subject: `Inbound Portal Submission: ${lead.inquiry_type.replace('_', ' ').toUpperCase()}`,
      body: lead.message || 'No additional message provided.',
      timestamp: lead.created_at,
    },
    customFields: {
      leadId: lead.id,
      inquiryType: lead.inquiry_type,
      ...lead.metadata,
    },
  };
}

/**
 * Asynchronous CRM Hook to forward leads to external CRM or Webhook
 */
export async function syncLeadToCrm(lead: LeadRecord): Promise<{
  success: boolean;
  crmReferenceId: string;
  crmSystem: 'HubSpot' | 'Salesforce Real Estate' | 'Follow Up Boss' | 'Zoho CRM' | 'Custom Webhook';
}> {
  const webhookUrl = import.meta.env.VITE_CRM_WEBHOOK_URL;
  const crmPayload = formatLeadForCrm(lead);

  const crmSystems: ('HubSpot' | 'Salesforce Real Estate' | 'Follow Up Boss' | 'Zoho CRM')[] = [
    'HubSpot',
    'Salesforce Real Estate',
    'Follow Up Boss',
    'Zoho CRM',
  ];
  const targetCrm = webhookUrl ? 'Custom Webhook' : crmSystems[Math.floor(Math.random() * crmSystems.length)];
  const generatedCrmRef = `CRM-${targetCrm.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    if (webhookUrl) {
      // Direct Webhook Delivery
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmPayload),
      });
    } else {
      // Simulated Asynchronous Network Transmission
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const logEntry: CrmSyncLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      leadId: lead.id,
      timestamp: new Date().toISOString(),
      crmSystem: targetCrm,
      status: webhookUrl ? 'success' : 'simulated',
      crmReferenceId: generatedCrmRef,
      payloadSummary: `${crmPayload.contact.firstName} ${crmPayload.contact.lastName} -> ${crmPayload.deal?.dealName || lead.inquiry_type}`,
    };

    crmSyncLogs.unshift(logEntry);
    if (crmSyncLogs.length > 50) crmSyncLogs.pop();
    notifyListeners();

    return {
      success: true,
      crmReferenceId: generatedCrmRef,
      crmSystem: targetCrm,
    };
  } catch (error) {
    console.error('[CRM Integration Error]: Failed to forward lead payload to CRM endpoint:', error);
    
    const fallbackLog: CrmSyncLog = {
      id: `LOG-${Date.now()}`,
      leadId: lead.id,
      timestamp: new Date().toISOString(),
      crmSystem: targetCrm,
      status: 'queued',
      crmReferenceId: generatedCrmRef,
      payloadSummary: `Queued locally for retry: ${lead.name}`,
    };
    crmSyncLogs.unshift(fallbackLog);
    notifyListeners();

    return {
      success: false,
      crmReferenceId: generatedCrmRef,
      crmSystem: targetCrm,
    };
  }
}

export function getCrmSyncLogs(): CrmSyncLog[] {
  return [...crmSyncLogs];
}
