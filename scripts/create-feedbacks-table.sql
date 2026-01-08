-- Crear tabla de feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dashboard', 'services')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in-progress', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON feedbacks(type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_feedbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedbacks_updated_at();

-- Habilitar RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios feedbacks
CREATE POLICY "Users can view their own feedbacks"
  ON feedbacks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden crear sus propios feedbacks
CREATE POLICY "Users can create their own feedbacks"
  ON feedbacks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios feedbacks (solo si está pendiente)
CREATE POLICY "Users can update their own pending feedbacks"
  ON feedbacks
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Política: Los usuarios pueden eliminar sus propios feedbacks (solo si está pendiente)
CREATE POLICY "Users can delete their own pending feedbacks"
  ON feedbacks
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role')::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política: Los administradores pueden ver todos los feedbacks
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks
  FOR SELECT
  USING (is_admin());

-- Política: Los administradores pueden actualizar todos los feedbacks
CREATE POLICY "Admins can update all feedbacks"
  ON feedbacks
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política: Los administradores pueden eliminar todos los feedbacks
CREATE POLICY "Admins can delete all feedbacks"
  ON feedbacks
  FOR DELETE
  USING (is_admin());

-- Comentarios
COMMENT ON TABLE feedbacks IS 'Tabla para almacenar feedbacks de clientes sobre dashboard y servicios';
COMMENT ON COLUMN feedbacks.type IS 'Tipo de feedback: dashboard o services';
COMMENT ON COLUMN feedbacks.status IS 'Estado del feedback: pending, reviewed, in-progress, completed, rejected';

