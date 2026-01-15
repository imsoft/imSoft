-- Crear tabla de emails de contactos
-- Esta tabla almacena el historial de emails enviados a contactos por etapa
CREATE TABLE IF NOT EXISTS contact_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- Etapa del contacto cuando se envió el email
  subject TEXT NOT NULL,
  body TEXT NOT NULL, -- Cuerpo del email en HTML
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_contact_emails_contact_id ON contact_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_emails_status ON contact_emails(status);
CREATE INDEX IF NOT EXISTS idx_contact_emails_sent_at ON contact_emails(sent_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE contact_emails ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver emails
CREATE POLICY "Admins can view contact emails"
  ON contact_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo administradores pueden insertar emails
CREATE POLICY "Admins can insert contact emails"
  ON contact_emails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
