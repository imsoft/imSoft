/**
 * Quien es administrador. El rol vive en `app_metadata`, que solo puede escribir el
 * servidor con la llave de servicio. NUNCA leerlo de `user_metadata`: ese campo lo puede
 * cambiar el propio usuario con `supabase.auth.updateUser({ data: { role: 'admin' } })`,
 * y con eso cualquiera que se registrara se volvia administrador (comprobado el
 * 5-oct-2026 con un usuario de prueba: paso a leer los 378 contactos del CRM).
 */
export type Role = 'admin' | 'client'

type WithMetadata = { app_metadata?: Record<string, unknown> | null } | null | undefined

export function roleOf(user: WithMetadata): Role {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'client'
}

export function isAdmin(user: WithMetadata): boolean {
  return roleOf(user) === 'admin'
}
