
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock Supabase client when credentials are missing
const createMockClient = () => {
  console.warn('Using mock Supabase client due to missing environment variables');
  
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: () => ({
          eq: () => ({
            data: [],
            error: null
          }),
          data: [],
          error: null
        }),
        order: () => ({
          data: [],
          error: null
        }),
        data: [],
        error: null
      })
    })
  } as unknown as ReturnType<typeof createClient<Database>>;
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient();
