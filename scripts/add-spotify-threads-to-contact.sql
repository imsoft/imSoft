-- Script para agregar las columnas spotify y threads a la tabla contact
-- Ejecuta este script si la tabla contact ya existe y necesitas agregar estos campos

-- Agregar columna spotify si no existe
ALTER TABLE contact
ADD COLUMN IF NOT EXISTS spotify TEXT;

-- Agregar columna threads si no existe
ALTER TABLE contact
ADD COLUMN IF NOT EXISTS threads TEXT;

-- Actualizar comentarios
COMMENT ON COLUMN contact.spotify IS 'URL del perfil o playlist de Spotify';
COMMENT ON COLUMN contact.threads IS 'URL del perfil de Threads';

