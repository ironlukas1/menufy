import { createClient } from '@supabase/supabase-js'

// A sideloaded APK keeps working even when it was built without the
// VITE_SUPABASE_* values: createClient() would throw on empty values and leave
// the WebView blank, so fall back to placeholders. Requests then fail and the
// UI keeps the bundled prototype restaurants instead of showing nothing.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://unconfigured.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'unconfigured'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.error('[menufy] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing; using bundled data only.')
}

export const supabase = createClient(url, key)
