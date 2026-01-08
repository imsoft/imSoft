-- ============================================================================
-- POLÍTICAS RLS PARA LA TABLA auth.users
-- ============================================================================
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
-- NO puede ejecutarse desde scripts externos debido a restricciones de permisos
--
-- Este script configura las políticas para que:
-- 1. Los administradores puedan leer todos los usuarios
-- 2. Los usuarios autenticados puedan leer su propia información
-- ============================================================================

-- Habilitar RLS en auth.users (si no está habilitado)
-- Nota: auth.users ya tiene RLS habilitado por defecto, pero lo verificamos
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can read all users" ON auth.users;
DROP POLICY IF EXISTS "Users can read their own data" ON auth.users;

-- Política 1: Los administradores pueden leer todos los usuarios
CREATE POLICY "Admins can read all users"
ON auth.users
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política 2: Los usuarios pueden leer su propia información
CREATE POLICY "Users can read their own data"
ON auth.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Listar todas las políticas de auth.users
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 2 políticas:
-- 1. "Admins can read all users" - Permite a admins leer todos los usuarios
-- 2. "Users can read their own data" - Permite a usuarios leer su propia info
--
-- Si ves las 2 políticas, ¡todo está configurado correctamente! ✅
-- ============================================================================
