-- Dispositivos de la app movil para notificaciones push. Cada cliente registra y borra
-- solo los suyos; el servidor (service role) los lee para enviar.
-- Aplicar a mano en el SQL Editor de Supabase.

CREATE TABLE IF NOT EXISTS app_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  token TEXT UNIQUE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS app_devices_user_idx ON app_devices (user_id);

ALTER TABLE app_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_devices propios" ON app_devices;
CREATE POLICY "app_devices propios" ON app_devices FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
