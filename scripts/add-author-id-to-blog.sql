-- Agregar columna author_id a la tabla blog
-- Este script agrega el campo para almacenar el ID del autor de la publicación

ALTER TABLE blog
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por autor
CREATE INDEX IF NOT EXISTS idx_blog_author_id ON blog(author_id);

-- Comentario para documentación
COMMENT ON COLUMN blog.author_id IS 'Referencia al usuario autor de la publicación';

