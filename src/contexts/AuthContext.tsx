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
  created_at: string;
  updated_at: string;
}

interface DesignerProfile {
  id: string;
  user_id: string;
  business_name?: string;
  portfolio_url?: string;
  bio?: string;
  specialties?: string[];
  commission_rate: number;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  designerProfile: DesignerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  // SSO Methods
  generateSSOToken: (redirectUrl?: string) => Promise<{ error: any; redirectUrl?: string }>;
  // Designer Methods
  becomeDesigner: (designerData: Partial<DesignerProfile>) => Promise<{ error: any }>;
  updateDesignerProfile: (updates: Partial<DesignerProfile>) => Promise<{ error: any }>;
  isDesigner: boolean;
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
  const [designerProfile, setDesignerProfile] = useState<DesignerProfile | null>(null);
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

  // Fetch designer profile
  const fetchDesignerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching designer profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching designer profile:', error);
      return null;
    }
  };

  // Create initial profile with guest order data transfer
  const createInitialProfile = async (userId: string, userEmail?: string) => {
    try {
      if (userEmail) {
        // Use Supabase function to create profile with guest order data
        const { data, error } = await supabase.rpc('create_profile_with_guest_data', {
          p_user_id: userId,
          p_email: userEmail
        });

        if (error) {
          console.error('Error creating profile with guest data:', error);
          // Continue to fallback
        } else if (data && data.length > 0 && data[0]?.profile_data) {
          console.log('Successfully created profile with guest order data transfer');
          // The profile_data is a JSON object that matches our Profile interface
          return data[0].profile_data as unknown as Profile;
        }
      }

      // Fallback: create basic profile with location data
      const location = await getUserLocation();
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: location.first_name,
          last_name: location.last_name,
          country: location.country,
          city: location.city,
          phone_number: location.phone_number,
          address_line_1: location.address_line_1,
          postcode: location.postcode,
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
      const designerData = await fetchDesignerProfile(user.id);
      setDesignerProfile(designerData);
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
          // Check for SSO return URL after login
          const ssoReturnUrl = sessionStorage.getItem('sso_return_url');
          if (ssoReturnUrl) {
            sessionStorage.removeItem('sso_return_url');
            // Generate SSO token immediately and redirect without interstitial
            setTimeout(async () => {
              try {
                const { error, redirectUrl } = await generateSSOToken(ssoReturnUrl);
                if (error) {
                  console.error('❌ SSO: Auto-redirect after login failed:', error);
                  toast({ title: 'SSO Error', description: error.message || 'Failed to continue to portal.', variant: 'destructive' });
                  return;
                }
                if (redirectUrl) {
                  window.location.href = redirectUrl;
                }
              } catch (e) {
                console.error('❌ SSO: Exception during auto-redirect after login:', e);
              }
            }, 200);
          }
          
          // Handle profile fetching in background
          setTimeout(async () => {
            try {
              let profileData = await fetchProfile(session.user.id);
              
              // If no profile exists, create one with guest order data transfer
              if (!profileData) {
                profileData = await createInitialProfile(session.user.id, session.user.email);
              }
              
              setProfile(profileData);

              // Fetch designer profile
              const designerData = await fetchDesignerProfile(session.user.id);
              setDesignerProfile(designerData);
              
              // Check for guest session data to transfer
              const guestSessionToken = localStorage.getItem('guest_session_token');
              if (guestSessionToken) {
                console.log('🔄 Transferring guest session data to user profile');
                const { error } = await supabase.rpc('transfer_guest_session_to_profile', {
                  p_user_id: session.user.id,
                  p_session_token: guestSessionToken
                });
                
                if (error) {
                  console.error('Error transferring guest session:', error);
                } else {
                  console.log('✅ Guest session data transferred successfully');
                  localStorage.removeItem('guest_session_token');
                  // Refresh profile to show updated data
                  const updatedProfile = await fetchProfile(session.user.id);
                  setProfile(updatedProfile);
                }
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              setProfile(null);
              setDesignerProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
          setDesignerProfile(null);
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

  const signInWithGoogle = async () => {
    console.log(`[${new Date().toISOString()}] 🔑 AUTH: Starting Google OAuth signin`);
    
    try {
      // If on checkout page, redirect back to checkout to preserve cart
      const isOnCheckout = window.location.pathname === '/checkout';
      const redirectUrl = isOnCheckout 
        ? `${window.location.origin}/checkout`
        : `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Google signin failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: Google OAuth initiated successfully`);
      return { error: null };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Google signin exception:`, error);
      return { error: { message: 'Failed to sign in with Google. Please try again.' } };
    }
  };


  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setDesignerProfile(null);
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

  // SSO Methods
  const generateSSOToken = async (redirectUrl?: string) => {
    console.log(`[${new Date().toISOString()}] 🔗 SSO: Generating cross-domain token`);
    
    let accessToken = session?.access_token;
    if (!accessToken) {
      // Try to rehydrate session to avoid race conditions on first load
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        setSession(data.session);
        setUser(data.session.user);
        accessToken = data.session.access_token;
      }
    }

    if (!accessToken) {
      return { error: { message: 'No active session found' } };
    }

    try {
      const { data, error } = await supabase.functions.invoke('cross-domain-auth', {
        body: { 
          action: 'generate',
          redirectUrl: redirectUrl || 'https://designers.exhibit3design.com'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ SSO: Token generation failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ SSO: Token generated successfully`, { data, redirectUrl: data?.redirectUrl });
      
      if (!data?.redirectUrl) {
        console.error(`[${new Date().toISOString()}] ❌ SSO: No redirectUrl in response`, { data });
        return { error: { message: 'No redirect URL received from server' } };
      }
      
      return { error: null, redirectUrl: data.redirectUrl };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ SSO: Token generation exception:`, error);
      return { error: { message: 'Failed to generate SSO token. Please try again.' } };
    }
  };

  // Designer Methods
  const becomeDesigner = async (designerData: Partial<DesignerProfile>) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      const { error } = await supabase
        .from('designers')
        .insert({
          user_id: user.id,
          ...designerData
        });

      if (error) {
        console.error('Error creating designer profile:', error);
        return { error };
      }

      // Refresh designer profile
      const designerData_response = await fetchDesignerProfile(user.id);
      setDesignerProfile(designerData_response);
      return { error: null };
    } catch (error) {
      console.error('Error in becomeDesigner:', error);
      return { error };
    }
  };

  const updateDesignerProfile = async (updates: Partial<DesignerProfile>) => {
    if (!user || !designerProfile) {
      return { error: { message: 'User not authenticated or not a designer' } };
    }

    try {
      const { error } = await supabase
        .from('designers')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating designer profile:', error);
        return { error };
      }

      // Refresh designer profile
      const designerData = await fetchDesignerProfile(user.id);
      setDesignerProfile(designerData);
      return { error: null };
    } catch (error) {
      console.error('Error in updateDesignerProfile:', error);
      return { error };
    }
  };


  const isDesigner = designerProfile?.is_active === true && designerProfile?.is_approved === true;

  const value = {
    user,
    session,
    profile,
    designerProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    generateSSOToken,
    becomeDesigner,
    updateDesignerProfile,
    isDesigner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};