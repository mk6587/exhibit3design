/**
 * Legacy useTokenEligibility - Compatibility stub
 * Token management moved to hosted auth/AI Studio
 */
interface TokenEligibility {
  hasUsedToken: boolean;
  usedCount: number;
  remainingTokens: number;
  eligible: boolean;
  reason: string;
}

export const useTokenEligibility = () => {
  return {
    eligibility: null as TokenEligibility | null,
    isLoading: false,
    error: null,
    refetch: async () => {},
  };
};
