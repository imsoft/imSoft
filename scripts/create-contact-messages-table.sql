-- Tabla para mensajes de contacto del formulario
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- RLS Policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios autenticados pueden leer todos los mensajes
CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuarios autenticados pueden actualizar mensajes
CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Cualquiera puede crear mensajes (formulario público)
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Usuarios autenticados pueden eliminar mensajes
CREATE POLICY "Authenticated users can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Comentarios
COMMENT ON TABLE public.contact_messages IS 'Mensajes de contacto enviados desde el formulario público';
COMMENT ON COLUMN public.contact_messages.status IS 'Estado del mensaje: unread, read, replied, archived';
