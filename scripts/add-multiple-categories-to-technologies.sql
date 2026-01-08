-- Agregar soporte para múltiples categorías en technologies
-- Cambiar category de VARCHAR a JSONB para almacenar array de categorías

-- Cambiar el tipo de columna a JSONB y migrar datos existentes
-- Si la columna ya es JSONB, esto no hará nada
DO $$
BEGIN
  -- Verificar si la columna es VARCHAR y necesita migración
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'technologies' 
    AND column_name = 'category' 
    AND data_type = 'character varying'
  ) THEN
    -- Cambiar el tipo a JSONB y convertir valores existentes
    ALTER TABLE technologies 
      ALTER COLUMN category TYPE JSONB USING 
        CASE 
          WHEN category IS NULL OR category = '' THEN NULL::jsonb
          -- Si ya es un array JSON válido, mantenerlo
          WHEN category ~ '^\[.*\]$' THEN category::jsonb
          -- Si es un string simple, convertirlo a array
          ELSE jsonb_build_array(category)
        END;
  END IF;
END $$;

-- Comentario actualizado
COMMENT ON COLUMN technologies.category IS 'Array de categorías en formato JSONB (ej: ["frontend", "backend"])';
