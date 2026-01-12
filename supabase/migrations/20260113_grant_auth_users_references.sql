-- ============================================================================
-- OTORGAR PERMISOS PARA VERIFICAR FOREIGN KEYS EN auth.users
-- ============================================================================
--
-- Este script otorga los permisos mínimos necesarios para que las tablas
-- del CRM puedan verificar foreign keys contra auth.users
--
-- PROBLEMA:
-- Al insertar contactos/deals con created_by, Postgres necesita verificar
-- que el user_id existe en auth.users, pero no tiene permisos de SELECT.
--
-- SOLUCIÓN:
-- Otorgar permiso REFERENCES en auth.users para que Postgres pueda
-- verificar foreign keys sin necesidad de políticas RLS complejas.
-- ============================================================================

-- Otorgar permiso REFERENCES en auth.users a authenticated users
-- Esto permite que Postgres verifique foreign keys sin dar acceso completo
GRANT REFERENCES ON auth.users TO authenticated;

-- También otorgar SELECT mínimo para verificar constraints
-- Esto es seguro porque solo se usa para verificar que el ID existe
GRANT SELECT (id) ON auth.users TO authenticated;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que los permisos se otorgaron correctamente
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'auth' AND table_name = 'users'
  AND grantee = 'authenticated'
ORDER BY privilege_type;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver al menos:
-- 1. authenticated | auth | users | REFERENCES
-- 2. authenticated | auth | users | SELECT (o similar)
--
-- Si ves estos permisos, ¡el problema está resuelto! ✅
--
-- IMPORTANTE: Este approach es seguro porque:
-- - Solo permite verificar que un ID existe (para foreign keys)
-- - No permite leer datos sensibles de usuarios
-- - Las políticas RLS en las tablas CRM siguen protegiendo el acceso
-- ============================================================================
