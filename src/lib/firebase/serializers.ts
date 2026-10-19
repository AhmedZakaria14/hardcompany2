import { Timestamp, serverTimestamp } from 'firebase/firestore';

/**
 * Converts a Firestore Timestamp, Date, or string into an ISO string format.
 */
export function toISOString(value: any): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

/**
 * Sanitizes payload object before writing to Firestore.
 * Removes `undefined` values which Firestore rejects, trims string values,
 * and preserves valid objects, arrays, and primitives.
 */
export function sanitizePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};

  Object.entries(data).forEach(([key, val]) => {
    if (val === undefined) {
      return;
    }
    if (val === null) {
      clean[key] = null;
      return;
    }
    if (typeof val === 'string') {
      clean[key] = val.trim();
      return;
    }
    if (Array.isArray(val)) {
      clean[key] = val.map((item) => (typeof item === 'object' && item !== null ? sanitizePayload(item) : item));
      return;
    }
    if (typeof val === 'object' && val.constructor === Object) {
      clean[key] = sanitizePayload(val);
      return;
    }
    clean[key] = val;
  });

  return clean;
}

/**
 * Returns a payload populated with updated server timestamps.
 */
export function withServerTimestamps<T extends Record<string, any>>(
  data: T,
  isCreate = false
): Record<string, any> {
  const sanitized = sanitizePayload(data);
  const nowISO = new Date().toISOString();

  return {
    ...sanitized,
    updatedAt: nowISO,
    ...(isCreate && { createdAt: nowISO }),
    _serverTimestamp: serverTimestamp(),
  };
}
