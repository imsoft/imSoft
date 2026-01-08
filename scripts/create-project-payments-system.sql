-- Sistema de pagos para proyectos
-- Permite manejar pagos parciales (50%/50%, tercios, etc.)

-- Agregar campos de precio a la tabla projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN';

-- Crear tabla de pagos de proyectos
CREATE TABLE IF NOT EXISTS project_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  payment_method TEXT, -- 'cash', 'transfer', 'card', 'check', 'other'
  payment_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_project_payments_project_id ON project_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_payments_status ON project_payments(status);
CREATE INDEX IF NOT EXISTS idx_project_payments_payment_date ON project_payments(payment_date);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_project_payments_updated_at
  BEFORE UPDATE ON project_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver pagos de sus propios proyectos
CREATE POLICY "Users can view payments of their own projects"
  ON project_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN companies ON companies.id = projects.company_id
      WHERE projects.id = project_payments.project_id
      AND companies.user_id = auth.uid()
    )
  );

-- Política: Los administradores pueden ver todos los pagos
CREATE POLICY "Admins can view all payments"
  ON project_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Los administradores pueden insertar pagos
CREATE POLICY "Admins can insert payments"
  ON project_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Los administradores pueden actualizar pagos
CREATE POLICY "Admins can update payments"
  ON project_payments FOR UPDATE
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

-- Política: Los administradores pueden eliminar pagos
CREATE POLICY "Admins can delete payments"
  ON project_payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE project_payments IS 'Pagos realizados para proyectos';
COMMENT ON COLUMN project_payments.project_id IS 'Referencia al proyecto';
COMMENT ON COLUMN project_payments.amount IS 'Monto del pago';
COMMENT ON COLUMN project_payments.currency IS 'Moneda del pago (MXN, USD, etc.)';
COMMENT ON COLUMN project_payments.payment_method IS 'Método de pago (cash, transfer, card, check, other)';
COMMENT ON COLUMN project_payments.payment_date IS 'Fecha en que se realizó o se espera realizar el pago';
COMMENT ON COLUMN project_payments.notes IS 'Notas adicionales sobre el pago';
COMMENT ON COLUMN project_payments.status IS 'Estado del pago (pending, completed, cancelled)';
COMMENT ON COLUMN projects.total_price IS 'Precio total del proyecto';
COMMENT ON COLUMN projects.currency IS 'Moneda del proyecto (MXN, USD, etc.)';

