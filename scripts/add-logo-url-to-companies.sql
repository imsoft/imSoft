-- Agregar columna logo_url a la tabla companies
-- Este script agrega el campo para almacenar la URL del logo de la empresa en Supabase Storage

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Comentario para documentación
COMMENT ON COLUMN companies.logo_url IS 'URL del logo de la empresa almacenado en Supabase Storage';

