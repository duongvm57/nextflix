/**
 * Navigation debugging utilities
 * This file contains utilities to help debug navigation issues
 */

/**
 * Log navigation state to help debug navigation issues
 * Only logs in development mode
 */
export function logNavigationState(prefix: string = 'NAVIGATION') {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  const targetUrl = sessionStorage.getItem('targetUrl');
  const lastUrl = sessionStorage.getItem('lastUrl');
  const navigationMethod = sessionStorage.getItem('navigationMethod');
  const referrer = document.referrer;

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.group(`[${prefix}] Navigation State`);
    console.log('Current path:', currentPath);
    console.log('Target URL:', targetUrl);
    console.log('Last URL:', lastUrl);
    console.log('Navigation method:', navigationMethod);
    console.log('Referrer:', referrer);
    console.log('Full URL:', window.location.href);
    console.groupEnd();
  }

  return {
    currentPath,
    targetUrl,
    lastUrl,
    navigationMethod,
    referrer,
    fullUrl: window.location.href,
  };
}

/**
 * Check if we're on the home page but should be somewhere else
 * Returns true if we should redirect
 */
export function shouldRedirectFromHome(): boolean {
  if (typeof window === 'undefined') return false;

  const currentPath = window.location.pathname;
  const targetUrl = sessionStorage.getItem('targetUrl');

  // If we're on the home page but should be on another page
  return currentPath === '/' && !!targetUrl && targetUrl !== '/';
}

/**
 * Get the URL we should redirect to
 */
export function getRedirectTarget(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('targetUrl');
}

/**
 * Clear navigation state
 */
export function clearNavigationState(): void {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('lastUrl');
  sessionStorage.removeItem('targetUrl');
  sessionStorage.removeItem('navigationMethod');
  sessionStorage.removeItem('currentPath');
}

/**
 * Store navigation state
 */
export function storeNavigationState(targetUrl: string): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  sessionStorage.setItem('lastUrl', currentPath);
  sessionStorage.setItem('targetUrl', targetUrl);
}
