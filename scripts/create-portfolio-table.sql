-- Crear tabla de portafolio
-- Esta tabla almacena los proyectos del portafolio
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_es TEXT,
  title_en TEXT,
  title TEXT, -- Campo legacy para compatibilidad
  description_es TEXT,
  description_en TEXT,
  description TEXT, -- Campo legacy para compatibilidad
  slug TEXT UNIQUE,
  image_url TEXT,
  project_url TEXT,
  client TEXT, -- Campo legacy para compatibilidad
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  project_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON portfolio(slug);

-- Índice para búsquedas por título
CREATE INDEX IF NOT EXISTS idx_portfolio_title_es ON portfolio(title_es);
CREATE INDEX IF NOT EXISTS idx_portfolio_title_en ON portfolio(title_en);

-- Índice para búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_portfolio_company_id ON portfolio(company_id);

-- Índice para búsquedas por tipo de proyecto
CREATE INDEX IF NOT EXISTS idx_portfolio_project_type ON portfolio(project_type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública del portafolio
CREATE POLICY "Public can read portfolio"
  ON portfolio FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar en el portafolio
CREATE POLICY "Admins can insert portfolio"
  ON portfolio FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden actualizar el portafolio
CREATE POLICY "Admins can update portfolio"
  ON portfolio FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden eliminar del portafolio
CREATE POLICY "Admins can delete portfolio"
  ON portfolio FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE portfolio IS 'Proyectos del portafolio de la empresa';
COMMENT ON COLUMN portfolio.title_es IS 'Título del proyecto en español';
COMMENT ON COLUMN portfolio.title_en IS 'Título del proyecto en inglés';
COMMENT ON COLUMN portfolio.description_es IS 'Descripción del proyecto en español';
COMMENT ON COLUMN portfolio.description_en IS 'Descripción del proyecto en inglés';
COMMENT ON COLUMN portfolio.slug IS 'URL amigable única para el proyecto';
COMMENT ON COLUMN portfolio.image_url IS 'URL de la imagen del proyecto almacenada en Supabase Storage';
COMMENT ON COLUMN portfolio.project_url IS 'URL del proyecto en vivo';
COMMENT ON COLUMN portfolio.client IS 'Campo legacy para compatibilidad con versiones anteriores';
COMMENT ON COLUMN portfolio.company_id IS 'Referencia a la empresa propietaria del proyecto';
COMMENT ON COLUMN portfolio.project_type IS 'Tipo de proyecto (ej: web, mobile, etc.)';

