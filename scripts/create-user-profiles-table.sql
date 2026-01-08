-- Crear tabla de perfiles de usuarios
-- Nota: company_name NO está aquí porque un usuario puede tener varias empresas
-- La relación usuario-empresa está en la tabla 'companies' (uno a muchos)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Índice para búsquedas por nombre (usando first_name y last_name)
CREATE INDEX IF NOT EXISTS idx_user_profiles_names ON user_profiles(first_name, last_name);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Política: Los administradores pueden hacer todo
-- Nota: El rol se mantiene en user_metadata de auth.users para acceso rápido
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios con información personal adicional';
COMMENT ON COLUMN user_profiles.user_id IS 'Referencia al usuario en auth.users';
COMMENT ON COLUMN user_profiles.first_name IS 'Nombre del usuario';
COMMENT ON COLUMN user_profiles.last_name IS 'Apellido del usuario';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL de la imagen de perfil';
COMMENT ON COLUMN user_profiles.user_id IS 'Referencia única al usuario (un usuario = un perfil)';

