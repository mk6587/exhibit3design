/**
 * Background Auth Service
 * Orchestrates automatic token refresh and authentication verification
 */

import { refreshToken } from './tokenRefreshClient';
import { getUserBalance } from '@/utils/tokenApi';
import { onUnauthorized } from '@/utils/tokenApi';
import {
  getToken,
  getTokenMetadata,
  saveTokenWithMetadata,
  shouldRefreshToken,
  canRefreshNow,
  clearTokenStorage
} from '@/utils/tokenStorage';

// Configuration
const CHECK_INTERVAL = 3 * 60 * 1000;        // 3 minutes
const REFRESH_THRESHOLD = 10 * 60 * 1000;    // 10 minutes before expiry
const MIN_REFRESH_INTERVAL = 5 * 60 * 1000;  // 5 minutes minimum between refreshes

type AuthLostCallback = () => void;
type TokenRefreshedCallback = (newToken: string) => void;

class BackgroundAuthService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private authLostCallbacks: AuthLostCallback[] = [];
  private tokenRefreshedCallbacks: TokenRefreshedCallback[] = [];
  private unsubscribe401: (() => void) | null = null;

  /**
   * Start background monitoring
   */
  start(): void {
    if (this.isRunning) {
      console.log('[BackgroundAuth] Already running');
      return;
    }

    console.log('[BackgroundAuth] Starting service');
    this.isRunning = true;

    // Subscribe to 401 events from API calls
    this.unsubscribe401 = onUnauthorized(() => {
      console.log('[BackgroundAuth] 401 detected from API call');
      this.handleAuthLost();
    });

    // Start periodic checks
    this.checkInterval = setInterval(() => {
      this.performChecks();
    }, CHECK_INTERVAL);

    // Perform initial check
    this.performChecks();
  }

  /**
   * Stop background monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('[BackgroundAuth] Stopping service');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.unsubscribe401) {
      this.unsubscribe401();
      this.unsubscribe401 = null;
    }
  }

  /**
   * Perform token refresh and auth verification checks
   */
  private async performChecks(): Promise<void> {
    console.log('[BackgroundAuth] Performing checks');

    // Check if token needs refresh
    if (shouldRefreshToken() && canRefreshNow()) {
      await this.attemptTokenRefresh();
    }

    // Verify authentication status
    await this.verifyAuthentication();
  }

  /**
   * Attempt to refresh token
   */
  private async attemptTokenRefresh(): Promise<void> {
    const currentToken = getToken();
    if (!currentToken) {
      console.log('[BackgroundAuth] No token to refresh');
      return;
    }

    const metadata = getTokenMetadata();
    const timeRemaining = metadata ? metadata.expiresAt - Date.now() : 0;
    const minutesRemaining = Math.floor(timeRemaining / 60000);

    console.log(`[BackgroundAuth] Token refresh needed (${minutesRemaining} min remaining)`);

    try {
      const response = await refreshToken(currentToken);
      
      // Save new token atomically
      saveTokenWithMetadata(response.token, response.expiresAt);
      
      console.log('[BackgroundAuth] Token refreshed successfully');
      
      // Notify subscribers
      this.notifyTokenRefreshed(response.token);

    } catch (error) {
      if (error === 'UNAUTHORIZED') {
        console.error('[BackgroundAuth] Unauthorized during refresh');
        this.handleAuthLost();
      } else {
        console.error('[BackgroundAuth] Token refresh failed:', error);
        // Don't trigger auth lost on network errors - will retry next cycle
      }
    }
  }

  /**
   * Verify user is still authenticated
   */
  private async verifyAuthentication(): Promise<void> {
    const currentToken = getToken();
    if (!currentToken) {
      return;
    }

    try {
      await getUserBalance(currentToken);
      console.log('[BackgroundAuth] Auth verification passed');
    } catch (error) {
      // 401 will be caught by onUnauthorized callback
      // Other errors don't necessarily mean auth lost
      console.error('[BackgroundAuth] Auth verification error:', error);
    }
  }

  /**
   * Handle authentication lost
   */
  private handleAuthLost(): void {
    console.log('[BackgroundAuth] Auth lost - cleaning up');
    
    // Clear token storage
    clearTokenStorage();
    
    // Stop service
    this.stop();
    
    // Notify subscribers
    this.notifyAuthLost();
  }

  /**
   * Force immediate verification (for manual triggers)
   */
  async verifyNow(): Promise<void> {
    console.log('[BackgroundAuth] Manual verification triggered');
    await this.verifyAuthentication();
  }

  /**
   * Register callback for auth lost events
   */
  onAuthLost(callback: AuthLostCallback): () => void {
    this.authLostCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authLostCallbacks.indexOf(callback);
      if (index > -1) {
        this.authLostCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register callback for token refreshed events
   */
  onTokenRefreshed(callback: TokenRefreshedCallback): () => void {
    this.tokenRefreshedCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.tokenRefreshedCallbacks.indexOf(callback);
      if (index > -1) {
        this.tokenRefreshedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify auth lost subscribers
   */
  private notifyAuthLost(): void {
    console.log('[BackgroundAuth] Notifying auth lost subscribers:', this.authLostCallbacks.length);
    this.authLostCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[BackgroundAuth] Error in auth lost callback:', error);
      }
    });
  }

  /**
   * Notify token refreshed subscribers
   */
  private notifyTokenRefreshed(newToken: string): void {
    console.log('[BackgroundAuth] Notifying token refresh subscribers:', this.tokenRefreshedCallbacks.length);
    this.tokenRefreshedCallbacks.forEach(callback => {
      try {
        callback(newToken);
      } catch (error) {
        console.error('[BackgroundAuth] Error in token refresh callback:', error);
      }
    });
  }
}

// Export singleton instance
export const backgroundAuthService = new BackgroundAuthService();
