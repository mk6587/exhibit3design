
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AdminRole = 'super_admin' | 'content_creator' | 'operator';

interface AdminContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  user: User | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
  refreshActivity: () => void;
  hasPermission: (permission: 'super_admin' | 'content_creator' | 'operator') => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const isAdminUser = !!(result?.is_admin && result?.is_active);
      
      // Get admin role if user is admin
      if (isAdminUser) {
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_admin_role', { p_user_id: userId });

        if (!roleError && roleData && roleData.length > 0) {
          setAdminRole(roleData[0].role as AdminRole);
        }
      } else {
        setAdminRole(null);
      }
      
      return isAdminUser;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      return false;
    }
  };

  // Track user activity and auto-logout on inactivity
  const refreshActivity = () => {
    lastActivityRef.current = Date.now();
  };

  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    if (timeSinceLastActivity >= SESSION_TIMEOUT_MS && isAuthenticated) {
      console.log('Session timeout due to inactivity');
      logout();
    }
  };

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminStatus(currentUser.id);
        setIsAdmin(adminStatus);
        setIsAuthenticated(adminStatus);
      }
    };

    initAuth();

    // Listen for auth changes - only handle logout, not login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only handle sign out events
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Just set the user, admin check is handled by login function
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up inactivity check when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check inactivity every minute
      timeoutRef.current = setInterval(checkInactivity, 60000);
      
      // Track user activity
      const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      activityEvents.forEach(event => {
        window.addEventListener(event, refreshActivity);
      });

      return () => {
        if (timeoutRef.current) {
          clearInterval(timeoutRef.current);
        }
        activityEvents.forEach(event => {
          window.removeEventListener(event, refreshActivity);
        });
      };
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Validate login (IP whitelist + rate limiting)
      const validationResponse = await supabase.functions.invoke('validate-admin-login', {
        body: { email }
      });

      if (validationResponse.error || !validationResponse.data?.allowed) {
        // Log failed pre-validation
        await supabase.functions.invoke('log-admin-attempt', {
          body: { email, success: false }
        });
        
        return { 
          success: false, 
          error: validationResponse.data?.message || 'Login validation failed'
        };
      }

      // Step 2: Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? {
          captchaToken
        } : undefined
      });

      if (error) {
        // Log failed auth attempt
        await supabase.functions.invoke('log-admin-attempt', {
          body: { email, success: false }
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        
        // Step 3: Check admin status
        const adminStatus = await checkAdminStatus(data.user.id);
        
        if (!adminStatus) {
          await supabase.auth.signOut();
          // Log failed admin check
          await supabase.functions.invoke('log-admin-attempt', {
            body: { email, success: false }
          });
          return { success: false, error: 'Access denied: Admin privileges required' };
        }

        // Log successful login
        await supabase.functions.invoke('log-admin-attempt', {
          body: { email, success: true }
        });

        setIsAdmin(true);
        setIsAuthenticated(true);
        lastActivityRef.current = Date.now();
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminRole(null);
    setUser(null);
  };

  const hasPermission = (permission: 'super_admin' | 'content_creator' | 'operator'): boolean => {
    if (!adminRole) return false;
    
    // Super admin has all permissions
    if (adminRole === 'super_admin') return true;
    
    // Check specific role permissions
    return adminRole === permission;
  };

  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      adminRole,
      user, 
      login, 
      logout, 
      checkAdminStatus, 
      refreshActivity,
      hasPermission
    }}>
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
