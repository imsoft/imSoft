-- Script para asignar rol de administrador a un usuario
-- Ejecuta este script en el SQL Editor de Supabase

-- Actualizar el user_metadata del usuario para asignar rol de administrador
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'weareimsoft@gmail.com';

-- Verificar que se actualizó correctamente
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data
FROM auth.users
WHERE email = 'weareimsoft@gmail.com';

