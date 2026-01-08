-- Script alternativo: Solo políticas RLS para el bucket company-logos
-- IMPORTANTE: Este script asume que el bucket 'company-logos' ya fue creado
-- desde la interfaz web de Supabase (Storage → New bucket)

-- Si el bucket no existe, créalo primero desde la interfaz web:
-- 1. Ve a Storage → New bucket
-- 2. Nombre: company-logos
-- 3. Public bucket: ✅ Activado
-- 4. Restrict file size: 5MB (opcional)
-- 5. Restrict MIME types: image/* (opcional)
-- 6. Create bucket

-- Luego ejecuta este script para configurar las políticas RLS

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Public Access for company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files in company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files in company-logos" ON storage.objects;

-- Política: Permitir lectura pública de los logos
CREATE POLICY "Public Access for company-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Política: Permitir subida de archivos a usuarios autenticados
CREATE POLICY "Authenticated users can upload to company-logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
);

-- Política: Permitir actualización a usuarios autenticados
-- Nota: En Supabase Storage, los usuarios pueden actualizar sus propios archivos
CREATE POLICY "Authenticated users can update their own files in company-logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
);

-- Política: Permitir eliminación a usuarios autenticados
CREATE POLICY "Authenticated users can delete their own files in company-logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
);

-- Comentarios para documentación
COMMENT ON POLICY "Public Access for company-logos" ON storage.objects IS 'Permite lectura pública de logos de empresas';
COMMENT ON POLICY "Authenticated users can upload to company-logos" ON storage.objects IS 'Permite a usuarios autenticados subir logos';
COMMENT ON POLICY "Authenticated users can update their own files in company-logos" ON storage.objects IS 'Permite a usuarios autenticados actualizar sus propios logos';
COMMENT ON POLICY "Authenticated users can delete their own files in company-logos" ON storage.objects IS 'Permite a usuarios autenticados eliminar sus propios logos';

