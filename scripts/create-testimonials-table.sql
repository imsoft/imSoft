-- Crear tabla de testimonios
-- Esta tabla almacena los testimonios de clientes
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT, -- Campo legacy para compatibilidad
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  content_es TEXT,
  content_en TEXT,
  content TEXT, -- Campo legacy para compatibilidad
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_testimonials_name ON testimonials(name);

-- Índice para búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_testimonials_company_id ON testimonials(company_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública de testimonios
CREATE POLICY "Public can read testimonials"
  ON testimonials FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar testimonios
CREATE POLICY "Admins can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden actualizar testimonios
CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
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

-- Política: Solo administradores pueden eliminar testimonios
CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE testimonials IS 'Testimonios de clientes';
COMMENT ON COLUMN testimonials.name IS 'Nombre del cliente que da el testimonio';
COMMENT ON COLUMN testimonials.role IS 'Rol o cargo del cliente';
COMMENT ON COLUMN testimonials.company IS 'Campo legacy para compatibilidad con versiones anteriores';
COMMENT ON COLUMN testimonials.company_id IS 'Referencia a la empresa del cliente';
COMMENT ON COLUMN testimonials.content_es IS 'Contenido del testimonio en español';
COMMENT ON COLUMN testimonials.content_en IS 'Contenido del testimonio en inglés';
COMMENT ON COLUMN testimonials.avatar_url IS 'URL del avatar del cliente';

