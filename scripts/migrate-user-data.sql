-- Script de migración de datos de usuarios existentes
-- Este script migra datos de user_metadata a las nuevas tablas
-- IMPORTANTE: Ejecuta este script DESPUÉS de crear las tablas user_profiles y companies

-- ============================================
-- 1. Migrar datos a user_profiles
-- ============================================

-- Migrar first_name, last_name, avatar_url de user_metadata a user_profiles
INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url)
SELECT 
  id as user_id,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.users.id
)
  AND (
    raw_user_meta_data->>'first_name' IS NOT NULL
    OR raw_user_meta_data->>'last_name' IS NOT NULL
    OR raw_user_meta_data->>'avatar_url' IS NOT NULL
  )
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 2. Migrar company_name a companies
-- ============================================

-- Migrar company_name de user_metadata a companies
-- Solo si el usuario tiene company_name y no existe ya una empresa con ese nombre
INSERT INTO companies (user_id, name)
SELECT 
  id as user_id,
  raw_user_meta_data->>'company_name' as name
FROM auth.users
WHERE raw_user_meta_data->>'company_name' IS NOT NULL
  AND raw_user_meta_data->>'company_name' != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.user_id = auth.users.id 
      AND companies.name = raw_user_meta_data->>'company_name'
  );

-- ============================================
-- 3. Verificar la migración
-- ============================================

-- Ver usuarios migrados a user_profiles
SELECT 
  u.email,
  up.first_name,
  up.last_name,
  up.avatar_url
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
ORDER BY u.created_at;

-- Ver empresas migradas
SELECT 
  u.email,
  c.name as company_name
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
WHERE c.name IS NOT NULL
ORDER BY c.created_at;

-- ============================================
-- Notas:
-- ============================================
-- - Este script es idempotente: puedes ejecutarlo múltiples veces sin duplicar datos
-- - Solo migra usuarios que aún no tienen perfil en user_profiles
-- - Solo crea empresas que no existen ya
-- - No elimina datos de user_metadata (se mantienen para compatibilidad)

