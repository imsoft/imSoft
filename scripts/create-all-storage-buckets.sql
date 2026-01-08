-- ============================================================================
-- CREAR TODOS LOS BUCKETS DE STORAGE
-- ============================================================================
--
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el contenido y haz clic en "Run"
--
-- Este script creará 7 buckets:
-- - company-logos
-- - profile-images
-- - blog-images
-- - service-images
-- - portfolio-images
-- - project-images
-- - testimonial-images
--
-- ============================================================================

-- ============================================================================
-- 1. COMPANY LOGOS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- 2. PROFILE IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- 3. BLOG IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- 4. SERVICE IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- 5. PORTFOLIO IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- 6. PROJECT IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- 7. TESTIMONIAL IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-images',
  'testimonial-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Listar todos los buckets creados
SELECT
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  array_length(allowed_mime_types, 1) as mime_types_count,
  created_at
FROM storage.buckets
WHERE id IN (
  'company-logos',
  'profile-images',
  'blog-images',
  'service-images',
  'portfolio-images',
  'project-images',
  'testimonial-images'
)
ORDER BY id;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Deberías ver 7 buckets:
-- 1. blog-images (10 MB, público)
-- 2. company-logos (5 MB, público)
-- 3. portfolio-images (10 MB, público)
-- 4. profile-images (5 MB, público)
-- 5. project-images (10 MB, público)
-- 6. service-images (10 MB, público)
-- 7. testimonial-images (5 MB, público)
--
-- Si ves los 7 buckets, ¡todo está configurado correctamente! ✅
-- ============================================================================
