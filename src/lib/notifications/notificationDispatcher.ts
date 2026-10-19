/**
 * HARD GROUP - SERVER-SIDE NOTIFICATION DISPATCHER
 * 
 * Executes real dispatching requests to approved recipients using configured providers.
 * Strictly enforces:
 * - Credentials remain server-side.
 * - No fake simulations of email or WhatsApp delivery if no integration is configured.
 */

import { FormSubmissionPayload } from '../forms/formSubmissionService';
import { getProviderConfig } from './notificationConfig';
import { NotificationChannel, NotificationStatus } from './notificationTypes';

export interface DispatchAttemptResult {
  success: boolean;
  status: NotificationStatus;
  providerName: string;
  responseMessage?: string;
  errorMessage?: string;
}

/**
 * Dispatches notification payload to approved recipients via a specific channel
 */
export async function dispatchNotificationToProvider(
  channel: NotificationChannel,
  approvedRecipients: string[],
  payload: FormSubmissionPayload & { trackingCode: string; leadId: string }
): Promise<DispatchAttemptResult> {
  const provider = getProviderConfig(channel);

  // RULE: Do NOT simulate email delivery or send WhatsApp messages without an approved, configured integration.
  if (!provider.isConfigured) {
    return {
      success: false,
      status: 'unconfigured',
      providerName: provider.providerName,
      errorMessage: `Notification provider [${channel}] is not configured on the server. Please configure credentials (e.g. NOTIFICATION_WEBHOOK_URL, SMTP_HOST, or WHATSAPP_API_TOKEN) in server settings.`,
    };
  }

  // Handle Webhook Dispatch
  if (channel === 'webhook' && provider.endpointUrl) {
    try {
      const bodyPayload = {
        event: 'customer_request.created',
        leadId: payload.leadId,
        trackingCode: payload.trackingCode,
        formType: payload.formType,
        sector: payload.sector,
        approvedRecipients,
        customer: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          preferredContactMethod: payload.preferredContactMethod || 'whatsapp',
        },
        message: payload.message || '',
        details: payload.details || {},
        submittedAt: new Date().toISOString(),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(provider.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HARD-Notification-Event': 'customer_request.created',
          'X-HARD-Lead-ID': payload.leadId,
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          success: true,
          status: 'delivered',
          providerName: provider.providerName,
          responseMessage: `Successfully delivered to HTTP endpoint (${response.status} ${response.statusText}).`,
        };
      } else {
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          status: 'failed',
          providerName: provider.providerName,
          errorMessage: `Webhook returned HTTP error status ${response.status}: ${errText.slice(0, 150) || response.statusText}`,
        };
      }
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      return {
        success: false,
        status: 'failed',
        providerName: provider.providerName,
        errorMessage: isAbort
          ? 'Webhook dispatch timed out after 8000ms.'
          : `Network error during webhook dispatch: ${err?.message || String(err)}`,
      };
    }
  }

  // Handle Real Email Provider API / SMTP Dispatch
  if (channel === 'email') {
    try {
      // If server API endpoint exists, invoke server-side mailer API
      const env = typeof process !== 'undefined' && process.env ? process.env : (import.meta as any).env || {};
      const sendGridKey = env.SENDGRID_API_KEY;
      const resendKey = env.RESEND_API_KEY;

      if (resendKey) {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HARD Group Notifications <notifications@hardgroup.sa>',
            to: approvedRecipients,
            subject: `[${payload.trackingCode}] New ${payload.formType.replace('_', ' ')} request from ${payload.name}`,
            html: `
              <h2>New Inbound Request [${payload.trackingCode}]</h2>
              <p><strong>Customer:</strong> ${payload.name} (&lt;${payload.email}&gt;)</p>
              <p><strong>Phone:</strong> ${payload.phone || 'N/A'}</p>
              <p><strong>Sector:</strong> ${payload.sector}</p>
              <p><strong>Message:</strong> ${payload.message || 'None'}</p>
            `,
          }),
        });

        if (resp.ok) {
          return {
            success: true,
            status: 'delivered',
            providerName: provider.providerName,
            responseMessage: `Email dispatched via Resend API to ${approvedRecipients.join(', ')}.`,
          };
        } else {
          const text = await resp.text();
          return {
            success: false,
            status: 'failed',
            providerName: provider.providerName,
            errorMessage: `Resend API error: ${text.slice(0, 150)}`,
          };
        }
      }

      if (sendGridKey) {
        const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: approvedRecipients.map((e) => ({ email: e })) }],
            from: { email: 'notifications@hardgroup.sa', name: 'HARD Group Notifications' },
            subject: `[${payload.trackingCode}] New ${payload.formType.replace('_', ' ')} request from ${payload.name}`,
            content: [
              {
                type: 'text/plain',
                value: `New Inbound Lead\nTracking: ${payload.trackingCode}\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nMessage: ${payload.message}`,
              },
            ],
          }),
        });

        if (resp.ok || resp.status === 202) {
          return {
            success: true,
            status: 'delivered',
            providerName: provider.providerName,
            responseMessage: `Email dispatched via SendGrid API to ${approvedRecipients.join(', ')}.`,
          };
        } else {
          const text = await resp.text();
          return {
            success: false,
            status: 'failed',
            providerName: provider.providerName,
            errorMessage: `SendGrid API error ${resp.status}: ${text.slice(0, 150)}`,
          };
        }
      }

      return {
        success: false,
        status: 'unconfigured',
        providerName: provider.providerName,
        errorMessage: 'Email provider credentials not configured in environment (missing SENDGRID_API_KEY or RESEND_API_KEY).',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'failed',
        providerName: provider.providerName,
        errorMessage: `Email provider exception: ${err?.message || String(err)}`,
      };
    }
  }

  // Handle WhatsApp Provider API Dispatch
  if (channel === 'whatsapp') {
    try {
      const env = typeof process !== 'undefined' && process.env ? process.env : (import.meta as any).env || {};
      const waToken = env.WHATSAPP_API_TOKEN;
      const waPhoneId = env.WHATSAPP_PHONE_ID;

      if (waToken && waPhoneId) {
        const resp = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: approvedRecipients[0] || '966500000000',
            type: 'text',
            text: {
              body: `*HARD Group New Lead Alert [${payload.trackingCode}]*\nCustomer: ${payload.name}\nForm: ${payload.formType}\nPhone: ${payload.phone}`,
            },
          }),
        });

        if (resp.ok) {
          return {
            success: true,
            status: 'delivered',
            providerName: provider.providerName,
            responseMessage: `WhatsApp message dispatched via Meta API.`,
          };
        } else {
          const text = await resp.text();
          return {
            success: false,
            status: 'failed',
            providerName: provider.providerName,
            errorMessage: `WhatsApp Meta API error: ${text.slice(0, 150)}`,
          };
        }
      }

      return {
        success: false,
        status: 'unconfigured',
        providerName: provider.providerName,
        errorMessage: 'WhatsApp API credentials not configured (missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_ID).',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'failed',
        providerName: provider.providerName,
        errorMessage: `WhatsApp dispatch error: ${err?.message || String(err)}`,
      };
    }
  }

  return {
    success: false,
    status: 'unconfigured',
    providerName: provider.providerName,
    errorMessage: `Unsupported notification channel: ${channel}`,
  };
}
