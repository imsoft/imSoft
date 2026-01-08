-- ============================================================================
-- TABLA Y POLÍTICAS RLS PARA translation_logs
-- ============================================================================
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
--
-- Este script configura la tabla para rastrear el uso de la API de Google Translate:
-- 1. Almacena el número de caracteres traducidos por solicitud
-- 2. Permite a los usuarios insertar sus propios logs
-- 3. Solo administradores pueden ver todos los logs
-- ============================================================================

-- ============================================================================
-- CREAR TABLA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.translation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  characters_count INTEGER NOT NULL CHECK (characters_count > 0),
  source_language VARCHAR(10) DEFAULT 'es',
  target_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================

-- Índice para consultas por fecha (para obtener totales mensuales)
CREATE INDEX IF NOT EXISTS idx_translation_logs_created_at
ON public.translation_logs(created_at DESC);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_translation_logs_user_id
ON public.translation_logs(user_id);

-- Índice compuesto para consultas mensuales por usuario
CREATE INDEX IF NOT EXISTS idx_translation_logs_user_month
ON public.translation_logs(user_id, created_at DESC);

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================

ALTER TABLE public.translation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all translation logs" ON public.translation_logs;
DROP POLICY IF EXISTS "Users can insert their own translation logs" ON public.translation_logs;

-- ============================================================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ============================================================================

-- Política 1: Solo administradores pueden ver todos los logs
CREATE POLICY "Admins can view all translation logs"
ON public.translation_logs
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- POLÍTICAS DE ESCRITURA (INSERT)
-- ============================================================================

-- Política 2: Usuarios autenticados pueden insertar sus propios logs
CREATE POLICY "Users can insert their own translation logs"
ON public.translation_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCIÓN AUXILIAR: Obtener total de caracteres del mes actual
-- ============================================================================

CREATE OR REPLACE FUNCTION get_monthly_translation_characters()
RETURNS TABLE (
  total_characters BIGINT,
  translation_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(characters_count), 0)::BIGINT as total_characters,
    COUNT(*)::BIGINT as translation_count
  FROM public.translation_logs
  WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month';
END;
$$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Listar todas las políticas de la tabla translation_logs
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'translation_logs'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 2 políticas:
-- 1. "Admins can view all translation logs" - Solo admins pueden leer
-- 2. "Users can insert their own translation logs" - Usuarios pueden insertar
--
-- Si ves las 2 políticas, ¡todo está configurado correctamente! ✅
-- ============================================================================
