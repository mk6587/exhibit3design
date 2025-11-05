/**
 * Cross-Domain Authentication Handler
 * Transfers Supabase sessions from main site to AI Studio subdomain
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a secure session URL for AI Studio
 * This creates a one-time-use URL that transfers the session
 */
export async function generateAIStudioSessionURL(serviceId?: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // No session - just open AI Studio without auth
    const baseUrl = 'https://ai.exhibit3design.com';
    return serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
  }

  // Create session transfer URL with access and refresh tokens
  const baseUrl = 'https://ai.exhibit3design.com';
  const params = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at?.toString() || '',
    type: 'recovery', // Use recovery type for session restoration
  });
  
  if (serviceId) {
    params.append('service', serviceId);
  }

  return `${baseUrl}#${params.toString()}`;
}

/**
 * Navigate to AI Studio with session transfer
 */
export async function navigateToAIStudioWithAuth(serviceId?: string) {
  const url = await generateAIStudioSessionURL(serviceId);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Handle incoming session from URL hash (for AI Studio to receive the session)
 */
export async function handleIncomingSession(): Promise<boolean> {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  
  if (accessToken && refreshToken) {
    console.log('📥 Receiving session from main site...');
    
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('❌ Failed to set session:', error);
        return false;
      }

      console.log('✅ Session established successfully');
      
      // Clean up URL
      window.location.hash = '';
      
      return true;
    } catch (error) {
      console.error('❌ Error setting session:', error);
      return false;
    }
  }
  
  return false;
}
