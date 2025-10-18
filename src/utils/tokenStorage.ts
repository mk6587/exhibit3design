/**
 * Token Storage Module
 * Manages JWT token and metadata persistence in localStorage
 */

const TOKEN_KEY = 'ai_auth_token';
const TOKEN_METADATA_KEY = 'ai_auth_token_metadata';

interface TokenMetadata {
  expiresAt: number;      // Unix timestamp (ms)
  lastRefresh: number;    // Unix timestamp (ms)
  refreshCount: number;   // Total refresh count
}

/**
 * Save token and metadata atomically
 */
export function saveTokenWithMetadata(token: string, expiresAt: number): void {
  const metadata: TokenMetadata = {
    expiresAt,
    lastRefresh: Date.now(),
    refreshCount: (getTokenMetadata()?.refreshCount || 0) + 1
  };

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('[TokenStorage] Failed to save token:', error);
    throw new Error('Failed to save authentication token');
  }
}

/**
 * Get current token
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Get token metadata
 */
export function getTokenMetadata(): TokenMetadata | null {
  try {
    const metadata = localStorage.getItem(TOKEN_METADATA_KEY);
    if (!metadata) return null;
    return JSON.parse(metadata);
  } catch (error) {
    console.error('[TokenStorage] Failed to retrieve metadata:', error);
    return null;
  }
}

/**
 * Clear all token data
 */
export function clearTokenStorage(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_METADATA_KEY);
  } catch (error) {
    console.error('[TokenStorage] Failed to clear token:', error);
  }
}

/**
 * Check if token should be refreshed (<10 minutes remaining)
 */
export function shouldRefreshToken(): boolean {
  const metadata = getTokenMetadata();
  if (!metadata) return false;

  const REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  const timeRemaining = metadata.expiresAt - Date.now();
  
  return timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD;
}

/**
 * Get time until token expiration (milliseconds)
 */
export function getTimeUntilExpiration(): number {
  const metadata = getTokenMetadata();
  if (!metadata) return 0;

  return Math.max(0, metadata.expiresAt - Date.now());
}

/**
 * Check if minimum interval has passed since last refresh
 */
export function canRefreshNow(): boolean {
  const metadata = getTokenMetadata();
  if (!metadata) return true;

  const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const timeSinceLastRefresh = Date.now() - metadata.lastRefresh;
  
  return timeSinceLastRefresh >= MIN_REFRESH_INTERVAL;
}
