import { LocalizedText } from '../../types/firestore-schema';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Allows international or local Saudi numbers (+966..., 05...)
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  return phoneRegex.test(phone.trim());
}

export function validateLocalizedText(text: any, fieldName: string): LocalizedText {
  if (!text || typeof text !== 'object') {
    throw new ValidationError(`Field '${fieldName}' must be a localized object containing 'ar' and 'en' keys`, fieldName);
  }
  const ar = typeof text.ar === 'string' ? text.ar.trim() : '';
  const en = typeof text.en === 'string' ? text.en.trim() : '';

  if (!ar && !en) {
    throw new ValidationError(`Field '${fieldName}' must contain non-empty Arabic or English text`, fieldName);
  }

  return {
    ar: ar || en,
    en: en || ar,
  };
}

export function validateLeadInput(data: Record<string, any>): {
  fullName: string;
  email: string;
  phone: string;
  sector: 'portal' | 'realestate' | 'construction' | 'hvac';
  leadType: string;
  subject?: string;
  message?: string;
  metadata?: Record<string, any>;
} {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Lead submission data must be an object');
  }

  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : typeof data.name === 'string' ? data.name.trim() : '';
  if (!fullName || fullName.length < 2) {
    throw new ValidationError('Full name is required and must be at least 2 characters', 'fullName');
  }

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!isValidEmail(email)) {
    throw new ValidationError('A valid email address is required', 'email');
  }

  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  if (phone && !isValidPhone(phone)) {
    throw new ValidationError('Provided phone number is invalid', 'phone');
  }

  const sector = ['portal', 'realestate', 'construction', 'hvac'].includes(data.sector)
    ? data.sector
    : 'portal';

  const leadType = typeof data.leadType === 'string' ? data.leadType : typeof data.inquiry_type === 'string' ? data.inquiry_type : 'general_inquiry';

  return {
    fullName,
    email,
    phone: phone || 'N/A',
    sector,
    leadType,
    subject: typeof data.subject === 'string' ? data.subject.trim() : undefined,
    message: typeof data.message === 'string' ? data.message.trim() : undefined,
    metadata: typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {},
  };
}

export function validateAppointmentInput(data: Record<string, any>): {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sector: 'portal' | 'realestate' | 'construction' | 'hvac';
  preferredDate: string;
  preferredTimeSlot: string;
  locationType: 'onsite' | 'office' | 'virtual';
  targetId?: string;
} {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Appointment request payload must be an object');
  }

  const clientName = typeof data.clientName === 'string' ? data.clientName.trim() : typeof data.name === 'string' ? data.name.trim() : '';
  if (!clientName || clientName.length < 2) {
    throw new ValidationError('Client name is required', 'clientName');
  }

  const clientEmail = typeof data.clientEmail === 'string' ? data.clientEmail.trim() : typeof data.email === 'string' ? data.email.trim() : '';
  if (!isValidEmail(clientEmail)) {
    throw new ValidationError('A valid client email is required', 'clientEmail');
  }

  const clientPhone = typeof data.clientPhone === 'string' ? data.clientPhone.trim() : typeof data.phone === 'string' ? data.phone.trim() : '';
  if (!clientPhone) {
    throw new ValidationError('Client phone number is required', 'clientPhone');
  }

  const preferredDate = typeof data.preferredDate === 'string' ? data.preferredDate.trim() : new Date().toISOString().split('T')[0];
  const preferredTimeSlot = typeof data.preferredTimeSlot === 'string' ? data.preferredTimeSlot.trim() : 'Morning (9 AM - 12 PM)';
  const sector = ['portal', 'realestate', 'construction', 'hvac'].includes(data.sector) ? data.sector : 'realestate';
  const locationType = ['onsite', 'office', 'virtual'].includes(data.locationType) ? data.locationType : 'onsite';

  return {
    clientName,
    clientEmail,
    clientPhone,
    sector,
    preferredDate,
    preferredTimeSlot,
    locationType,
    targetId: typeof data.targetId === 'string' ? data.targetId : undefined,
  };
}

export function validatePropertyInput(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Property payload must be an object');
  }
  validateLocalizedText(data.title, 'title');
  if (typeof data.price !== 'number' || isNaN(data.price) || data.price < 0) {
    throw new ValidationError('Property price must be a non-negative number', 'price');
  }
  if (!data.propertyType) {
    throw new ValidationError('Property type is required', 'propertyType');
  }
}

export function validateProjectInput(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Project payload must be an object');
  }
  validateLocalizedText(data.title, 'title');
  if (!data.category) {
    throw new ValidationError('Project category is required', 'category');
  }
}

export function validateArticleInput(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Article payload must be an object');
  }
  validateLocalizedText(data.title, 'title');
  validateLocalizedText(data.content, 'content');
  if (!data.slug || typeof data.slug !== 'string') {
    throw new ValidationError('Article slug is required', 'slug');
  }
}

export function validateServiceInput(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Service payload must be an object');
  }
  validateLocalizedText(data.title, 'title');
  if (!data.sector) {
    throw new ValidationError('Service sector is required', 'sector');
  }
}

export function validateAdminProfileInput(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Admin profile payload must be an object');
  }
  if (!data.uid || typeof data.uid !== 'string') {
    throw new ValidationError('Admin UID is required', 'uid');
  }
  if (!isValidEmail(data.email)) {
    throw new ValidationError('Valid email address is required', 'email');
  }
  if (!['super_admin', 'publisher', 'content_editor', 'lead_manager'].includes(data.role)) {
    throw new ValidationError('Invalid admin role specified', 'role');
  }
  if (!Array.isArray(data.allowedSectors) || data.allowedSectors.length === 0) {
    throw new ValidationError('At least one sector permission must be assigned', 'allowedSectors');
  }
}

export function validateSubscriberInput(data: Record<string, any>): { email: string; source: string } {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Subscriber input must be an object');
  }
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!isValidEmail(email)) {
    throw new ValidationError('A valid email address is required', 'email');
  }
  const source = typeof data.source === 'string' ? data.source.trim() : 'Website Footer';
  return { email, source };
}
