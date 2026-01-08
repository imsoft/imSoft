/**
 * Script para asignar rol de administrador a un usuario
 * 
 * Uso:
 * 1. Agrega SUPABASE_SERVICE_ROLE_KEY a tu archivo .env.local
 * 2. Ejecuta: npx tsx scripts/set-admin-role.ts weareimsoft@gmail.com
 */

import { setAdminRole } from '../src/lib/supabase/admin'

const email = process.argv[2]

if (!email) {
  console.error('Por favor, proporciona un email como argumento')
  console.error('Uso: npx tsx scripts/set-admin-role.ts <email>')
  process.exit(1)
}

async function main() {
  try {
    console.log(`Asignando rol de administrador a ${email}...`)
    const result = await setAdminRole(email)
    console.log('✅ Rol de administrador asignado correctamente')
    console.log('Usuario actualizado:', {
      id: result.user.id,
      email: result.user.email,
      role: result.user.user_metadata?.role
    })
  } catch (error) {
    console.error('❌ Error al asignar rol:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()

