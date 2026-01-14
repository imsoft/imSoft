-- Tabla para rastrear emails enviados a deals por etapa
CREATE TABLE IF NOT EXISTS deal_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL, -- La etapa en la que se envió el email
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_deal_emails_deal_id ON deal_emails(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_emails_stage ON deal_emails(stage);
CREATE INDEX IF NOT EXISTS idx_deal_emails_sent_at ON deal_emails(sent_at DESC);

-- Habilitar RLS
ALTER TABLE deal_emails ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver emails
CREATE POLICY "Admins can view deal emails"
  ON deal_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo admins pueden insertar emails
CREATE POLICY "Admins can insert deal emails"
  ON deal_emails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
