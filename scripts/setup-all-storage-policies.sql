-- ============================================================================
-- CONFIGURACIÓN COMPLETA DE POLÍTICAS DE STORAGE
-- ============================================================================
--
-- BUCKETS INCLUIDOS:
-- 1. company-logos - Logos de empresas
-- 2. profile-images - Avatares de usuarios
-- 3. blog-images - Imágenes de blog
-- 4. service-images - Imágenes de servicios
-- 5. portfolio-images - Imágenes de portfolio
-- 6. project-images - Imágenes de proyectos
-- 7. testimonial-images - Avatares de testimonios
--
-- ESTRUCTURA: /<resource_id>/imagen.ext
--
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el contenido y haz clic en "Run"
--
-- ============================================================================

-- ============================================================================
-- PASO 1: Limpiar políticas anteriores
-- ============================================================================

-- Company Logos
DROP POLICY IF EXISTS "company_logos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "company_logos_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "company_logos_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "company_logos_owner_delete" ON storage.objects;

-- Profile Images
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;

-- Blog Images
DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_delete" ON storage.objects;

-- Service Images
DROP POLICY IF EXISTS "service_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "service_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "service_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "service_images_admin_delete" ON storage.objects;

-- Portfolio Images
DROP POLICY IF EXISTS "portfolio_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_admin_delete" ON storage.objects;

-- Project Images
DROP POLICY IF EXISTS "project_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "project_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "project_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "project_images_admin_delete" ON storage.objects;

-- Testimonial Images
DROP POLICY IF EXISTS "testimonial_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "testimonial_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "testimonial_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "testimonial_images_admin_delete" ON storage.objects;

-- ============================================================================
-- PASO 2: COMPANY LOGOS (/<company_id>/logo.ext)
-- ============================================================================

CREATE POLICY "company_logos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

CREATE POLICY "company_logos_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "company_logos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
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

CREATE POLICY "company_logos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
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

-- ============================================================================
-- PASO 3: PROFILE IMAGES (/<user_id>/avatar.ext)
-- ============================================================================

CREATE POLICY "profile_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "profile_images_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

CREATE POLICY "profile_images_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- ============================================================================
-- PASO 4: BLOG IMAGES (/<blog_id>/cover.ext, /<blog_id>/image-1.ext)
-- ============================================================================

CREATE POLICY "blog_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "blog_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "blog_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- PASO 5: SERVICE IMAGES (/<service_id>/hero.ext, /<service_id>/icon.ext)
-- ============================================================================

CREATE POLICY "service_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');

CREATE POLICY "service_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "service_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "service_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- PASO 6: PORTFOLIO IMAGES (/<portfolio_id>/thumbnail.ext)
-- ============================================================================

CREATE POLICY "portfolio_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

CREATE POLICY "portfolio_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "portfolio_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "portfolio_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- PASO 7: PROJECT IMAGES (/<project_id>/screenshot.ext)
-- ============================================================================

CREATE POLICY "project_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

CREATE POLICY "project_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "project_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "project_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- PASO 8: TESTIMONIAL IMAGES (/<testimonial_id>/avatar.ext)
-- ============================================================================

CREATE POLICY "testimonial_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonial-images');

CREATE POLICY "testimonial_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'testimonial-images');

CREATE POLICY "testimonial_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'testimonial-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "testimonial_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'testimonial-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar políticas creadas
SELECT
  bucket_id,
  COUNT(*) as total_policies
FROM (
  SELECT
    split_part(policyname, '_', 1) || '-' || split_part(policyname, '_', 2) as bucket_id
  FROM pg_policies
  WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND (
      policyname LIKE '%company_logos%'
      OR policyname LIKE '%profile_images%'
      OR policyname LIKE '%blog_images%'
      OR policyname LIKE '%service_images%'
      OR policyname LIKE '%portfolio_images%'
      OR policyname LIKE '%project_images%'
      OR policyname LIKE '%testimonial_images%'
    )
) as policies
GROUP BY bucket_id
ORDER BY bucket_id;

-- Listar todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (
    policyname LIKE '%company_logos%'
    OR policyname LIKE '%profile_images%'
    OR policyname LIKE '%blog_images%'
    OR policyname LIKE '%service_images%'
    OR policyname LIKE '%portfolio_images%'
    OR policyname LIKE '%project_images%'
    OR policyname LIKE '%testimonial_images%'
  )
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 28 políticas en total (4 por cada bucket):
--   - company-logos: 4 políticas
--   - profile-images: 4 políticas
--   - blog-images: 4 políticas
--   - service-images: 4 políticas
--   - portfolio-images: 4 políticas
--   - project-images: 4 políticas
--   - testimonial-images: 4 políticas
--
-- Si ves todas las políticas, ¡todo está configurado correctamente! ✅
-- ============================================================================
