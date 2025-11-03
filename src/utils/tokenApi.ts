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
 * Increment AI tokens with optional generation details
 */
export async function incrementAITokens(
  jwtToken: string,
  options?: {
    prompt?: string;
    serviceType?: string;
    inputImageUrl?: string;
    outputImageUrl?: string;
  }
): Promise<void> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/increment-ai-tokens',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: options?.prompt || 'AI Generation',
          serviceType: options?.serviceType || 'image_edit',
          inputImageUrl: options?.inputImageUrl || null,
          outputImageUrl: options?.outputImageUrl || null
        })
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

/**
 * Reserve tokens before AI generation (Reserve-Commit Pattern)
 */
export async function reserveTokens(
  jwtToken: string,
  serviceType: string,
  tokensAmount: number
): Promise<{
  success: boolean;
  reservationId?: string;
  newBalance?: number;
  error?: string;
  availableBalance?: number;
  required?: number;
}> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/reserve-tokens',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType,
          tokensAmount
        })
      }
    );

    // Detect 401 Unauthorized
    if (response.status === 401) {
      console.error('[TokenAPI] 401 Unauthorized on reserveTokens');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[TokenAPI] Error reserving tokens:', error);
    throw error;
  }
}

/**
 * Commit a token reservation after successful AI generation
 */
export async function commitReservation(
  jwtToken: string,
  reservationId: string,
  aiResultUrl: string
): Promise<{
  success: boolean;
  newBalance?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/commit-reservation',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservationId,
          aiResultUrl
        })
      }
    );

    // Detect 401 Unauthorized
    if (response.status === 401) {
      console.error('[TokenAPI] 401 Unauthorized on commitReservation');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[TokenAPI] Error committing reservation:', error);
    throw error;
  }
}

/**
 * Rollback a token reservation if AI generation fails
 */
export async function rollbackReservation(
  jwtToken: string,
  reservationId: string,
  reason: string
): Promise<{
  success: boolean;
  newBalance?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/rollback-reservation',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservationId,
          reason
        })
      }
    );

    // Detect 401 Unauthorized
    if (response.status === 401) {
      console.error('[TokenAPI] 401 Unauthorized on rollbackReservation');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[TokenAPI] Error rolling back reservation:', error);
    throw error;
  }
}

/**
 * Get user token balance
 */
export async function getUserBalance(
  jwtToken: string
): Promise<{
  balance: number;
  totalBalance: number;
  reservedTokens: number;
  subscriptionPlan?: string;
  isPremium: boolean;
}> {
  try {
    const response = await fetch(
      'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/get-user-balance',
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
      console.error('[TokenAPI] 401 Unauthorized on getUserBalance');
      notifyUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[TokenAPI] Error getting balance:', error);
    throw error;
  }
}
