/**
 * Legacy AuthContext - Compatibility Layer
 * Wraps SessionContext for backward compatibility
 */
import { createContext, useContext, ReactNode } from 'react';
import { useSession } from './SessionContext';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  ai_tokens_balance?: number;
  video_results_balance?: number;
  first_name?: string;
  last_name?: string;
  country?: string;
  city?: string;
  phone_number?: string;
  address_line_1?: string;
  state_region?: string;
  postcode?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  session: any | null;
  profileError: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryProfileCreation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useSession();

  // Stub methods for compatibility
  const signUp = async () => ({ error: new Error('Auth moved to hosted service') });
  const signIn = async () => ({ error: new Error('Auth moved to hosted service') });
  const signInWithGoogle = async () => {};
  const signOut = async () => {
    window.location.href = 'https://auth.exhibit3design.com/logout?return_to=https://exhibit3design.com';
  };
  const resetPassword = async () => ({ error: new Error('Auth moved to hosted service') });
  const updateProfile = async (updates: Partial<Profile>) => {};
  const refreshProfile = async () => {};
  const retryProfileCreation = async () => {};

  const value: AuthContextType = {
    user: user as User | null,
    profile: null,
    loading: isLoading,
    session: null,
    profileError: null,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    retryProfileCreation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
