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
  phone_number: string | null;
  address_line_1: string | null;
  state_region: string | null;
  postcode: string | null;
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
        city: data.city || null,
        first_name: null,
        last_name: null,
        phone_number: null,
        address_line_1: null,
        postcode: null
      };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return { 
        country: null, 
        city: null,
        first_name: null,
        last_name: null,
        phone_number: null,
        address_line_1: null,
        postcode: null
      };
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

  // Transfer guest order data to user profile
  const transferGuestOrderData = async (userId: string, userEmail: string) => {
    try {
      // Get the most recent guest order with this email to transfer customer info
      const { data: guestOrders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_first_name, customer_last_name, customer_mobile, customer_address, customer_city, customer_postal_code, customer_country')
        .eq('customer_email', userEmail)
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (ordersError || !guestOrders?.length) {
        console.log('No guest orders found for transfer');
        return await getUserLocation();
      }

      const guestOrder = guestOrders[0];
      console.log('Transferring guest order data to profile:', { userEmail, hasData: !!guestOrder });

      // Update all guest orders with this email to link to authenticated user
      const { error: linkError } = await supabase
        .from('orders')
        .update({ user_id: userId })
        .eq('customer_email', userEmail)
        .is('user_id', null);

      if (linkError) {
        console.error('Error linking guest orders to user:', linkError);
      } else {
        console.log('Successfully linked guest orders to authenticated user');
      }

      return {
        country: guestOrder.customer_country || null,
        city: guestOrder.customer_city || null,
        first_name: guestOrder.customer_first_name || null,
        last_name: guestOrder.customer_last_name || null,
        phone_number: guestOrder.customer_mobile || null,
        address_line_1: guestOrder.customer_address || null,
        postcode: guestOrder.customer_postal_code || null
      };
    } catch (error) {
      console.error('Error transferring guest order data:', error);
      return await getUserLocation();
    }
  };

  // Create initial profile with location and guest order data
  const createInitialProfile = async (userId: string, userEmail?: string) => {
    const profileData = userEmail 
      ? await transferGuestOrderData(userId, userEmail)
      : await getUserLocation();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: profileData.first_name || null,
          last_name: profileData.last_name || null,
          country: profileData.country,
          city: profileData.city,
          phone_number: profileData.phone_number || null,
          address_line_1: profileData.address_line_1 || null,
          postcode: profileData.postcode || null,
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
    console.log('🔧 AUTH CONTEXT DEBUG - Setting up auth state listener');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 AUTH CONTEXT DEBUG - Auth state changed:', {
          event,
          userEmail: session?.user?.email || 'No user',
          userId: session?.user?.id || 'No ID',
          hasSession: !!session,
          hasUser: !!session?.user,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry',
          timestamp: new Date().toISOString()
        });
        console.log('Session details:', { hasSession: !!session, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        
        // Dispatch custom event to trigger popup hiding
        if (session?.user) {
          window.dispatchEvent(new CustomEvent('authStateChanged'));
          // Run popup hiding after a short delay to catch any delayed popups
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('authStateChanged'));
          }, 1000);
        }
        
        if (session?.user) {
          // Handle profile fetching in background
          setTimeout(async () => {
            try {
              let profileData = await fetchProfile(session.user.id);
              
              // If no profile exists, create one with guest order data transfer
              if (!profileData) {
                profileData = await createInitialProfile(session.user.id, session.user.email);
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
    console.log('🔍 AUTH CONTEXT DEBUG - Checking for existing session on mount');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 AUTH CONTEXT DEBUG - Initial session check result:', {
        hasSession: !!session,
        userEmail: session?.user?.email || 'No user',
        userId: session?.user?.id || 'No ID',
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry',
        timestamp: new Date().toISOString()
      });
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
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        }
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Signup failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: Account created successfully`);

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
        
        // Convert technical errors to user-friendly messages
        let userMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          userMessage = 'Incorrect email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          userMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message?.includes('network')) {
          userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message?.includes('timeout')) {
          userMessage = 'Request timed out. Please try again.';
        }
        
        return { error: { ...error, message: userMessage } };
      }

      const duration = Date.now() - signinStartTime;
      console.log(`[${new Date().toISOString()}] ✅ AUTH: Signin successful in ${duration}ms`);
      return { error: null };
    } catch (error) {
      const duration = Date.now() - signinStartTime;
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Signin exception after ${duration}ms:`, error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
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

      return { error: null };
    } catch (error) {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};