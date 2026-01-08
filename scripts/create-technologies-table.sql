-- Crear tabla de tecnologías
CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_es VARCHAR(255),
  name_en VARCHAR(255),
  description_es TEXT,
  description_en TEXT,
  icon VARCHAR(100), -- Nombre del icono o URL del logo
  category VARCHAR(100), -- Frontend, Backend, Database, etc.
  website_url VARCHAR(500), -- URL oficial de la tecnología
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de relación entre tecnologías y empresas
CREATE TABLE IF NOT EXISTS technology_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technology_id, company_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_order ON technologies(order_index);
CREATE INDEX IF NOT EXISTS idx_technology_companies_tech ON technology_companies(technology_id);
CREATE INDEX IF NOT EXISTS idx_technology_companies_company ON technology_companies(company_id);

-- Habilitar RLS
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_companies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para technologies
-- Permitir lectura pública
CREATE POLICY "Technologies are viewable by everyone"
  ON technologies FOR SELECT
  USING (true);

-- Permitir inserción solo a admins
CREATE POLICY "Admins can insert technologies"
  ON technologies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Permitir actualización solo a admins
CREATE POLICY "Admins can update technologies"
  ON technologies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Permitir eliminación solo a admins
CREATE POLICY "Admins can delete technologies"
  ON technologies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

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

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_technologies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_technologies_updated_at
  BEFORE UPDATE ON technologies
  FOR EACH ROW
  EXECUTE FUNCTION update_technologies_updated_at();

-- Comentarios
COMMENT ON TABLE technologies IS 'Tecnologías que utiliza imSoft';
COMMENT ON TABLE technology_companies IS 'Relación entre tecnologías y empresas que las utilizan';
COMMENT ON COLUMN technologies.name IS 'Nombre de la tecnología (fallback si no hay name_es o name_en)';
COMMENT ON COLUMN technologies.description_es IS 'Descripción en español de para qué se utiliza la tecnología';
COMMENT ON COLUMN technologies.description_en IS 'Descripción en inglés de para qué se utiliza la tecnología';
COMMENT ON COLUMN technologies.category IS 'Categoría de la tecnología (Frontend, Backend, Database, etc.)';
COMMENT ON COLUMN technologies.order_index IS 'Orden de visualización';
