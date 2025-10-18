/**
 * useBackgroundAuth Hook
 * React integration layer for background authentication service
 */

import { useEffect } from 'react';
import { backgroundAuthService } from '@/services/backgroundAuthService';

interface UseBackgroundAuthProps {
  isAuthenticated: boolean;
  jwtToken: string | null;
  onTokenRefreshed: (newToken: string) => void;
  onAuthLost: () => void;
}

export function useBackgroundAuth({
  isAuthenticated,
  jwtToken,
  onTokenRefreshed,
  onAuthLost
}: UseBackgroundAuthProps) {
  useEffect(() => {
    // Only run if authenticated and have token
    if (!isAuthenticated || !jwtToken) {
      console.log('[useBackgroundAuth] Not authenticated, skipping');
      return;
    }

    console.log('[useBackgroundAuth] Registering callbacks and starting service');

    // Register callbacks
    const unsubscribeAuthLost = backgroundAuthService.onAuthLost(onAuthLost);
    const unsubscribeTokenRefresh = backgroundAuthService.onTokenRefreshed(onTokenRefreshed);

    // Start background service
    backgroundAuthService.start();

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[useBackgroundAuth] Cleaning up');
      unsubscribeAuthLost();
      unsubscribeTokenRefresh();
      backgroundAuthService.stop();
    };
  }, [isAuthenticated, jwtToken, onTokenRefreshed, onAuthLost]);

  // Return manual verification function
  return {
    verifyAuthNow: () => backgroundAuthService.verifyNow()
  };
}
