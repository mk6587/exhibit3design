import { supabase } from '@/integrations/supabase/client';

const AI_STUDIO_URL = 'https://ai.exhibit3design.com';

/**
 * Opens AI Studio in a new tab with Supabase session tokens
 * @param queryParams - Optional query parameters to append (e.g., "?service=rotate-360")
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  try {
    // Get the current Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session?.access_token) throw new Error('No active session');
    
    // Build the AI Studio URL with session tokens
    const separator = queryParams?.includes('?') ? '&' : '?';
    const params = queryParams || '';
    const url = `${AI_STUDIO_URL}${params}${separator}access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
    
    // Open AI Studio in a new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error opening AI Studio:', error);
    throw new Error('Failed to authenticate with AI Studio');
  }
}
