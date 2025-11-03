import { supabase } from '@/integrations/supabase/client';

const AI_STUDIO_URL = 'https://ai.exhibit3design.com';

/**
 * Navigates to AI Studio with authentication token
 * Calls the auth-postmessage edge function to get JWT token
 * Navigates in the same window to AI Studio with the token
 * @param queryParams - Optional query parameters to append (e.g., "?service=rotate-360")
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  try {
    // Call the auth-postmessage edge function to get JWT
    const { data, error } = await supabase.functions.invoke('auth-postmessage', {
      body: {
        userId,
        email
      }
    });

    if (error) throw error;
    if (!data?.token) throw new Error('No token received');
    
    // Build the AI Studio URL with token
    const separator = queryParams?.includes('?') ? '&' : '?';
    const params = queryParams || '';
    const url = `${AI_STUDIO_URL}${params}${separator}token=${encodeURIComponent(data.token)}`;
    
    // Navigate to AI Studio in the same window
    window.location.href = url;
  } catch (error) {
    console.error('Error navigating to AI Studio:', error);
    throw new Error('Failed to authenticate with AI Studio');
  }
}
