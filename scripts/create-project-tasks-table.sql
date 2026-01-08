-- Crear tabla de tareas de proyectos
-- Esta tabla almacena las tareas/funcionalidades de cada proyecto para seguimiento de progreso

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índice para búsquedas rápidas por proyecto
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

-- Índice para ordenar por orden
CREATE INDEX IF NOT EXISTS idx_project_tasks_order ON project_tasks(project_id, order_index);

-- Índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_project_tasks_completed ON project_tasks(completed);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_tasks_updated_at();

-- Trigger para actualizar completed_at cuando se marca como completada
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_completed_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver las tareas de sus propios proyectos
CREATE POLICY "Users can view tasks of their own projects"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN companies ON projects.company_id = companies.id
      WHERE projects.id = project_tasks.project_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden ver todas las tareas
CREATE POLICY "Admins can view all tasks"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo los administradores pueden insertar tareas
CREATE POLICY "Admins can insert tasks"
  ON project_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo los administradores pueden actualizar tareas
CREATE POLICY "Admins can update tasks"
  ON project_tasks FOR UPDATE
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

-- Política: Solo los administradores pueden eliminar tareas
CREATE POLICY "Admins can delete tasks"
  ON project_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE project_tasks IS 'Tareas y funcionalidades de los proyectos para seguimiento de progreso';
COMMENT ON COLUMN project_tasks.project_id IS 'Referencia al proyecto al que pertenece la tarea';
COMMENT ON COLUMN project_tasks.title IS 'Título de la tarea o funcionalidad';
COMMENT ON COLUMN project_tasks.description IS 'Descripción detallada de la tarea (opcional)';
COMMENT ON COLUMN project_tasks.completed IS 'Si la tarea ha sido completada';
COMMENT ON COLUMN project_tasks.order_index IS 'Orden de la tarea en la lista';
COMMENT ON COLUMN project_tasks.completed_at IS 'Fecha y hora en que se completó la tarea';
