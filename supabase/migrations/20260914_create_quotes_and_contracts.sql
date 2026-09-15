-- Cotizaciones y contratos generados desde el panel de administracion.
-- Aplicar a mano en Supabase (SQL editor), como las demas migraciones.

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  lang TEXT NOT NULL DEFAULT 'es',
  -- Cliente (copia al momento de cotizar; el CRM puede cambiar despues)
  contact_id UUID,
  company_id UUID,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_email TEXT,
  client_rfc TEXT,
  client_address TEXT,
  -- Contenido
  title TEXT NOT NULL,
  intro TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,        -- [{concepto, descripcion, cantidad, precio}]
  currency TEXT NOT NULL DEFAULT 'MXN',
  apply_iva BOOLEAN NOT NULL DEFAULT true,
  payment JSONB NOT NULL DEFAULT '{}'::jsonb,      -- {hitos:[{label,pct}], msi:boolean}
  terms JSONB NOT NULL DEFAULT '{}'::jsonb,        -- {garantia_dias, soporte, penalizacion_dia, entrega_semanas, ...}
  notes TEXT,
  valid_until DATE NOT NULL,
  -- Aceptacion en linea
  token TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  accepted_name TEXT,
  accepted_ip TEXT,
  accepted_user_agent TEXT,
  project_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  folio TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
  lang TEXT NOT NULL DEFAULT 'es',
  body_html TEXT NOT NULL,                          -- clausulas ya renderizadas; editable antes de enviar
  token TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signed_name TEXT,
  signed_ip TEXT,
  signed_user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
CREATE INDEX IF NOT EXISTS quotes_token_idx ON quotes (token);
CREATE INDEX IF NOT EXISTS contracts_token_idx ON contracts (token);
CREATE INDEX IF NOT EXISTS contracts_quote_idx ON contracts (quote_id);

-- Solo el panel (service role / admin autenticado) lee y escribe; las paginas publicas
-- de aceptacion pasan por rutas del servidor que buscan por token.
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotes admin all" ON quotes;
CREATE POLICY "quotes admin all" ON quotes FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "contracts admin all" ON contracts;
CREATE POLICY "contracts admin all" ON contracts FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
