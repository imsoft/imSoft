/**
 * Helper functions for Supabase admin operations
 * 
 * NOTE: These functions require the Supabase SERVICE_ROLE_KEY
 * and must only run on the server with due security precautions.
 */

import { createClient } from '@supabase/supabase-js'
import { isAdmin as hasAdminRole } from '@/lib/roles'

/**
 * Creates a Supabase client with admin permissions
 * Requires the SUPABASE_SERVICE_ROLE_KEY environment variable
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
 * Grants the admin role to a user by email
 * @param email User's email
 */
export async function setAdminRole(email: string) {
  const supabase = createAdminClient()
  
  // Find the user by email
  const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
  
  if (searchError) {
    throw new Error(`Error al buscar usuarios: ${searchError.message}`)
  }

  const user = users.users.find(u => u.email === email)
  
  if (!user) {
    throw new Error(`Usuario con email ${email} no encontrado`)
  }

  // The role goes in app_metadata: only the server can write it. In user_metadata the
  // user could change it themselves (see src/lib/roles.ts).
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: {
        ...user.app_metadata,
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
 * Checks whether a user has the admin role
 * @param userId User ID
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  
  if (error || !data.user) {
    return false
  }

  return hasAdminRole(data.user)
}

