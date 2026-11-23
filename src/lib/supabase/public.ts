import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client for public data (portfolio, services, contact info) on public pages.
 *
 * It uses the publishable (anon) key and never reads cookies. The cookie-based client in
 * ./server.ts calls `cookies()`, which forces every page that uses it to render on each
 * request (no-store, x-vercel-cache: MISS): LinkedIn timed out building link previews of
 * /es/portfolio/urbans on the first try (2026-11-23). With this client those pages can be
 * prerendered and served from Vercel's cache (ISR). RLS still applies, as for any visitor.
 */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
