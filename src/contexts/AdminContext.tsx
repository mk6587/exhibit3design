/**
 * Legacy AdminContext - Compatibility Layer
 * Admin functionality moved to hosted auth
 */
import { createContext, useContext, ReactNode } from 'react';

type AdminRole = 'super_admin' | 'content_creator' | 'operator';

interface AdminAgent {
  id: string;
  email: string;
  full_name?: string;
  role: AdminRole;
}

interface AdminContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  user: any | null;
  adminAgent: AdminAgent | null;
  loading: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshActivity: () => void;
  hasPermission: (permission: AdminRole) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const value: AdminContextType = {
    isAuthenticated: false,
    isAdmin: false,
    adminRole: null,
    user: null,
    adminAgent: null,
    loading: false,
    login: async () => ({ success: false, error: 'Admin auth moved to hosted service' }),
    logout: async () => {},
    refreshActivity: () => {},
    hasPermission: () => false,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
