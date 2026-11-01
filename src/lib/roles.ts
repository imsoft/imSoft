/**
 * Who is an administrator. The role lives in `app_metadata`, which only the server
 * can write with the service key. NEVER read it from `user_metadata`: that field can be
 * changed by the user themselves with `supabase.auth.updateUser({ data: { role: 'admin' } })`,
 * and with that anyone who signed up became an administrator (verified on
 * 2026-10-05 with a test user: it could read the CRM's 378 contacts).
 */
export type Role = 'admin' | 'client'

type WithMetadata = { app_metadata?: Record<string, unknown> | null } | null | undefined

export function roleOf(user: WithMetadata): Role {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'client'
}

export function isAdmin(user: WithMetadata): boolean {
  return roleOf(user) === 'admin'
}
