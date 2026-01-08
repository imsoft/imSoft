-- Eliminar el campo type de la tabla feedbacks
ALTER TABLE feedbacks DROP COLUMN IF EXISTS type;

-- Eliminar el índice relacionado si existe
DROP INDEX IF EXISTS idx_feedbacks_type;

