-- Descuento o promocion opcional en la cotizacion: {motivo, tipo: 'pct'|'monto', valor}.
-- Se aplica al precio de lista antes del IVA. Aplicar a mano en Supabase (SQL editor).
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount JSONB;
