-- Agregar columna logo_url a technology_companies
ALTER TABLE technology_companies 
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Comentario actualizado
COMMENT ON COLUMN technology_companies.logo_url IS 'URL del logo de la empresa almacenado en Supabase Storage';
