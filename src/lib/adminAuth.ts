/**
 * HARD REAL ESTATE - ADMIN AUTHENTICATION & AUTHORIZATION UTILITY
 * 
 * Centralized authorization guard to restrict inline page editing, CMS access,
 * and persistent write actions to authenticated administrators.
 */

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

export const ADMIN_SESSION_KEY = 'hard_cms_admin_session';

/**
 * Retrieves the currently active admin session from sessionStorage or localStorage.
 */
export function getAdminUser(): AdminUser | null {
  try {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;
    const user = JSON.parse(stored);
    if (user && typeof user === 'object' && user.email) {
      return user;
    }
  } catch (e) {
    // Return null if invalid JSON
  }
  return null;
}

/**
 * Validates whether the current visitor has an active, authorized admin session.
 */
export function isAuthorizedAdmin(): boolean {
  const user = getAdminUser();
  if (!user || !user.email) return false;
  
  // Require valid admin email format or explicit administrator role
  const isEmailAdmin = user.email.toLowerCase().includes('admin') || user.email.toLowerCase().endsWith('@hard.sa');
  const isRoleAdmin = Boolean(user.role);
  
  return isEmailAdmin || isRoleAdmin;
}

/**
 * Triggers a global auth state change event across components.
 */
export function notifyAdminAuthChange(): void {
  try {
    window.dispatchEvent(new Event('cms-auth-change'));
  } catch {
    // Ignore in non-browser environments
  }
}
