-- Script para agregar columnas de fecha de inicio y fecha de entrega a la tabla projects
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna start_date (fecha de inicio del proyecto)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS start_date date;

-- Agregar columna end_date (fecha de entrega del proyecto)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS end_date date;

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN projects.start_date IS 'Fecha de inicio del proyecto';
COMMENT ON COLUMN projects.end_date IS 'Fecha de entrega estimada del proyecto';
