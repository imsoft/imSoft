/**
 * Quien es administrador. El rol vive en `app_metadata`, que solo puede escribir el
 * servidor con la llave de servicio. NUNCA leerlo de `user_metadata`: ese campo lo puede
 * cambiar el propio usuario con `supabase.auth.updateUser({ data: { role: 'admin' } })`,
 * y con eso cualquiera que se registrara se volvia administrador (comprobado el
 * 5-oct-2026 con un usuario de prueba: paso a leer los 378 contactos del CRM).
 */
export type Rol = 'admin' | 'client'

type ConMetadatos = { app_metadata?: Record<string, unknown> | null } | null | undefined

export function rolDe(user: ConMetadatos): Rol {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'client'
}

export function esAdmin(user: ConMetadatos): boolean {
  return rolDe(user) === 'admin'
}
