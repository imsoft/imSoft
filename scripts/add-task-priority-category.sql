-- Agregar campos de prioridad y categoría a la tabla de tareas
-- Esto permite organizar mejor las tareas y darles contexto visual

-- Agregar columnas de prioridad y categoría
ALTER TABLE project_tasks
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS category TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN project_tasks.priority IS 'Prioridad de la tarea: low, medium, high, critical';
COMMENT ON COLUMN project_tasks.category IS 'Categoría de la tarea (ej: Frontend, Backend, Design, Testing, etc.)';
