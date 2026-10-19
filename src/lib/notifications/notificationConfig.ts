/**
 * HARD GROUP - NOTIFICATION PROVIDER & APPROVED RECIPIENTS CONFIGURATION
 * 
 * Manages routing rules for approved lead recipients per sector
 * and verifies server-side provider integrations.
 */

import { ApprovedRecipient, NotificationChannel, NotificationProviderConfig } from './notificationTypes';

/**
 * DEFAULT APPROVED RECIPIENT REGISTRY PER SECTOR
 */
export const DEFAULT_APPROVED_RECIPIENTS: ApprovedRecipient[] = [
  // Real Estate Sector Approved Recipients
  { email: 'sales@hardgroup.sa', name: 'Real Estate Sales Team', role: 'Sales Desk', sectorScope: 'realestate', isActive: true },
  { email: 'realestate-leads@hardgroup.sa', name: 'Real Estate Operations', role: 'Lead Manager', sectorScope: 'realestate', isActive: true },

  // HVAC Sector Approved Recipients
  { email: 'hvac-leads@hardgroup.sa', name: 'HVAC Service Desk', role: 'HVAC Dispatcher', sectorScope: 'hvac', isActive: true },
  { email: 'maintenance@hardgroup.sa', name: 'Maintenance Operations', role: 'Lead Manager', sectorScope: 'hvac', isActive: true },

  // Construction Sector Approved Recipients
  { email: 'projects@hardgroup.sa', name: 'Construction Estimating', role: 'Project Manager', sectorScope: 'construction', isActive: true },
  { email: 'construction-leads@hardgroup.sa', name: 'Construction Sales Desk', role: 'Sales Lead', sectorScope: 'construction', isActive: true },

  // Portal / Group General Approved Recipients
  { email: 'info@hardgroup.sa', name: 'HARD Executive Office', role: 'General Desk', sectorScope: 'global', isActive: true },
  { email: 'leads-admin@hardgroup.sa', name: 'Central Lead Desk', role: 'Lead Manager', sectorScope: 'global', isActive: true },
];

/**
 * Resolves active approved email recipients for a given sector and form type
 */
export function getApprovedRecipients(sector: string, _formType?: string): string[] {
  const normalizedSector = (sector || 'global').toLowerCase();

  const sectorRecipients = DEFAULT_APPROVED_RECIPIENTS.filter(
    (r) => r.isActive && (r.sectorScope === normalizedSector || r.sectorScope === 'global')
  ).map((r) => r.email);

  // Return unique email list
  const uniqueList = Array.from(new Set(sectorRecipients));
  return uniqueList.length > 0 ? uniqueList : ['info@hardgroup.sa'];
}

/**
 * Inspects server-side provider configuration and active API keys.
 * Credentials remain server-side and are NEVER simulated.
 */
export function getProviderConfig(channel: NotificationChannel): NotificationProviderConfig {
  // Check process.env (Server-side Node environment) or Vite env variables
  const env = typeof process !== 'undefined' && process.env ? process.env : (import.meta as any).env || {};

  if (channel === 'webhook') {
    const webhookUrl = env.NOTIFICATION_WEBHOOK_URL || env.VITE_NOTIFICATION_WEBHOOK_URL || '';
    const isConfigured = Boolean(webhookUrl && webhookUrl.startsWith('http'));
    return {
      channel: 'webhook',
      providerName: isConfigured ? 'Custom Server Webhook' : 'HTTP Webhook Endpoint',
      isConfigured,
      endpointUrl: webhookUrl || undefined,
      hasApiKey: Boolean(env.NOTIFICATION_WEBHOOK_SECRET),
    };
  }

  if (channel === 'email') {
    const apiKey = env.SENDGRID_API_KEY || env.RESEND_API_KEY || env.POSTMARK_API_KEY || '';
    const smtpHost = env.SMTP_HOST || '';
    const isConfigured = Boolean(apiKey || smtpHost);
    let providerName = 'Unconfigured SMTP/Email Gateway';
    if (env.SENDGRID_API_KEY) providerName = 'SendGrid Mail API';
    else if (env.RESEND_API_KEY) providerName = 'Resend Mail API';
    else if (env.POSTMARK_API_KEY) providerName = 'Postmark API';
    else if (smtpHost) providerName = `SMTP (${smtpHost})`;

    return {
      channel: 'email',
      providerName,
      isConfigured,
      hasApiKey: Boolean(apiKey),
    };
  }

  if (channel === 'whatsapp') {
    const waToken = env.WHATSAPP_API_TOKEN || env.TWILIO_AUTH_TOKEN || '';
    const waPhoneId = env.WHATSAPP_PHONE_ID || env.TWILIO_PHONE_NUMBER || '';
    const isConfigured = Boolean(waToken && waPhoneId);

    return {
      channel: 'whatsapp',
      providerName: isConfigured ? 'Meta WhatsApp Cloud API' : 'WhatsApp Business Gateway',
      isConfigured,
      hasApiKey: Boolean(waToken),
    };
  }

  return {
    channel,
    providerName: 'Unknown Provider',
    isConfigured: false,
    hasApiKey: false,
  };
}
