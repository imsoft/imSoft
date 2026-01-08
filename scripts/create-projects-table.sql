-- Crear tabla de proyectos
-- Esta tabla almacena los proyectos de los clientes
CREATE TABLE IF NOT EXISTS projects (
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
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Índice para búsquedas por título
CREATE INDEX IF NOT EXISTS idx_projects_title_es ON projects(title_es);
CREATE INDEX IF NOT EXISTS idx_projects_title_en ON projects(title_en);

-- Índice para búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);

-- Índice para búsquedas por tipo de proyecto
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Índice para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios proyectos
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = projects.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden ver todos los proyectos
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Los usuarios pueden insertar proyectos para sus empresas
CREATE POLICY "Users can insert projects for their companies"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = projects.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden insertar proyectos para cualquier empresa
CREATE POLICY "Admins can insert projects for any company"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Los usuarios pueden actualizar sus propios proyectos
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = projects.company_id
      AND companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = projects.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden actualizar cualquier proyecto
CREATE POLICY "Admins can update any project"
  ON projects FOR UPDATE
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

-- Política: Los usuarios pueden eliminar sus propios proyectos
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = projects.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden eliminar cualquier proyecto
CREATE POLICY "Admins can delete any project"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE projects IS 'Proyectos de los clientes';
COMMENT ON COLUMN projects.title_es IS 'Título del proyecto en español';
COMMENT ON COLUMN projects.title_en IS 'Título del proyecto en inglés';
COMMENT ON COLUMN projects.description_es IS 'Descripción del proyecto en español';
COMMENT ON COLUMN projects.description_en IS 'Descripción del proyecto en inglés';
COMMENT ON COLUMN projects.slug IS 'URL amigable única para el proyecto';
COMMENT ON COLUMN projects.image_url IS 'URL de la imagen del proyecto almacenada en Supabase Storage';
COMMENT ON COLUMN projects.project_url IS 'URL del proyecto en vivo';
COMMENT ON COLUMN projects.client IS 'Campo legacy para compatibilidad con versiones anteriores';
COMMENT ON COLUMN projects.company_id IS 'Referencia a la empresa propietaria del proyecto';
COMMENT ON COLUMN projects.project_type IS 'Tipo de proyecto (ej: web, mobile, etc.)';
COMMENT ON COLUMN projects.status IS 'Estado del proyecto (planning, in_progress, completed, on_hold)';

