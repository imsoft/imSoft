-- Crear tabla de servicios
-- Esta tabla almacena los servicios ofrecidos por la empresa
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_es TEXT,
  title_en TEXT,
  title TEXT, -- Campo legacy para compatibilidad
  description_es TEXT,
  description_en TEXT,
  description TEXT, -- Campo legacy para compatibilidad
  slug TEXT UNIQUE,
  image_url TEXT,
  icon TEXT, -- Campo legacy para compatibilidad
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Índice para búsquedas por título
CREATE INDEX IF NOT EXISTS idx_services_title_es ON services(title_es);
CREATE INDEX IF NOT EXISTS idx_services_title_en ON services(title_en);

-- Función para actualizar updated_at automáticamente
-- (Reutilizamos la función si ya existe, o la creamos si no)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública de servicios
CREATE POLICY "Public can read services"
  ON services FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar servicios
CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden actualizar servicios
CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
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

-- Política: Solo administradores pueden eliminar servicios
CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE services IS 'Servicios ofrecidos por la empresa';
COMMENT ON COLUMN services.title_es IS 'Título del servicio en español';
COMMENT ON COLUMN services.title_en IS 'Título del servicio en inglés';
COMMENT ON COLUMN services.description_es IS 'Descripción del servicio en español';
COMMENT ON COLUMN services.description_en IS 'Descripción del servicio en inglés';
COMMENT ON COLUMN services.slug IS 'URL amigable única para el servicio';
COMMENT ON COLUMN services.image_url IS 'URL de la imagen del servicio almacenada en Supabase Storage';
COMMENT ON COLUMN services.icon IS 'Campo legacy para compatibilidad con versiones anteriores';

