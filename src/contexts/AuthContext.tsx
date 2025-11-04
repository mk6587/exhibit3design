import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { setUserProperties, trackAuthEvent } from '@/services/ga4Analytics';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  city: string | null;
  phone_number: string | null;
  address_line_1: string | null;
  state_region: string | null;
  postcode: string | null;
  email_confirmed: boolean;
  ai_tokens_used: number;
  ai_tokens_limit: number;
  ai_tokens_balance: number;
  reserved_tokens: number;
  free_tokens_claimed: boolean;
  video_results_used: number;
  video_results_balance: number;
  video_results_limit: number;
  selected_files: any;
  is_active: boolean;
  deactivated_at: string | null;
  deactivation_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
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
          selected_files: [],
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

  // Refresh profile data and update GA4 user properties
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      
      // Update user properties in GA4 if profile exists
      if (profileData) {
        // Get subscription details
        const { data: subscription } = await supabase.rpc('get_active_subscription', { 
          p_user_id: user.id 
        }) as any;
        
        setUserProperties({
          user_id: user.id,
          subscription_tier: subscription?.[0]?.file_access_tier || 'free',
          subscription_status: subscription?.[0]?.status || 'inactive',
          ai_tokens_balance: profileData.ai_tokens_balance || 0,
          video_results_balance: profileData.video_results_balance || 0,
          max_files: subscription?.[0]?.max_files || 0
        });
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initialize = async () => {
      // Set up auth state listener FIRST - it handles both existing sessions and OAuth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          console.log('Auth state changed:', event, session?.user?.email);
          
          // Update state synchronously
          setSession(session);
          setUser(session?.user ?? null);
          
          // Clean up OAuth hash ONLY after successful sign in
          if (event === 'SIGNED_IN' && session) {
            const hash = window.location.hash;
            if (hash.includes('access_token') || hash.includes('refresh_token')) {
              console.log('Cleaning up OAuth hash after successful sign in');
              setTimeout(() => {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }, 100);
            }
          }
          
          // Dispatch custom event to trigger popup hiding
          if (session?.user) {
            window.dispatchEvent(new CustomEvent('authStateChanged'));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('authStateChanged'));
            }, 1000);
            
            // Handle post-login redirect to stored URL
            setTimeout(async () => {
              const redirectUrl = sessionStorage.getItem('auth_redirect_url');
              if (redirectUrl) {
                sessionStorage.removeItem('auth_redirect_url');
                console.log('🔄 Redirecting authenticated user to stored URL:', redirectUrl);
                
                if (redirectUrl.startsWith('ai-studio:')) {
                  window.open('https://ai.exhibit3design.com', '_blank', 'noopener,noreferrer');
                } else {
                  setTimeout(() => {
                    window.location.href = redirectUrl;
                  }, 500);
                }
              }
            }, 500);
          }
          
          // Defer all Supabase calls with setTimeout to prevent deadlock
          if (session?.user) {
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                let profileData = await fetchProfile(session.user.id);
                
                if (!profileData) {
                  profileData = await createInitialProfile(session.user.id, session.user.email);
                }
                
                if (mounted) {
                  setProfile(profileData);
                  
                  if (profileData) {
                    setTimeout(async () => {
                      try {
                        const { data: subscription } = await supabase.rpc('get_active_subscription', { 
                          p_user_id: session.user.id 
                        }) as any;
                        
                        setUserProperties({
                          user_id: session.user.id,
                          subscription_tier: subscription?.[0]?.file_access_tier || 'free',
                          subscription_status: subscription?.[0]?.status || 'inactive',
                          ai_tokens_balance: profileData.ai_tokens_balance || 0,
                          video_results_balance: profileData.video_results_balance || 0,
                          max_files: subscription?.[0]?.max_files || 0
                        });
                      } catch (e) {
                        console.error('Failed to set user properties:', e);
                      }
                    }, 100);
                  }
                }
              } catch (error) {
                console.error('Profile fetch error:', error);
                if (mounted) {
                  setProfile(null);
                }
              }
            }, 0);
          } else {
            setProfile(null);
          }
          
          if (mounted) {
            setLoading(false);
          }
        }
      );

      authSubscription = subscription;
      
      // Check for existing session AFTER listener is set up
      // This ensures we don't miss any auth state changes
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (mounted && session) {
          console.log('Restored existing session:', session.user?.email);
          // The onAuthStateChange listener will handle this
        } else if (mounted) {
          setLoading(false);
        }
      });
    };

    initialize();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Set up realtime subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up realtime subscription for user:', user.id);

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime profile update received:', payload);
          
          // Update profile state with new data
          setProfile((currentProfile) => {
            if (!currentProfile) return null;
            
            const newData = payload.new as Profile;
            
            // Update GA4 user properties with new token balances
            if (newData.ai_tokens_balance !== currentProfile.ai_tokens_balance ||
                newData.video_results_balance !== currentProfile.video_results_balance) {
              console.log('Token balance changed - updating analytics');
              
              supabase.rpc('get_active_subscription', { 
                p_user_id: user.id 
              }).then(({ data: subscription }: any) => {
                setUserProperties({
                  user_id: user.id,
                  subscription_tier: subscription?.[0]?.file_access_tier || 'free',
                  subscription_status: subscription?.[0]?.status || 'inactive',
                  ai_tokens_balance: newData.ai_tokens_balance || 0,
                  video_results_balance: newData.video_results_balance || 0,
                  max_files: subscription?.[0]?.max_files || 0
                });
              });
            }
            
            return { ...currentProfile, ...newData };
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Refresh profile when window regains focus (e.g., returning from AI Studio)
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Window became visible - refreshing profile');
        refreshProfile();
      }
    };

    const handleFocus = () => {
      console.log('Window gained focus - refreshing profile');
      refreshProfile();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

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
    // Validate email before proceeding
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
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
        console.error('Signup failed:', error);
        return { error };
      }
      
      // Track signup
      trackAuthEvent('sign_up', 'email');

      return { error: null };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
      
      // Track login
      trackAuthEvent('login', 'email');

      return { error: null };
    } catch (error) {
      console.error('Signin exception:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('Google signin failed:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Google signin exception:', error);
      return { error: { message: 'Failed to sign in with Google. Please try again.' } };
    }
  };


  const signOut = async () => {
    console.log('AuthContext: signOut called - forcing complete logout');
    
    // Track logout
    trackAuthEvent('logout');
    
    // Immediately clear all state - don't wait for API
    setUser(null);
    setSession(null);
    setProfile(null);
    
    // Clear all possible localStorage items
    localStorage.removeItem('guest_session_token');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    
    // Clear all Supabase auth storage
    try {
      await supabase.auth.signOut({ scope: 'local' });
      console.log('AuthContext: Local signOut complete');
    } catch (error) {
      console.error('AuthContext: Local signOut error:', error);
    }
    
    // Also try global signOut to revoke tokens on server
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('AuthContext: Global signOut complete');
    } catch (error) {
      console.error('AuthContext: Global signOut error:', error);
    }
    
    console.log('AuthContext: SignOut complete - all auth cleared');
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset failed:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset exception:', error);
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
    signInWithGoogle,
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