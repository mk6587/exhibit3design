
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AdminContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if current user is an admin using security definer function
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('check_user_admin_status', { check_user_id: userId });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      // RPC returns an array, get the first result
      const result = Array.isArray(data) ? data[0] : data;
      return !!(result?.is_admin && result?.is_active);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const isAdmin = await checkAdminStatus(currentUser.id);
        setIsAuthenticated(isAdmin);
      }
    };

    initAuth();

    // Listen for auth changes - only handle logout, not login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only handle sign out events
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Just set the user, admin check is handled by login function
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AdminContext: Starting login for', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? {
          captchaToken
        } : undefined
      });

      console.log('AdminContext: Supabase auth result', { user: data?.user?.id, error: error?.message });

      if (error) {
        console.error('AdminContext: Auth error', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('AdminContext: User authenticated, checking admin status...');
        setUser(data.user);
        
        const isAdmin = await checkAdminStatus(data.user.id);
        console.log('AdminContext: Admin status check result:', isAdmin);
        
        if (!isAdmin) {
          console.log('AdminContext: User is not admin, signing out');
          await supabase.auth.signOut();
          return { success: false, error: 'Access denied: Admin privileges required' };
        }

        console.log('AdminContext: Login successful');
        setIsAuthenticated(true);
        return { success: true };
      }

      console.log('AdminContext: No user data returned');
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('AdminContext: Unexpected error', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, user, login, logout, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
