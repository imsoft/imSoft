-- Agregar soporte para múltiples categorías en technologies
-- Cambiar category de VARCHAR a JSONB para almacenar array de categorías

-- Primero, migrar datos existentes: convertir categoría única a array
UPDATE technologies 
SET category = jsonb_build_array(category)
WHERE category IS NOT NULL AND category != '';

-- Cambiar el tipo de columna a JSONB
ALTER TABLE technologies 
  ALTER COLUMN category TYPE JSONB USING category::jsonb;

-- Comentario actualizado
COMMENT ON COLUMN technologies.category IS 'Array de categorías en formato JSON (ej: ["frontend", "backend"])';
