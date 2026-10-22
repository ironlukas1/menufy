import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../env";

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client.
 *
 * Uses the service-role key: RLS is bypassed, so this must only ever run on the
 * server. When the PWA later talks to Supabase directly, use the anon key there
 * and rely on the policies in `supabase/migrations/0001_init.sql`.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase nie je nakonfigurovaný. Nastavte SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY v .env.local.",
    );
  }
  client ??= createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "menufy-api" } },
  });
  return client;
}
