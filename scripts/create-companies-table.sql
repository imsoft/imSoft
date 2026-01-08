-- Crear tabla de empresas
-- Un usuario puede tener varias empresas, y cada empresa puede tener varios proyectos
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

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
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias empresas
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar empresas para sí mismos
CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias empresas
CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias empresas
CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Política: Los administradores pueden hacer todo
CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE companies IS 'Empresas de los usuarios. Un usuario puede tener varias empresas';
COMMENT ON COLUMN companies.user_id IS 'Referencia al usuario propietario de la empresa';
COMMENT ON COLUMN companies.name IS 'Nombre de la empresa';
COMMENT ON COLUMN companies.logo_url IS 'URL del logo de la empresa almacenado en Supabase Storage';

