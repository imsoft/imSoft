-- Actualizar tabla de tecnologías para agregar logo_url y quitar icon y order_index
ALTER TABLE technologies 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  DROP COLUMN IF EXISTS icon,
  DROP COLUMN IF EXISTS order_index;

-- Cambiar tabla technology_companies para almacenar nombres de empresas en lugar de IDs
-- Primero eliminar la tabla antigua si existe
DROP TABLE IF EXISTS technology_companies CASCADE;

-- Crear nueva tabla con nombres de empresas
CREATE TABLE IF NOT EXISTS technology_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL, -- Nombre de la empresa famosa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technology_id, company_name)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_technology_companies_tech ON technology_companies(technology_id);

-- Habilitar RLS
ALTER TABLE technology_companies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para technology_companies
-- Permitir lectura pública
CREATE POLICY "Technology companies are viewable by everyone"
  ON technology_companies FOR SELECT
  USING (true);

-- Permitir inserción solo a admins
CREATE POLICY "Admins can insert technology companies"
  ON technology_companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Permitir actualización solo a admins
CREATE POLICY "Admins can update technology companies"
  ON technology_companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Permitir eliminación solo a admins
CREATE POLICY "Admins can delete technology companies"
  ON technology_companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Eliminar índice de order_index si existe
DROP INDEX IF EXISTS idx_technologies_order;

-- Comentarios actualizados
COMMENT ON COLUMN technologies.logo_url IS 'URL del logo de la tecnología almacenado en Supabase Storage';
COMMENT ON TABLE technology_companies IS 'Empresas famosas que utilizan cada tecnología';
COMMENT ON COLUMN technology_companies.company_name IS 'Nombre de la empresa famosa (ej: Liverpool, Netflix, etc.)';
