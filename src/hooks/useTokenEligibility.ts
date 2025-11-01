import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TokenEligibility {
  hasUsedToken: boolean;
  usedCount: number;
  remainingTokens: number;
  eligible: boolean;
  reason: string;
}

export const useTokenEligibility = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<TokenEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    if (!user) {
      setEligibility(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'check-token-eligibility',
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      setEligibility(data);
    } catch (err) {
      console.error('Error checking token eligibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [user]);

  return {
    eligibility,
    isLoading,
    error,
    refetch: checkEligibility,
  };
};
