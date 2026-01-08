/**
 * Funciones helper para operaciones administrativas de Supabase
 * 
 * NOTA: Estas funciones requieren el SERVICE_ROLE_KEY de Supabase
 * y solo deben ejecutarse en el servidor con las debidas precauciones de seguridad.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase con permisos de administrador
 * Requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada. Esta función requiere permisos de administrador.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Asigna el rol de administrador a un usuario por su email
 * @param email Email del usuario
 */
export async function setAdminRole(email: string) {
  const supabase = createAdminClient()
  
  // Buscar el usuario por email
  const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
  
  if (searchError) {
    throw new Error(`Error al buscar usuarios: ${searchError.message}`)
  }

  const user = users.users.find(u => u.email === email)
  
  if (!user) {
    throw new Error(`Usuario con email ${email} no encontrado`)
  }

  // Actualizar el user_metadata con el rol de administrador
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin'
      }
    }
  )

  if (error) {
    throw new Error(`Error al actualizar usuario: ${error.message}`)
  }

  return data
}

/**
 * Verifica si un usuario tiene rol de administrador
 * @param userId ID del usuario
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  
  if (error || !data.user) {
    return false
  }

  return data.user.user_metadata?.role === 'admin'
}

