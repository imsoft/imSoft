-- Script para eliminar las columnas name y role de la tabla testimonials
-- Estas columnas ya no son necesarias

-- Eliminar la columna role (opcional, puede no existir)
ALTER TABLE testimonials DROP COLUMN IF EXISTS role;

-- Eliminar la columna name (NOT NULL, pero la eliminamos)
-- Primero necesitamos eliminar la restricción NOT NULL si existe
ALTER TABLE testimonials ALTER COLUMN name DROP NOT NULL;
ALTER TABLE testimonials DROP COLUMN IF EXISTS name;

-- Eliminar el índice asociado a name si existe
DROP INDEX IF EXISTS idx_testimonials_name;

-- Comentarios para documentación
COMMENT ON TABLE testimonials IS 'Testimonios de clientes. El nombre y cargo se obtienen de la empresa asociada.';

