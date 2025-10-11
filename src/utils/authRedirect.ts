// Utility functions for handling authentication redirects
const REDIRECT_KEY = 'auth_redirect_url';

/**
 * Store the redirect URL in session storage
 */
export const setAuthRedirect = (url: string) => {
  sessionStorage.setItem(REDIRECT_KEY, url);
};

/**
 * Get and clear the stored redirect URL
 */
export const getAndClearAuthRedirect = (): string | null => {
  const url = sessionStorage.getItem(REDIRECT_KEY);
  if (url) {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
  return url;
};

/**
 * Clear the stored redirect URL without returning it
 */
export const clearAuthRedirect = () => {
  sessionStorage.removeItem(REDIRECT_KEY);
};

/**
 * Handle navigation to a protected external link
 * If user is authenticated, navigate immediately
 * If not authenticated, store the URL and redirect to auth page
 */
export const handleProtectedExternalLink = (
  url: string,
  isAuthenticated: boolean,
  navigateToAuth: () => void
) => {
  if (isAuthenticated) {
    // User is logged in, navigate directly
    window.location.href = url;
  } else {
    // User not logged in, store URL and redirect to auth
    setAuthRedirect(url);
    navigateToAuth();
  }
};
