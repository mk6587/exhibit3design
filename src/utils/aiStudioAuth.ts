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
 */
export async function openAIStudio(userId: string, email: string) {
  try {
    const token = await generateAIStudioToken(userId, email);
    const url = `${AI_STUDIO_URL}?token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error opening AI Studio:', error);
    throw error;
  }
}
