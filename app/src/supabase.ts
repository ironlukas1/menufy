import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

// Capacitor builds can be opened without the web build's environment file. Keep
// the client constructible in that case so the local, read-only app can still
// render instead of failing before React mounts.
export const supabase = createClient(
  supabaseUrl || 'https://menufy-unconfigured.invalid',
  supabasePublishableKey || 'configuration-missing'
)
