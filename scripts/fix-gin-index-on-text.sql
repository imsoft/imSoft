-- ============================================================================
-- CORRECCIÓN: Índices GIN en columnas TEXT
-- ============================================================================
--
-- PROBLEMA: PostgreSQL no permite índices GIN directamente en columnas TEXT
-- sin especificar una clase de operador.
--
-- SOLUCIONES:
-- 1. Para búsquedas normales: Usar BTREE (predeterminado)
-- 2. Para búsquedas full-text: Convertir a tsvector y crear índice GIN
-- 3. Para búsquedas de texto similar: Usar pg_trgm con gin_trgm_ops
-- ============================================================================

-- ============================================================================
-- OPCIÓN 1: Cambiar índices GIN a BTREE (Recomendado para la mayoría de casos)
-- ============================================================================
-- Si tienes un índice GIN en una columna TEXT que está causando error,
-- elimínalo y créalo como BTREE:

-- Ejemplo para columna title_es en tabla blog:
-- DROP INDEX IF EXISTS idx_blog_title_es_gin;
-- CREATE INDEX IF NOT EXISTS idx_blog_title_es ON blog(title_es);

-- Ejemplo para columna content_es en tabla blog:
-- DROP INDEX IF EXISTS idx_blog_content_es_gin;
-- CREATE INDEX IF NOT EXISTS idx_blog_content_es ON blog(content_es);

-- ============================================================================
-- OPCIÓN 2: Búsqueda Full-Text con tsvector (Para búsquedas avanzadas)
-- ============================================================================
-- Si necesitas búsqueda full-text, crea una columna tsvector y un índice GIN:

-- Para tabla blog con búsqueda full-text en content_es:
-- ALTER TABLE blog ADD COLUMN IF NOT EXISTS content_es_tsvector tsvector;
-- 
-- CREATE OR REPLACE FUNCTION blog_content_es_tsvector_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.content_es_tsvector := to_tsvector('spanish', COALESCE(NEW.content_es, ''));
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER blog_content_es_tsvector_trigger
--   BEFORE INSERT OR UPDATE ON blog
--   FOR EACH ROW
--   EXECUTE FUNCTION blog_content_es_tsvector_update();
--
-- CREATE INDEX IF NOT EXISTS idx_blog_content_es_tsvector 
-- ON blog USING gin(content_es_tsvector);
--
-- -- Actualizar registros existentes
-- UPDATE blog SET content_es = content_es WHERE content_es IS NOT NULL;

-- ============================================================================
-- OPCIÓN 3: Búsqueda de Texto Similar con pg_trgm (Para LIKE/ILIKE)
-- ============================================================================
-- Si necesitas búsquedas con LIKE o ILIKE optimizadas:

-- Primero habilita la extensión (si no está habilitada):
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Luego crea el índice GIN con gin_trgm_ops:
-- CREATE INDEX IF NOT EXISTS idx_blog_title_es_trgm 
-- ON blog USING gin(title_es gin_trgm_ops);

-- ============================================================================
-- VERIFICAR ÍNDICES EXISTENTES
-- ============================================================================
-- Para ver qué índices tienes en columnas TEXT:

-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('blog', 'projects', 'services', 'portfolio')
--   AND indexdef LIKE '%gin%'
-- ORDER BY tablename, indexname;

-- ============================================================================
-- ELIMINAR ÍNDICES GIN PROBLEMÁTICOS
-- ============================================================================
-- Si encuentras índices GIN problemáticos, elimínalos:

-- DROP INDEX IF EXISTS nombre_del_indice_problematico;

-- ============================================================================
-- RECOMENDACIÓN GENERAL
-- ============================================================================
-- Para la mayoría de casos de uso, los índices BTREE (predeterminado) son
-- suficientes y más eficientes. Solo usa GIN si necesitas:
-- - Búsqueda full-text avanzada (tsvector)
-- - Búsquedas con LIKE/ILIKE en texto largo (pg_trgm)
-- - Búsquedas en arrays o JSONB

-- Los scripts actuales del proyecto usan BTREE, que es correcto.
-- Si estás creando índices manualmente, asegúrate de no usar GIN en TEXT
-- sin especificar la clase de operador correcta.
