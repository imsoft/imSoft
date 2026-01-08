-- Script para agregar título y descripción a las cotizaciones
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna title (título de la cotización)
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS title character varying(255);

-- Agregar columna description (descripción detallada de la cotización)
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS description text;

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN quotations.title IS 'Título de la cotización';
COMMENT ON COLUMN quotations.description IS 'Descripción detallada de la cotización con información adicional';

-- Opcional: Actualizar cotizaciones existentes con un título por defecto basado en el nombre del cliente
UPDATE quotations
SET title = 'Cotización para ' || COALESCE(client_name, 'Cliente')
WHERE title IS NULL OR title = '';
