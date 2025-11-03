/**
 * Helper utility for navigating to AI Studio with authentication
 * This file is used on the main site (exhibit3design.com)
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to AI Studio with current session tokens
 * Call this function when user clicks link to AI Studio
 */
export async function navigateToAIStudio(serviceId?: string) {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('[Auth Redirect] Getting session for AI Studio navigation...');
    console.log('[Auth Redirect] Session exists:', !!session);
    console.log('[Auth Redirect] User:', session?.user?.email);
    
    if (error || !session) {
      console.error('[Auth Redirect] No active session:', error);
      // Redirect without tokens - user will need to sign in
      const baseUrl = 'https://ai.exhibit3design.com';
      const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
      window.location.href = url;
      return;
    }
    
    // Extract tokens from session
    const accessToken = session.access_token;
    const refreshToken = session.refresh_token;
    
    if (!accessToken || !refreshToken) {
      console.error('[Auth Redirect] Session missing tokens');
      const baseUrl = 'https://ai.exhibit3design.com';
      const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
      window.location.href = url;
      return;
    }
    
    console.log('[Auth Redirect] Building URL with tokens...');
    console.log('[Auth Redirect] Access token length:', accessToken.length);
    console.log('[Auth Redirect] Refresh token length:', refreshToken.length);
    
    // Build URL with tokens
    const baseUrl = 'https://ai.exhibit3design.com';
    const params = new URLSearchParams();
    params.append('access_token', accessToken);
    params.append('refresh_token', refreshToken);
    if (serviceId) {
      params.append('service', serviceId);
    }
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('[Auth Redirect] Final URL:', finalUrl.substring(0, 100) + '...');
    console.log('[Auth Redirect] Navigating to AI Studio...');
    
    // Navigate to AI Studio with tokens
    window.location.href = finalUrl;
    
  } catch (error) {
    console.error('[Auth Redirect] Error during navigation:', error);
    // Fallback: redirect without tokens
    const baseUrl = 'https://ai.exhibit3design.com';
    const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
    window.location.href = url;
  }
}

/**
 * Legacy function name for backwards compatibility
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  // Extract service from query params if present
  const serviceMatch = queryParams?.match(/[?&]service=([^&]+)/);
  const serviceId = serviceMatch ? serviceMatch[1] : undefined;
  return navigateToAIStudio(serviceId);
}
