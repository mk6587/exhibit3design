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

  const signUp = async (email: string, password: string) => {
    const signupStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] 🚀 AUTH: Starting signup process for ${email}`);
    
    try {
      console.log(`[${new Date().toISOString()}] 📝 AUTH: Creating Supabase user account`);
      // Create user account but don't send Supabase confirmation email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          // Disable Supabase email confirmation
          data: {
            email_confirm: false
          }
        }
      });

      if (error) {
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Supabase signup failed:`, error);
        return { error };
      }

      console.log(`[${new Date().toISOString()}] ✅ AUTH: Supabase user created successfully`);

      // Send confirmation email using custom SMTP
      if (data.user) {
        try {
          console.log(`[${new Date().toISOString()}] 📧 AUTH: Initiating confirmation email send to ${email}`);
          
          const emailStartTime = Date.now();
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: { email: email }
          });
          const emailDuration = Date.now() - emailStartTime;

          if (emailError) {
            console.error(`[${new Date().toISOString()}] ❌ AUTH: Email function failed after ${emailDuration}ms:`, emailError);
            
            // Handle rate limiting gracefully
            if (emailError.message?.includes('rate limit') || emailError.status === 429) {
              console.log(`[${new Date().toISOString()}] ⚠️ AUTH: Email rate limited but account created`);
              toast({
                title: "Account created successfully!",
                description: "Email rate limit reached. You can log in normally, confirmation email will be sent later.",
                variant: "default",
              });
            } else {
              console.log(`[${new Date().toISOString()}] ⚠️ AUTH: Email failed but account created`);
              toast({
                title: "Account created successfully!",
                description: "You can log in normally. If you need help, contact support.",
                variant: "default",
              });
            }
          } else {
            console.log(`[${new Date().toISOString()}] ✅ AUTH: Email function completed successfully in ${emailDuration}ms:`, emailData);
            toast({
              title: "Account created successfully!",
              description: "Please check your email for a confirmation link.",
              variant: "default",
            });
          }
        } catch (emailError) {
          console.error(`[${new Date().toISOString()}] 💥 AUTH: Email function call exception:`, emailError);
          toast({
            title: "Account created successfully!",
            description: "You can log in normally. Email confirmation is optional.",
            variant: "default",
          });
        }
      }

      const totalDuration = Date.now() - signupStartTime;
      console.log(`[${new Date().toISOString()}] 🎉 AUTH: Signup process completed in ${totalDuration}ms`);
      return { error: null };
    } catch (error) {
      const totalDuration = Date.now() - signupStartTime;
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Signup process failed after ${totalDuration}ms:`, error);
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
    const resetStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] 🔄 AUTH: Starting password reset for ${email}`);
    
    try {
      console.log(`[${new Date().toISOString()}] 📧 AUTH: Invoking password reset function`);
      // Use custom SMTP for password reset instead of Supabase
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        const duration = Date.now() - resetStartTime;
        console.error(`[${new Date().toISOString()}] ❌ AUTH: Password reset failed after ${duration}ms:`, error);
        
        // Handle rate limiting specifically
        if (error.message?.includes('rate limit') || error.status === 429) {
          console.warn(`[${new Date().toISOString()}] 🚫 AUTH: Password reset rate limited`);
          return { 
            error: { 
              message: "Too many password reset attempts. Please wait 15 minutes before trying again.",
              rateLimited: true 
            } 
          };
        }
        return { error };
      }

      const duration = Date.now() - resetStartTime;
      console.log(`[${new Date().toISOString()}] ✅ AUTH: Password reset email sent successfully in ${duration}ms`);
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error) {
      const duration = Date.now() - resetStartTime;
      console.error(`[${new Date().toISOString()}] ❌ AUTH: Password reset exception after ${duration}ms:`, error);
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