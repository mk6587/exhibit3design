
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkIfUserIsAdmin(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await checkIfUserIsAdmin(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkIfUserIsAdmin = async (authUser: User) => {
    try {
      console.log('Checking admin status for user:', authUser.id);
      console.log('Query: SELECT * FROM admins WHERE user_id =', authUser.id, 'AND is_active = true');
      
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('Admin check result:', { admin, error });

      if (error) {
        console.error('Error in admin check:', error);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      if (admin) {
        console.log('User is admin, setting authenticated to true');
        setIsAuthenticated(true);
        setUser(authUser);
      } else {
        console.log('No admin record found for user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Exception in checkIfUserIsAdmin:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setSession(null);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
