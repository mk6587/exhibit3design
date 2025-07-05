
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')

// Create a fallback client if environment variables are missing
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Supabase client created successfully')
} else {
  console.warn('Supabase environment variables missing. Using fallback mode.')
  // Create a mock client that won't break the app
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ error: null }),
      insert: () => Promise.resolve({ error: null }),
      delete: () => Promise.resolve({ error: null }),
    })
  }
}

export { supabase }

// Database types
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  long_description: string;
  specifications: string;
  images: string[];
  tags: string[];
  file_size: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}
