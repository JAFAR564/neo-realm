import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
export const createServerSupabaseClient = () => {
  // These should be service role keys for server-side operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const errorMessage = 'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.\\n\\n' +
                         'To configure:\\n' +
                         '1. Create a Supabase project at https://supabase.com\\n' +
                         '2. Get your Project URL (NEXT_PUBLIC_SUPABASE_URL) and Service Role Key (SUPABASE_SERVICE_ROLE_KEY)\\n' +
                         '3. Add them to your .env.local file:\\n' +
                         '   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url\\n' +
                         '   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key';
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'NeoRealm-Server/0.1.0'
      }
    }
  });
};