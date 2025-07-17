import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  city: string | null;
  email_confirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  registerWithOTP: (email: string, password: string) => Promise<{ error: any; otp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user's location based on IP
  const getUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name || null,
        city: data.city || null
      };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return { country: null, city: null };
    }
  };

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Create initial profile with location
  const createInitialProfile = async (userId: string) => {
    const location = await getUserLocation();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: null,
          last_name: null,
          country: location.country,
          city: location.city,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Handle profile fetching in background
          setTimeout(async () => {
            try {
              let profileData = await fetchProfile(session.user.id);
              
              // If no profile exists, create one (this handles existing users)
              if (!profileData) {
                profileData = await createInitialProfile(session.user.id);
              }
              
              setProfile(profileData);
            } catch (error) {
              console.error('Profile fetch error:', error);
              setProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    // Check for common fake email patterns
    const fakeDomains = [
      'tempmail.org', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp.email', 'disposable.email',
      'maildrop.cc', 'yopmail.com', 'mailnesia.com', 'trashmail.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (fakeDomains.includes(domain)) {
      return { isValid: false, error: "Please use a permanent email address" };
    }

    // Check for suspicious patterns
    if (email.length < 5 || email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    return { isValid: true };
  };

  const signUp = async (email: string, password: string) => {
    console.log(`[${new Date().toISOString()}] 🚀 AUTH: Starting signup process for ${email}`);
    
    // Validate email before proceeding
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Email validation failed: ${emailValidation.error}`);
      return { error: { message: emailValidation.error } };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Remove email confirmation options to prevent email sending
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Signup failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: Account created successfully`);
      
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Signup exception:`, error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const signinStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] 🔑 AUTH: Starting signin process for ${email}`);
    
    try {
      console.log(`[${new Date().toISOString()}] 🔐 AUTH: Attempting Supabase authentication`);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const duration = Date.now() - signinStartTime;
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Signin failed after ${duration}ms:`, error.message);
        return { error };
      }

      const duration = Date.now() - signinStartTime;
      console.log(`[${new Date().toISOString()}] ✅ AUTH: Signin successful in ${duration}ms`);
      return { error: null };
    } catch (error) {
      const duration = Date.now() - signinStartTime;
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Signin exception after ${duration}ms:`, error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    console.log(`[${new Date().toISOString()}] 🔄 AUTH: Starting password reset for ${email}`);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Password reset failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: Password reset email sent successfully`);
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Password reset exception:`, error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      // Refresh profile data
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const registerWithOTP = async (email: string, password: string) => {
    console.log(`[${new Date().toISOString()}] 🚀 AUTH: Starting OTP registration for ${email}`);
    
    // Validate email before proceeding
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Email validation failed: ${emailValidation.error}`);
      return { error: { message: emailValidation.error } };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email,
          password,
          type: 'register'
        }
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: OTP registration failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: OTP sent successfully`);
      
      toast({
        title: "OTP Generated!",
        description: data?.otp ? `Your OTP is: ${data.otp}` : "Please check your email for the verification code.",
        variant: "default",
      });

      return { error: null, otp: data?.otp };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: OTP registration exception:`, error);
      return { error };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    console.log(`[${new Date().toISOString()}] 🔐 AUTH: Verifying OTP for ${email}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email,
          otp,
          type: 'verify'
        }
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: OTP verification failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: OTP verified successfully`);
      
      toast({
        title: "Registration completed!",
        description: "Your account has been created successfully. Please sign in.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: OTP verification exception:`, error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    registerWithOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};