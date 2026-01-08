-- Agregar campos de GitHub a la tabla de proyectos
-- Esto permite vincular repositorios de GitHub a los proyectos para mostrar commits a los clientes

-- Agregar columnas de GitHub
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
ADD COLUMN IF NOT EXISTS github_owner TEXT,
ADD COLUMN IF NOT EXISTS github_repo_name TEXT,
ADD COLUMN IF NOT EXISTS github_enabled BOOLEAN DEFAULT false;

-- Comentarios para documentación
COMMENT ON COLUMN projects.github_repo_url IS 'URL completa del repositorio de GitHub (ej: https://github.com/owner/repo)';
COMMENT ON COLUMN projects.github_owner IS 'Propietario del repositorio en GitHub (extraído de la URL)';
COMMENT ON COLUMN projects.github_repo_name IS 'Nombre del repositorio en GitHub (extraído de la URL)';
COMMENT ON COLUMN projects.github_enabled IS 'Si está habilitado el seguimiento de commits de GitHub para este proyecto';
