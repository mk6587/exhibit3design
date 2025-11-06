import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const res = await fetch('https://auth.exhibit3design.com/api/session', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Session fetched:', data.user ? 'User logged in' : 'No user');
        setUser(data.user || null);
      } else {
        console.warn('⚠️ Session fetch failed:', res.status, res.statusText);
        setUser(null);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Session fetch timeout - auth service not responding');
      } else {
        console.error('❌ Session fetch error:', error.message);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const refreshSession = async () => {
    setIsLoading(true);
    await fetchSession();
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};
