import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const SSOSync = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    // Only run when we have a user and session
    if (!user || !session?.access_token) return;

    console.log('🔄 SSO Sync: Setting up cross-domain sync for user:', user.email);

    // Function to handle messages from designers portal
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin is from designers portal
      if (event.origin !== 'https://designers.exhibit3design.com') {
        return;
      }

      console.log('📨 SSO Sync: Received message from designers portal:', event.data);

      // Handle login status check request
      if (event.data.type === 'SSO_STATUS_CHECK') {
        try {
          // Call our SSO status check function
          const response = await fetch(`https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/sso-status-check`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          // Send response back to designers portal
          event.source?.postMessage({
            type: 'SSO_STATUS_RESPONSE',
            requestId: event.data.requestId,
            ...data
          }, { targetOrigin: event.origin });

          console.log('✅ SSO Sync: Sent status response to designers portal');
        } catch (error) {
          console.error('❌ SSO Sync: Failed to check status:', error);
          event.source?.postMessage({
            type: 'SSO_STATUS_RESPONSE',
            requestId: event.data.requestId,
            authenticated: false,
            error: 'Failed to check authentication status'
          }, { targetOrigin: event.origin });
        }
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage);
    
    // Broadcast login status to any listening designers portal windows
    const broadcastLoginStatus = () => {
      try {
        // Try to communicate with designers portal if it's open
        const designersPortal = window.open('', 'designers-portal-sso-check');
        if (designersPortal && !designersPortal.closed) {
          designersPortal.postMessage({
            type: 'USER_LOGIN_STATUS',
            authenticated: true,
            user: {
              id: user.id,
              email: user.email
            }
          }, { targetOrigin: 'https://designers.exhibit3design.com' });
          console.log('📤 SSO Sync: Broadcasted login status to designers portal');
        }
      } catch (error) {
        // Silently fail - this is expected if no designers portal is open
      }
    };

    // Broadcast immediately and then every 30 seconds
    broadcastLoginStatus();
    const interval = setInterval(broadcastLoginStatus, 30000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [user, session?.access_token]);

  // This component doesn't render anything
  return null;
};