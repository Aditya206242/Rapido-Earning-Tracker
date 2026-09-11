import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True once real credentials are present in .env — see .env.example. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings.',
  )
}

/**
 * Client-side Supabase client using the public anon key only.
 * The anon key is safe to expose in the frontend — it relies entirely on
 * Row Level Security policies (see supabase/schema.sql) to keep each user's
 * data private. The service-role key must NEVER be used here.
 *
 * Falls back to a placeholder URL when unconfigured so `createClient` never
 * throws at import time (it requires a well-formed URL) — this lets the app
 * boot and show a helpful setup screen instead of a blank white crash.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
)
