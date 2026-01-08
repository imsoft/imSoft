-- ============================================================================
-- CREAR BUCKET PARA LOGOS DE TECNOLOGÍAS
-- ============================================================================
--
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el contenido y haz clic en "Run"
--
-- ============================================================================

-- Crear bucket para logos de tecnologías
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'technology-logos',
  'technology-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- POLÍTICAS RLS PARA TECHNOLOGY-LOGOS
-- ============================================================================

-- Permitir lectura pública
CREATE POLICY "Technology logos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'technology-logos');

-- Permitir inserción solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload technology logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'technology-logos' AND
    auth.role() = 'authenticated'
  );

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Authenticated users can update technology logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'technology-logos' AND
    auth.role() = 'authenticated'
  );

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Authenticated users can delete technology logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'technology-logos' AND
    auth.role() = 'authenticated'
  );
