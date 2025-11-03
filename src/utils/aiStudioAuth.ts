import { supabase } from '@/integrations/supabase/client';

const AI_STUDIO_URL = 'https://ai.exhibit3design.com';

/**
 * Opens AI Studio in a new tab with Supabase session tokens
 * @param queryParams - Optional query parameters to append (e.g., "?service=rotate-360")
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  try {
    // Get the current Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token && session?.refresh_token) {
      // User is authenticated - pass tokens to AI Studio
      const url = new URL(AI_STUDIO_URL);
      if (queryParams) {
        // Add any query params from the queryParams string
        const params = new URLSearchParams(queryParams.replace(/^\?/, ''));
        params.forEach((value, key) => url.searchParams.set(key, value));
      }
      url.searchParams.set('access_token', session.access_token);
      url.searchParams.set('refresh_token', session.refresh_token);
      window.open(url.toString(), '_blank');
    } else {
      // User not authenticated - open AI Studio without tokens
      const url = queryParams 
        ? `${AI_STUDIO_URL}${queryParams}`
        : AI_STUDIO_URL;
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Error opening AI Studio:', error);
    throw new Error('Failed to authenticate with AI Studio');
  }
}
