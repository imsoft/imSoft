-- Agregar columna resources_url a la tabla projects
-- Este campo almacena enlaces a recursos externos como Google Drive con imágenes del proyecto

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS resources_url TEXT;

-- Comentario para documentación
COMMENT ON COLUMN projects.resources_url IS 'URL de recursos externos (ej: Google Drive) con imágenes y archivos del proyecto';

