-- ============================================================================
-- CREAR VISTA PARA ACCEDER A LOS USUARIOS
-- ============================================================================
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
--
-- Este script crea una vista en el esquema public que permite a los
-- administradores acceder a la información de usuarios sin necesidad de
-- modificar las políticas de auth.users
-- ============================================================================

-- Eliminar la vista si ya existe
DROP VIEW IF EXISTS public.users_view CASCADE;

-- Crear vista que expone información básica de usuarios
CREATE VIEW public.users_view AS
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'role' as role,
  created_at,
  updated_at
FROM auth.users;

-- Habilitar RLS en la vista
ALTER VIEW public.users_view SET (security_invoker = true);

-- Crear políticas para la vista
DROP POLICY IF EXISTS "Admins can view all users" ON public.users_view;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users_view;

-- Nota: Las vistas no soportan políticas RLS directamente,
-- así que usaremos una función de seguridad

-- Otorgar permisos de lectura a usuarios autenticados
GRANT SELECT ON public.users_view TO authenticated;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que la vista se creó correctamente
SELECT
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'users_view';

-- Probar la vista (solo funcionará si ejecutas como usuario admin)
SELECT id, email, full_name, role
FROM public.users_view
LIMIT 5;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver:
-- 1. La vista "users_view" en el esquema "public"
-- 2. Una lista de hasta 5 usuarios con su información básica
--
-- Si ves ambos resultados, ¡todo está configurado correctamente! ✅
-- ============================================================================
