import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 *
 * The PWA still reads and writes through the Menufy API; this client is the
 * entry point for the Supabase Auth migration described in
 * `server/supabase/README.md` (sign in here, send the access token to the API).
 *
 * It uses the publishable (anon) key, which is safe to ship: RLS decides what
 * the visitor may read. Never put the service_role / secret key in the app.
 */
let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Chýba VITE_SUPABASE_URL alebo VITE_SUPABASE_PUBLISHABLE_KEY v app/.env.local.",
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
