-- Tabla de relación entre proyectos y tecnologías
CREATE TABLE IF NOT EXISTS project_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, technology_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_project_technologies_project_id ON project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_technologies_technology_id ON project_technologies(technology_id);

-- RLS Policies
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan ver todas las relaciones
CREATE POLICY "Admins can view all project technologies"
  ON project_technologies
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan insertar relaciones
CREATE POLICY "Admins can insert project technologies"
  ON project_technologies
  FOR INSERT
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan actualizar relaciones
CREATE POLICY "Admins can update project technologies"
  ON project_technologies
  FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan eliminar relaciones
CREATE POLICY "Admins can delete project technologies"
  ON project_technologies
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los clientes puedan ver las tecnologías de sus proyectos
CREATE POLICY "Clients can view their project technologies"
  ON project_technologies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_technologies.project_id
      AND projects.company_id IN (
        SELECT id FROM companies
        WHERE user_id = auth.uid()
      )
    )
  );
