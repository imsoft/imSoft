-- ============================================================================
-- FIX PERMISOS COMPLETOS PARA TABLAS CRM (contacts y deals)
-- ============================================================================
--
-- PROBLEMA:
-- Error "permission denied for table users" al insertar contactos/deals
--
-- CAUSA:
-- 1. Las políticas RLS no permiten INSERT con foreign keys a auth.users
-- 2. El rol 'authenticated' no tiene permisos para verificar constraints
--
-- SOLUCIÓN:
-- 1. Otorgar permisos GRANT para verificar foreign keys
-- 2. Crear políticas RLS que permitan operaciones CRUD
-- ============================================================================

-- ============================================================================
-- PASO 1: OTORGAR PERMISOS BÁSICOS PARA VERIFICAR FOREIGN KEYS
-- ============================================================================

-- Otorgar permiso REFERENCES en auth.users a authenticated users
GRANT REFERENCES ON auth.users TO authenticated;

-- Otorgar SELECT mínimo para verificar constraints
GRANT SELECT (id) ON auth.users TO authenticated;

-- ============================================================================
-- PASO 2: HABILITAR RLS EN LAS TABLAS (si no está habilitado)
-- ============================================================================

ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 3: ELIMINAR POLÍTICAS EXISTENTES (para recrearlas correctamente)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;

DROP POLICY IF EXISTS "Users can view all deals" ON deals;
DROP POLICY IF EXISTS "Users can insert deals" ON deals;
DROP POLICY IF EXISTS "Users can update deals" ON deals;
DROP POLICY IF EXISTS "Users can delete deals" ON deals;

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS RLS CORRECTAS PARA CONTACTS
-- ============================================================================

-- Permitir a usuarios autenticados VER todos los contactos
CREATE POLICY "Users can view all contacts"
ON contacts FOR SELECT
TO authenticated
USING (true);

-- Permitir a usuarios autenticados INSERTAR contactos
CREATE POLICY "Users can insert contacts"
ON contacts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir a usuarios autenticados ACTUALIZAR contactos
CREATE POLICY "Users can update contacts"
ON contacts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir a usuarios autenticados ELIMINAR contactos
CREATE POLICY "Users can delete contacts"
ON contacts FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- PASO 5: CREAR POLÍTICAS RLS CORRECTAS PARA DEALS
-- ============================================================================

-- Permitir a usuarios autenticados VER todos los deals
CREATE POLICY "Users can view all deals"
ON deals FOR SELECT
TO authenticated
USING (true);

-- Permitir a usuarios autenticados INSERTAR deals
CREATE POLICY "Users can insert deals"
ON deals FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir a usuarios autenticados ACTUALIZAR deals
CREATE POLICY "Users can update deals"
ON deals FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir a usuarios autenticados ELIMINAR deals
CREATE POLICY "Users can delete deals"
ON deals FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- PASO 6: VERIFICAR CONFIGURACIÓN
-- ============================================================================

-- Verificar permisos en auth.users
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'auth' AND table_name = 'users'
  AND grantee = 'authenticated'
ORDER BY privilege_type;

-- Verificar que RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('contacts', 'deals')
  AND schemaname = 'public';

-- Verificar políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('contacts', 'deals')
  AND schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
--
-- 1. Permisos en auth.users:
--    - authenticated | auth | users | REFERENCES
--    - authenticated | auth | users | SELECT
--
-- 2. RLS habilitado:
--    - contacts  | true
--    - deals     | true
--
-- 3. Políticas creadas (8 en total):
--    - contacts: SELECT, INSERT, UPDATE, DELETE (4 políticas)
--    - deals: SELECT, INSERT, UPDATE, DELETE (4 políticas)
--
-- Si ves estos resultados, ¡el problema está resuelto! ✅
-- ============================================================================
