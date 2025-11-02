import { supabase } from '@/integrations/supabase/client';

const AI_STUDIO_URL = 'https://ai.exhibit3design.com';

/**
 * Generates a JWT token for cross-project authentication
 * Token expires in 1 hour
 */
export async function generateAIStudioToken(userId: string, email: string): Promise<string> {
  try {
    // Get the JWT token from the edge function
    const { data, error } = await supabase.functions.invoke('generate-ai-token', {
      body: { userId, email }
    });

    if (error) throw error;
    if (!data?.token) throw new Error('No token received');
    
    return data.token;
  } catch (error) {
    console.error('Error generating AI studio token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Opens AI Studio with authentication token
 * Opens the window immediately to avoid popup blockers, then updates the URL
 * @param queryParams - Optional query parameters to append (e.g., "?service=rotate-360")
 */
export async function openAIStudio(userId: string, email: string, queryParams?: string) {
  // Open window immediately (synchronously) to avoid popup blockers
  const newWindow = window.open('about:blank', '_blank');
  
  if (!newWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }

  try {
    const token = await generateAIStudioToken(userId, email);
    const separator = queryParams?.includes('?') ? '&' : '?';
    const params = queryParams || '';
    const url = `${AI_STUDIO_URL}${params}${separator}token=${encodeURIComponent(token)}`;
    newWindow.location.href = url;
  } catch (error) {
    console.error('Error opening AI Studio:', error);
    newWindow.close();
    throw error;
  }
}
