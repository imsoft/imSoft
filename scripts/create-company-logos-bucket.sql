-- Crear bucket para logos de empresas en Supabase Storage
-- Este script crea el bucket 'company-logos' y configura las políticas de acceso

-- Crear el bucket (público para que las imágenes sean accesibles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true, -- Bucket público
  5242880, -- Límite de 5MB (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'] -- Solo tipos de imagen
)
ON CONFLICT (id) DO NOTHING;

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

-- Política: Permitir actualización a usuarios autenticados (solo sus propios archivos)
-- Nota: En Supabase Storage, los usuarios solo pueden actualizar/eliminar sus propios archivos
-- basándose en el ownership del archivo
CREATE POLICY "Authenticated users can update their own files in company-logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
);

-- Política: Permitir eliminación a usuarios autenticados (solo sus propios archivos)
CREATE POLICY "Authenticated users can delete their own files in company-logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Comentario para documentación
COMMENT ON TABLE storage.buckets IS 'Buckets de Supabase Storage';
COMMENT ON POLICY "Public Access for company-logos" ON storage.objects IS 'Permite lectura pública de logos de empresas';
COMMENT ON POLICY "Authenticated users can upload to company-logos" ON storage.objects IS 'Permite a usuarios autenticados subir logos';
COMMENT ON POLICY "Authenticated users can update their own files in company-logos" ON storage.objects IS 'Permite a usuarios autenticados actualizar sus propios logos';
COMMENT ON POLICY "Authenticated users can delete their own files in company-logos" ON storage.objects IS 'Permite a usuarios autenticados eliminar sus propios logos';

