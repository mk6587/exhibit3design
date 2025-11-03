import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://fipebdkvzdrljwwxccrj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk'

// Cookie-based storage for cross-subdomain session sharing
const cookieStorage = {
  getItem: (key: string): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === key) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    const hostname = window.location.hostname;
    
    let cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
    
    if (hostname.includes('exhibit3design.com')) {
      cookieString = `${key}=${encodeURIComponent(value)}; domain=.exhibit3design.com; path=/; max-age=${maxAge}; secure; samesite=lax`;
    } else if (window.location.protocol === 'https:') {
      cookieString += '; secure';
    }
    
    document.cookie = cookieString;
  },
  removeItem: (key: string): void => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('exhibit3design.com')) {
      document.cookie = `${key}=; domain=.exhibit3design.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else {
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'exhibit3design-auth', // Must match AI Studio
  }
})