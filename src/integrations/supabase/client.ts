import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://fipebdkvzdrljwwxccrj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk'

// Cookie-based storage for cross-subdomain session sharing
// IMPORTANT: Supabase requires async storage methods
const cookieStorage = {
  getItem: async (key: string): Promise<string | null> => {
    console.log('🔍 [CookieStorage] getItem CALLED for:', key);
    console.log('🔍 [CookieStorage] Current location:', window.location.hostname);
    const cookies = document.cookie.split(';');
    console.log('🔍 [CookieStorage] All cookies:', document.cookie);
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === key) {
        console.log('✅ [CookieStorage] Found cookie:', name, 'with value length:', value.length);
        return decodeURIComponent(value);
      }
    }
    console.log('❌ [CookieStorage] Not found:', key);
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    console.log('🚀 [CookieStorage] setItem CALLED!');
    console.log('🚀 [CookieStorage] Key:', key);
    console.log('🚀 [CookieStorage] Value length:', value.length);
    console.log('🚀 [CookieStorage] Current hostname:', window.location.hostname);
    console.log('🚀 [CookieStorage] Protocol:', window.location.protocol);
    
    try {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      const hostname = window.location.hostname;
      
      let cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
      
      if (hostname.includes('exhibit3design.com')) {
        cookieString = `${key}=${encodeURIComponent(value)}; domain=.exhibit3design.com; path=/; max-age=${maxAge}; secure; samesite=lax`;
        console.log('🌐 [CookieStorage] Setting cookie with domain .exhibit3design.com');
      } else if (window.location.protocol === 'https:') {
        cookieString += '; secure';
        console.log('🔒 [CookieStorage] Setting secure cookie (https)');
      } else {
        console.log('📝 [CookieStorage] Setting regular cookie (http)');
      }
      
      console.log('📋 [CookieStorage] Full cookie string:', cookieString.substring(0, 200) + '...');
      document.cookie = cookieString;
      console.log('✅ [CookieStorage] Cookie set command executed');
      
      // Verify it was set
      setTimeout(() => {
        const cookies = document.cookie.split(';');
        const found = cookies.some(c => c.trim().startsWith(key + '='));
        console.log('🔍 [CookieStorage] Verification - Cookie exists:', found);
        if (!found) {
          console.error('❌ [CookieStorage] WARNING: Cookie was not set! Current cookies:', document.cookie);
        }
      }, 100);
    } catch (error) {
      console.error('❌ [CookieStorage] ERROR in setItem:', error);
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    console.log('🗑️ [CookieStorage] removeItem CALLED for:', key);
    const hostname = window.location.hostname;
    
    if (hostname.includes('exhibit3design.com')) {
      document.cookie = `${key}=; domain=.exhibit3design.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log('🗑️ [CookieStorage] Removed with domain .exhibit3design.com');
    } else {
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log('🗑️ [CookieStorage] Removed regular cookie');
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