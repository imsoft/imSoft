-- ============================================================================
-- POLÍTICAS DE ACCESO PARA STORAGE BUCKETS
-- ============================================================================
-- Este script configura las políticas RLS para los buckets de Supabase Storage
-- Estructura de archivos: /<id>/imagen.ext
--
-- Buckets:
--   - company-logos: /<company_id>/logo.ext
--   - images: /<resource_id>/image.ext
--
-- IMPORTANTE: Este script debe ejecutarse en Supabase Dashboard > SQL Editor
-- NO puede ejecutarse desde scripts externos debido a restricciones de permisos
-- ============================================================================

-- Nota: Las políticas de storage.objects solo pueden ser modificadas desde el Dashboard
-- Si obtienes error "must be owner of relation objects", estás usando el script correcto
-- pero debes ejecutarlo desde el SQL Editor en el Dashboard de Supabase

-- ============================================================================
-- BUCKET: company-logos
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public Access for company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files in company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files in company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all company logos" ON storage.objects;

-- 1. LECTURA PÚBLICA: Todos pueden ver los logos
CREATE POLICY "Public read access for company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- 2. SUBIDA: Usuarios autenticados pueden subir logos
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- 3. ACTUALIZACIÓN:
-- 3a. Los usuarios pueden actualizar el logo de su propia empresa
CREATE POLICY "Users can update their company logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
  AND (
    -- Verificar que el usuario es dueño de la empresa
    -- La carpeta debe coincidir con el company_id del usuario
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- 3b. Los admins pueden actualizar cualquier logo
CREATE POLICY "Admins can update any company logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 4. ELIMINACIÓN:
-- 4a. Los usuarios pueden eliminar el logo de su propia empresa
CREATE POLICY "Users can delete their company logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
  AND (
    -- Verificar que el usuario es dueño de la empresa
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.user_id = auth.uid()
    )
  )
);

-- 4b. Los admins pueden eliminar cualquier logo
CREATE POLICY "Admins can delete any company logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- BUCKET: images
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public Access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all images" ON storage.objects;

-- 1. LECTURA PÚBLICA: Todos pueden ver las imágenes
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 2. SUBIDA: Solo usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- 3. ACTUALIZACIÓN: Solo admins pueden actualizar imágenes
-- (Las imágenes del sitio son gestionadas por admins)
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 4. ELIMINACIÓN: Solo admins pueden eliminar imágenes
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON POLICY "Public read access for company logos" ON storage.objects IS
  'Permite lectura pública de logos de empresas. Estructura: /<company_id>/logo.ext';

COMMENT ON POLICY "Authenticated users can upload company logos" ON storage.objects IS
  'Permite a usuarios autenticados subir logos de empresas';

COMMENT ON POLICY "Users can update their company logo" ON storage.objects IS
  'Permite a usuarios actualizar el logo de su propia empresa';

COMMENT ON POLICY "Admins can update any company logo" ON storage.objects IS
  'Permite a administradores actualizar cualquier logo de empresa';

COMMENT ON POLICY "Users can delete their company logo" ON storage.objects IS
  'Permite a usuarios eliminar el logo de su propia empresa';

COMMENT ON POLICY "Admins can delete any company logo" ON storage.objects IS
  'Permite a administradores eliminar cualquier logo de empresa';

COMMENT ON POLICY "Public read access for images" ON storage.objects IS
  'Permite lectura pública de imágenes del sitio. Estructura: /<resource_id>/image.ext';

COMMENT ON POLICY "Authenticated users can upload images" ON storage.objects IS
  'Permite a usuarios autenticados subir imágenes';

COMMENT ON POLICY "Admins can update images" ON storage.objects IS
  'Solo administradores pueden actualizar imágenes del sitio';

COMMENT ON POLICY "Admins can delete images" ON storage.objects IS
  'Solo administradores pueden eliminar imágenes del sitio';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar políticas creadas para company-logos
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%company%'
ORDER BY policyname;

-- Verificar políticas creadas para images
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%images%'
ORDER BY policyname;
