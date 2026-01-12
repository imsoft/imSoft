-- ============================================================================
-- POLÍTICAS RLS PARA LA TABLA auth.users
-- ============================================================================
--
-- Este script configura las políticas RLS para que:
-- 1. Los administradores puedan leer todos los usuarios
-- 2. Los usuarios autenticados puedan leer su propia información
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
-- porque requiere permisos especiales para modificar la tabla auth.users
-- ============================================================================

-- Habilitar RLS en auth.users (ya está habilitado por defecto, pero lo verificamos)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ELIMINAR POLÍTICAS EXISTENTES SI EXISTEN
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all users" ON auth.users;
DROP POLICY IF EXISTS "Users can read their own data" ON auth.users;

-- ============================================================================
-- CREAR NUEVAS POLÍTICAS
-- ============================================================================

-- Política 1: Los administradores pueden leer todos los usuarios
-- Esto permite al CRM mostrar información de usuarios creados por otros admins
CREATE POLICY "Admins can read all users"
ON auth.users
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política 2: Los usuarios pueden leer su propia información
-- Esto permite que cualquier usuario autenticado vea sus propios datos
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

-- Listar todas las políticas de auth.users para verificar
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
