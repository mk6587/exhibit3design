/**
 * Token Refresh Client
 * HTTP client for calling refresh-auth-token endpoint with retry logic
 */

const REFRESH_ENDPOINT = 'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/refresh-auth-token';
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export interface RefreshTokenResponse {
  token: string;
  expiresAt: number;
  userId: string;
}

/**
 * Refresh authentication token
 * @throws 'UNAUTHORIZED' if user is logged out
 * @throws Error for other failures after retries
 */
export async function refreshToken(currentToken: string): Promise<RefreshTokenResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[TokenRefresh] Attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await fetch(REFRESH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle unauthorized (user logged out) - no retry
      if (response.status === 401) {
        console.error('[TokenRefresh] Unauthorized - user logged out');
        throw 'UNAUTHORIZED';
      }

      // Handle other errors with retry
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.token || !data.expiresAt) {
        throw new Error('Invalid response from refresh endpoint');
      }

      console.log('[TokenRefresh] Success', {
        expiresAt: new Date(data.expiresAt).toISOString(),
        userId: data.userId
      });

      return data;

    } catch (error) {
      // Don't retry on UNAUTHORIZED
      if (error === 'UNAUTHORIZED') {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[TokenRefresh] Attempt ${attempt} failed:`, lastError.message);

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
        console.log(`[TokenRefresh] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Token refresh failed after all retries');
}
