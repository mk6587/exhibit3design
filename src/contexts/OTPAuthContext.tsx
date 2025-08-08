import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OTPAuthContextType {
  sendOTP: (email: string, passwordHash?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string; magicLink?: string }>;
  isLoading: boolean;
}

const OTPAuthContext = createContext<OTPAuthContextType | undefined>(undefined);

export function useOTPAuth(): OTPAuthContextType {
  const context = useContext(OTPAuthContext);
  if (context === undefined) {
    throw new Error('useOTPAuth must be used within an OTPAuthProvider');
  }
  return context;
}

interface OTPAuthProviderProps {
  children: React.ReactNode;
}

export function OTPAuthProvider({ children }: OTPAuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = async (email: string, passwordHash?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email, passwordHash }
      });

      if (error) {
        console.error('Send OTP error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { success: false, error: 'Failed to send verification code' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp }
      });

      if (error) {
        console.error('Verify OTP error:', error);
        return { success: false, error: error.message };
      }

      // If there's a magic link, navigate to it to complete authentication
      if (data?.magicLink) {
        return { success: true, magicLink: data.magicLink };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'Failed to verify code' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: OTPAuthContextType = {
    sendOTP,
    verifyOTP,
    isLoading
  };

  return (
    <OTPAuthContext.Provider value={value}>
      {children}
    </OTPAuthContext.Provider>
  );
}