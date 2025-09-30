import { cookies } from 'next/headers';
import { createServerClient, CookieOptions } from '@supabase/ssr';

// Create a server-side Supabase client
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
};

// Get the current user's session
export const getServerSession = async (): Promise<{ user: { id: string } | null } | null> => {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Get the current user
export const getServerUser = async (): Promise<{ id: string } | null> => {
  const session = await getServerSession();
  return session?.user || null;
};