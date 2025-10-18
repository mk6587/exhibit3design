import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OTPAuthContextType {
  sendOTP: (email: string, passwordHash?: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, otp: string, captchaToken?: string) => Promise<{ success: boolean; error?: string; errorType?: string; user?: any; magicLink?: string; isNewUser?: boolean }>;
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

  const sendOTP = async (email: string, passwordHash?: string, captchaToken?: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('send-otp', {
        body: { email, passwordHash, captchaToken }
      });

      if (response.error) {
        console.error('Send OTP error:', response.error);
        
        // Try to get the actual error message from the response
        let userMessage = 'Failed to send verification code';
        
        // Check if there's response data with error details
        if (response.data && response.data.error) {
          if (response.data.error.includes('Please wait before requesting another code')) {
            userMessage = 'You can only request a verification code once per minute. Please wait and try again.';
          } else {
            userMessage = response.data.error;
          }
        } else if (response.error.message?.includes('non-2xx status code')) {
          userMessage = 'Unable to send verification code. Please try again.';
        } else if (response.error.message?.includes('timeout')) {
          userMessage = 'Request timed out. Please try again.';
        } else if (response.error.message?.includes('network')) {
          userMessage = 'Network error. Please check your connection and try again.';
        }
        
        return { success: false, error: userMessage };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      let userMessage = 'Failed to send verification code';
      if (error.message?.includes('non-2xx status code')) {
        userMessage = 'Unable to send verification code. Please try again.';
      } else if (error.message?.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      return { success: false, error: userMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string, captchaToken?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp, captchaToken }
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        // Convert technical errors to user-friendly messages
        let userMessage = 'Failed to verify code';
        if (error.message?.includes('non-2xx status code')) {
          userMessage = 'Invalid verification code. Please check the code and try again.';
        } else if (error.message?.includes('timeout')) {
          userMessage = 'Request timed out. Please try again.';
        } else if (error.message?.includes('network')) {
          userMessage = 'Network error. Please check your connection and try again.';
        }
        return { success: false, error: userMessage };
      }

      if (data?.error) {
        // Return both error message and errorType from backend
        return { 
          success: false, 
          error: data.error,
          errorType: data.errorType 
        };
      }

      return { 
        success: true, 
        user: data?.user,
        magicLink: data?.magicLink,
        isNewUser: data?.isNewUser
      };
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      // Convert technical errors to user-friendly messages
      let userMessage = 'Failed to verify code. Please try again.';
      if (err.message?.includes('non-2xx status code')) {
        userMessage = 'Invalid verification code. Please check the code and try again.';
      } else if (err.message?.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (err.message?.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      return { success: false, error: userMessage };
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