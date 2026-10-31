-- Quotes and contracts: column names, JSONB keys and stored values in English.
-- Idempotent: running it twice is harmless. Apply it right when the matching code deploys.

BEGIN;

-- 1. folio -> number (quotes and contracts)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'folio') THEN
    ALTER TABLE public.quotes RENAME COLUMN folio TO number;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'folio') THEN
    ALTER TABLE public.contracts RENAME COLUMN folio TO number;
  END IF;
END $$;

-- 2. Helper: renames the keys of a JSON object following a {old: new} map. A regular
--    function (dropped at the end): the Supabase SQL editor does not keep pg_temp objects.
CREATE OR REPLACE FUNCTION public.tmp_rename_keys(o jsonb, m jsonb) RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN o IS NULL OR jsonb_typeof(o) <> 'object' THEN o
    ELSE COALESCE((SELECT jsonb_object_agg(COALESCE(m ->> k, k), v) FROM jsonb_each(o) AS e(k, v)), '{}'::jsonb)
  END
$$;

-- 3. items: [{concepto, descripcion, cantidad, precio}] -> [{name, description, quantity, price}]
UPDATE public.quotes
SET items = (
  SELECT COALESCE(jsonb_agg(public.tmp_rename_keys(i, '{"concepto":"name","descripcion":"description","cantidad":"quantity","precio":"price"}')), '[]'::jsonb)
  FROM jsonb_array_elements(items) AS i
)
WHERE jsonb_typeof(items) = 'array';

-- 4. payment: {hitos[{label, pct, mensualidades}], msi, descuento_transferencia_pct, plan{meses, anticipo_pct, recargo_pct}}
UPDATE public.quotes
SET payment = public.tmp_rename_keys(payment, '{"hitos":"milestones","msi":"card_installments","descuento_transferencia_pct":"transfer_discount_pct"}')
WHERE jsonb_typeof(payment) = 'object';

UPDATE public.quotes
SET payment = jsonb_set(payment, '{milestones}', (
  SELECT COALESCE(jsonb_agg(public.tmp_rename_keys(h, '{"mensualidades":"monthly_payments"}')), '[]'::jsonb)
  FROM jsonb_array_elements(payment -> 'milestones') AS h
))
WHERE jsonb_typeof(payment -> 'milestones') = 'array';

UPDATE public.quotes
SET payment = jsonb_set(payment, '{plan}', public.tmp_rename_keys(payment -> 'plan', '{"meses":"months","anticipo_pct":"deposit_pct","recargo_pct":"surcharge_pct"}'))
WHERE jsonb_typeof(payment -> 'plan') = 'object';

-- 5. terms
UPDATE public.quotes
SET terms = public.tmp_rename_keys(terms, '{"garantia_dias":"warranty_days","soporte":"support","propiedad":"ownership","cambios_alcance":"scope_changes","penalizacion_dia":"daily_penalty","fecha_limite":"deadline","entrega_semanas":"delivery_weeks"}')
WHERE jsonb_typeof(terms) = 'object';

-- 6. discount: {tipo: pct|monto, valor, motivo} -> {type: pct|amount, value, reason}
UPDATE public.quotes
SET discount = public.tmp_rename_keys(discount, '{"tipo":"type","valor":"value","motivo":"reason"}')
WHERE jsonb_typeof(discount) = 'object';

UPDATE public.quotes
SET discount = jsonb_set(discount, '{type}', '"amount"')
WHERE discount ->> 'type' = 'monto';

-- 7. Payment option the client chose
UPDATE public.quotes
SET accepted_payment_option = CASE accepted_payment_option
  WHEN 'transferencia' THEN 'transfer'
  WHEN 'tarjeta' THEN 'card'
  WHEN 'msi6' THEN 'installments_6'
  WHEN 'msi12' THEN 'installments_12'
  ELSE accepted_payment_option
END
WHERE accepted_payment_option IN ('transferencia', 'tarjeta', 'msi6', 'msi12');

DROP FUNCTION public.tmp_rename_keys(jsonb, jsonb);

COMMIT;

-- Check (should return 0 rows):
-- SELECT id FROM public.quotes
-- WHERE items::text ~ '"(concepto|cantidad|precio)"'
--    OR payment::text ~ '"(hitos|msi|mensualidades|meses|anticipo_pct|recargo_pct|descuento_transferencia_pct)"'
--    OR terms::text ~ '"(garantia_dias|soporte|propiedad|cambios_alcance|penalizacion_dia|fecha_limite|entrega_semanas)"'
--    OR discount::text ~ '"(tipo|valor|motivo)"';
