/**
 * Token API Client
 * Client for checking and managing AI tokens with 401 detection
 */

type UnauthorizedCallback = () => void;

const unauthorizedCallbacks: UnauthorizedCallback[] = [];

/**
 * Register callback for 401 Unauthorized responses
 */
export function onUnauthorized(callback: UnauthorizedCallback): () => void {
  unauthorizedCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = unauthorizedCallbacks.indexOf(callback);
    if (index > -1) {
      unauthorizedCallbacks.splice(index, 1);
    }
  };
}

/**
 * Notify all subscribers of unauthorized response
 */
function notifyUnauthorized(): void {
  console.log('[TokenAPI] Unauthorized detected, notifying subscribers:', unauthorizedCallbacks.length);
  unauthorizedCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('[TokenAPI] Error in unauthorized callback:', error);
    }
  });
}

/**
 * Check AI token balance
 */
export async function checkAITokens(jwtToken: string): Promise<{
  hasTokens: boolean;
  tokensUsed: number;
  tokensRemaining: number;
  tokensBalance: number;
  tokensLimit: number;
}> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/check-ai-tokens',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Detect 401 Unauthorized
    if (response.status === 401) {
      console.error('[TokenAPI] 401 Unauthorized on checkAITokens');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Failed to check tokens: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[TokenAPI] Error checking tokens:', error);
    throw error;
  }
}

/**
 * Increment AI tokens
 */
export async function incrementAITokens(jwtToken: string): Promise<void> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/increment-ai-tokens',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Detect 401 Unauthorized
    if (response.status === 401) {
      console.error('[TokenAPI] 401 Unauthorized on incrementAITokens');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Failed to increment tokens: ${response.status}`);
    }
  } catch (error) {
    console.error('[TokenAPI] Error incrementing tokens:', error);
    throw error;
  }
}
