-- =============================================================================
-- Agregar columna `category` a la tabla services
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================================
-- Permite distinguir entre servicios de tecnología y de marketing.
-- Los servicios existentes se marcan como 'technology' por defecto.

-- 1. Agregar columna con default 'technology'
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'technology';

-- 2. Asegurar que todos los servicios existentes tengan categoría
UPDATE public.services
  SET category = 'technology'
  WHERE category IS NULL;

-- 3. Crear índice para consultas filtradas por categoría
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);

-- 4. Documentación
COMMENT ON COLUMN public.services.category IS 'Categoría del servicio: technology | marketing';

-- Verificación
SELECT slug, title_es, category FROM public.services ORDER BY category, created_at;
