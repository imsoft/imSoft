import type { User } from '@supabase/supabase-js'
import { serviceClient } from '@/lib/quotes/server'

/** Lee el token "Bearer" que manda la app y devuelve su usuario; null si no hay sesion valida. */
export async function usuarioDeBearer(cabecera: string | null): Promise<User | null> {
  const token = (cabecera ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const { data, error } = await serviceClient().auth.getUser(token)
  return error ? null : data.user
}
