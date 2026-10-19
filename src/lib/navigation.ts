import React from 'react';
import { PageId } from '../types';

/**
 * Returns the authoritative real URL destination for any PageId
 */
export function getPageHref(page: PageId, queryParams?: string): string {
  let base = '/';
  switch (page) {
    case 'portal':
      base = '/';
      break;
    case 'home':
      base = '/realestate';
      break;
    case 'construction':
      base = '/construction';
      break;
    case 'hvac':
      base = '/hvac';
      break;
    case 'admin':
      base = '/realestate/admin';
      break;
    case 'not-found':
      base = '/';
      break;
    default:
      base = `/realestate/${page}`;
      break;
  }
  if (queryParams) {
    const prefix = queryParams.startsWith('?') ? '' : '?';
    return `${base}${prefix}${queryParams}`;
  }
  return base;
}

/**
 * Intercepts left-clicks on semantic <a> tags to run client-side SPA navigation,
 * while preserving native browser behaviors (Ctrl/Cmd-click, Shift-click, middle-click, right-click).
 */
export function handleSemanticClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  onNavigate?: () => void
) {
  // Allow browser native behavior for modified clicks (open in new tab, new window, etc.)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  if (onNavigate) {
    onNavigate();
  }
}
