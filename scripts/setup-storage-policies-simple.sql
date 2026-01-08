-- ============================================================================
-- CONFIGURACIÓN SIMPLE DE POLÍTICAS DE STORAGE
-- ============================================================================
--
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el contenido y haz clic en "Run"
-- 4. Espera a que termine (deberías ver "Success")
--
-- ============================================================================

-- ============================================================================
-- PASO 1: Limpiar políticas anteriores (si existen)
-- ============================================================================

-- Eliminar políticas antiguas de company-logos
DROP POLICY IF EXISTS "Public Access for company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files in company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files in company-logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any company logo" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any company logo" ON storage.objects;

-- Eliminar políticas antiguas de images
DROP POLICY IF EXISTS "Public Access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- ============================================================================
-- PASO 2: Crear políticas para COMPANY-LOGOS
-- ============================================================================

-- 1. LECTURA PÚBLICA
CREATE POLICY "company_logos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- 2. SUBIDA (usuarios autenticados)
CREATE POLICY "company_logos_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- 3. ACTUALIZACIÓN (owner o admin)
CREATE POLICY "company_logos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    -- El usuario es dueño de la empresa
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.user_id = auth.uid()
    )
    -- O es admin
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'company-logos'
  AND (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.user_id = auth.uid()
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- 4. ELIMINACIÓN (owner o admin)
CREATE POLICY "company_logos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    -- El usuario es dueño de la empresa
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.user_id = auth.uid()
    )
    -- O es admin
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- ============================================================================
-- PASO 3: Crear políticas para IMAGES
-- ============================================================================

-- 1. LECTURA PÚBLICA
CREATE POLICY "images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 2. SUBIDA (usuarios autenticados)
CREATE POLICY "images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 3. ACTUALIZACIÓN (solo admins)
CREATE POLICY "images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  bucket_id = 'images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 4. ELIMINACIÓN (solo admins)
CREATE POLICY "images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- PASO 4: Verificar que las políticas se crearon correctamente
-- ============================================================================

-- Mostrar todas las políticas de company-logos
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (
    policyname LIKE '%company_logos%'
    OR policyname LIKE '%company-logos%'
  )
ORDER BY policyname;

-- Mostrar todas las políticas de images
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%images%'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 8 políticas en total:
--   company-logos: 4 políticas (read, upload, update, delete)
--   images: 4 políticas (read, upload, update, delete)
--
-- Si ves las 8 políticas, ¡todo está configurado correctamente! ✅
-- ============================================================================
