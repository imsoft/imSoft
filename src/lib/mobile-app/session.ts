import type { User } from '@supabase/supabase-js'
import { serviceClient } from '@/lib/quotes/server'

/** Reads the app's "Bearer" token and returns its user; null when there's no valid session. */
export async function userFromBearer(header: string | null): Promise<User | null> {
  const token = (header ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const { data, error } = await serviceClient().auth.getUser(token)
  return error ? null : data.user
}

export const INVALID_SESSION = 'La sesión no es válida. Vuelve a entrar.'
