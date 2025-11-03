import { supabase } from '@/integrations/supabase/client';

const AI_STUDIO_URL = 'https://ai.exhibit3design.com';

/**
 * Opens AI Studio in a new tab with JWT authentication token
 * Calls the auth-postmessage edge function to get JWT token
 * @param queryParams - Optional query parameters to append (e.g., "?service=rotate-360")
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  try {
    // Call the auth-postmessage edge function to get JWT token
    const { data, error } = await supabase.functions.invoke('auth-postmessage', {
      body: {
        userId,
        email
      }
    });

    if (error) throw error;
    if (!data?.token) throw new Error('No token received');
    
    // Build the AI Studio URL with JWT token
    const separator = queryParams?.includes('?') ? '&' : '?';
    const params = queryParams || '';
    const url = `${AI_STUDIO_URL}${params}${separator}token=${encodeURIComponent(data.token)}`;
    
    // Open AI Studio in a new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error opening AI Studio:', error);
    throw new Error('Failed to authenticate with AI Studio');
  }
}
