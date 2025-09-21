import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Create a server-side Supabase client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
};

// Get the current user's session
export const getServerSession = async (): Promise<{ user: { id: string } | null } | null> => {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Get the current user
export const getServerUser = async (): Promise<{ id: string } | null> => {
  const session = await getServerSession();
  return session?.user || null;
};