-- Crear tabla de datos de contacto
-- Esta tabla almacena la información de contacto de la empresa
CREATE TABLE IF NOT EXISTS contact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  youtube TEXT,
  tiktok TEXT,
  twitch TEXT,
  whatsapp TEXT,
  spotify TEXT,
  threads TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función auxiliar para verificar si el usuario actual es administrador
-- IMPORTANTE: Esta función usa SECURITY DEFINER para poder acceder a auth.users
-- Las políticas RLS no pueden acceder directamente a auth.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_contact_updated_at
  BEFORE UPDATE ON contact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública de datos de contacto
CREATE POLICY "Public can read contact data"
  ON contact FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar datos de contacto
CREATE POLICY "Admins can insert contact data"
  ON contact FOR INSERT
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden actualizar datos de contacto
CREATE POLICY "Admins can update contact data"
  ON contact FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden eliminar datos de contacto
CREATE POLICY "Admins can delete contact data"
  ON contact FOR DELETE
  USING (is_admin());

-- Comentarios para documentación
COMMENT ON TABLE contact IS 'Información de contacto de la empresa';
COMMENT ON COLUMN contact.address IS 'Dirección física de la empresa';
COMMENT ON COLUMN contact.phone IS 'Número de teléfono de contacto';
COMMENT ON COLUMN contact.email IS 'Correo electrónico de contacto';
COMMENT ON COLUMN contact.description IS 'Descripción adicional de contacto';
COMMENT ON COLUMN contact.facebook IS 'URL del perfil de Facebook';
COMMENT ON COLUMN contact.twitter IS 'URL del perfil de Twitter/X';
COMMENT ON COLUMN contact.instagram IS 'URL del perfil de Instagram';
COMMENT ON COLUMN contact.linkedin IS 'URL del perfil de LinkedIn';
COMMENT ON COLUMN contact.youtube IS 'URL del canal de YouTube';
COMMENT ON COLUMN contact.tiktok IS 'URL del perfil de TikTok';
COMMENT ON COLUMN contact.twitch IS 'URL del canal de Twitch';
COMMENT ON COLUMN contact.whatsapp IS 'Número de WhatsApp o URL';
COMMENT ON COLUMN contact.spotify IS 'URL del perfil o playlist de Spotify';
COMMENT ON COLUMN contact.threads IS 'URL del perfil de Threads';

