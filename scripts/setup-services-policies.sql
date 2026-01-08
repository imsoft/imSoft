-- ============================================================================
-- POLÍTICAS RLS PARA LA TABLA services
-- ============================================================================
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
--
-- Este script configura las políticas para que:
-- 1. Todos puedan leer los servicios (público)
-- 2. Solo administradores puedan crear, actualizar y eliminar servicios
-- ============================================================================

-- Habilitar RLS en la tabla services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ELIMINAR POLÍTICAS EXISTENTES
-- ============================================================================

DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;

-- ============================================================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ============================================================================

-- Política 1: Todos pueden leer los servicios
CREATE POLICY "Services are viewable by everyone"
ON public.services
FOR SELECT
TO public
USING (true);

-- ============================================================================
-- POLÍTICAS DE ESCRITURA (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Política 2: Solo administradores pueden crear servicios
CREATE POLICY "Admins can insert services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política 3: Solo administradores pueden actualizar servicios
CREATE POLICY "Admins can update services"
ON public.services
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política 4: Solo administradores pueden eliminar servicios
CREATE POLICY "Admins can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Listar todas las políticas de la tabla services
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'services'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 4 políticas:
-- 1. "Admins can delete services" - Solo admins pueden eliminar
-- 2. "Admins can insert services" - Solo admins pueden crear
-- 3. "Admins can update services" - Solo admins pueden actualizar
-- 4. "Services are viewable by everyone" - Todos pueden leer
--
-- Si ves las 4 políticas, ¡todo está configurado correctamente! ✅
-- ============================================================================
