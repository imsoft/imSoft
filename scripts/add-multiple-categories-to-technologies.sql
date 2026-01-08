-- Agregar soporte para múltiples categorías en technologies
-- Cambiar category de VARCHAR a JSONB para almacenar array de categorías

-- Primero, migrar datos existentes: convertir categoría única a array
UPDATE technologies 
SET category = jsonb_build_array(category)
WHERE category IS NOT NULL AND category != '' AND category IS NOT NULL::jsonb;

-- Cambiar el tipo de columna a JSONB
-- Si la columna ya es JSONB, esto no hará nada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'technologies' 
    AND column_name = 'category' 
    AND data_type = 'character varying'
  ) THEN
    ALTER TABLE technologies 
      ALTER COLUMN category TYPE JSONB USING 
        CASE 
          WHEN category IS NULL OR category = '' THEN NULL::jsonb
          ELSE jsonb_build_array(category)
        END;
  END IF;
END $$;

-- Comentario actualizado
COMMENT ON COLUMN technologies.category IS 'Array de categorías en formato JSONB (ej: ["frontend", "backend"])';
