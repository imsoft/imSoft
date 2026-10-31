-- Forma de pago que eligio el cliente al aceptar la cotizacion:
-- 'transferencia' | 'tarjeta' | 'msi6' | 'msi12' | 'plan' (ver opcionesDePago en src/lib/cotizaciones.ts).
-- El plan mensual y el descuento por transferencia viven dentro de quotes.payment (JSONB), sin columna nueva.
-- Aplicar a mano en Supabase (SQL editor).
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accepted_payment_option TEXT;
