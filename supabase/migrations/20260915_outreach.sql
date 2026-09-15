-- Prospeccion por Gmail: cuenta conectada y cola de correos por contacto.
-- Aplicar a mano en Supabase (SQL editor).

-- Tokens OAuth de la cuenta de Gmail que envia. Solo los lee el servidor (service
-- role): RLS activo y sin politicas.
CREATE TABLE IF NOT EXISTS gmail_accounts (
  user_id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expiry TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE gmail_accounts ENABLE ROW LEVEL SECURITY;

-- Un renglon por contacto y paso (1 = primer correo, 2 y 3 = seguimientos).
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  step SMALLINT NOT NULL CHECK (step BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'replied', 'closed', 'skipped')),
  campaign TEXT,
  gancho TEXT,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  scheduled_for DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_at TIMESTAMPTZ,
  sent_via TEXT,                       -- 'gmail' | 'manual'
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (contact_id, step)
);
CREATE INDEX IF NOT EXISTS outreach_emails_status_idx ON outreach_emails (status, scheduled_for);
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "outreach admin all" ON outreach_emails;
CREATE POLICY "outreach admin all" ON outreach_emails FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
