-- Crear tabla de blog
-- Esta tabla almacena las publicaciones del blog
CREATE TABLE IF NOT EXISTS blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_es TEXT,
  title_en TEXT,
  title TEXT, -- Campo legacy para compatibilidad
  content_es TEXT,
  content_en TEXT,
  content TEXT, -- Campo legacy para compatibilidad
  excerpt_es TEXT,
  excerpt_en TEXT,
  excerpt TEXT, -- Campo legacy para compatibilidad
  slug TEXT UNIQUE,
  image_url TEXT,
  category TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug);

-- Índice para búsquedas por título
CREATE INDEX IF NOT EXISTS idx_blog_title_es ON blog(title_es);
CREATE INDEX IF NOT EXISTS idx_blog_title_en ON blog(title_en);

-- Índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog(category);

-- Índice para búsquedas por estado de publicación
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog(published);

-- Índice para búsquedas por autor
CREATE INDEX IF NOT EXISTS idx_blog_author_id ON blog(author_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_blog_updated_at
  BEFORE UPDATE ON blog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública solo de publicaciones publicadas
CREATE POLICY "Public can read published blog posts"
  ON blog FOR SELECT
  USING (published = true);

-- Política: Solo administradores pueden ver todas las publicaciones
CREATE POLICY "Admins can read all blog posts"
  ON blog FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden insertar publicaciones
CREATE POLICY "Admins can insert blog posts"
  ON blog FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden actualizar publicaciones
CREATE POLICY "Admins can update blog posts"
  ON blog FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden eliminar publicaciones
CREATE POLICY "Admins can delete blog posts"
  ON blog FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE blog IS 'Publicaciones del blog';
COMMENT ON COLUMN blog.title_es IS 'Título de la publicación en español';
COMMENT ON COLUMN blog.title_en IS 'Título de la publicación en inglés';
COMMENT ON COLUMN blog.content_es IS 'Contenido completo de la publicación en español (HTML)';
COMMENT ON COLUMN blog.content_en IS 'Contenido completo de la publicación en inglés (HTML)';
COMMENT ON COLUMN blog.excerpt_es IS 'Resumen de la publicación en español';
COMMENT ON COLUMN blog.excerpt_en IS 'Resumen de la publicación en inglés';
COMMENT ON COLUMN blog.slug IS 'URL amigable única para la publicación';
COMMENT ON COLUMN blog.image_url IS 'URL de la imagen destacada almacenada en Supabase Storage';
COMMENT ON COLUMN blog.category IS 'Categoría de la publicación';
COMMENT ON COLUMN blog.author_id IS 'Referencia al usuario autor de la publicación';
COMMENT ON COLUMN blog.published IS 'Indica si la publicación está publicada y visible públicamente';

