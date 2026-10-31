-- Prospecting/CRM stored values in English (rule of 2026-10-31: everything technical in
-- English, Spanish only for user-visible text).
--
--   * outreach_emails.gancho  -> outreach_emails.hook
--   * contacts.tags           -> English tags (deduplicated, order kept)
--   * contacts.source         -> industry word of the generated
--                                "Google Places[ semanal] - <industry> - <YYYY-MM-DD>" pattern
--                                ("semanal" -> "weekly"); hand-written sources untouched
--   * outreach_emails.campaign-> English segment
--   * technologies.category   -> 'servidor' -> 'server'
--
-- Idempotent: safe to run more than once (e.g. before deploying and again after, to catch
-- rows the daily GitHub Actions cron wrote with the old values in between). Every step
-- only touches rows that still hold a Spanish value.
--
-- Not covered on purpose: activities.description of "Descartado de la cola de redes" keeps
-- the Spanish reason text; it is user-visible history, not a key (the key was never stored).
--
-- Apply by hand in the Supabase SQL editor.

BEGIN;

-- 1) outreach_emails.gancho -> hook
DO $$
DECLARE
  has_gancho boolean;
  has_hook boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outreach_emails' AND column_name = 'gancho') INTO has_gancho;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outreach_emails' AND column_name = 'hook') INTO has_hook;
  IF has_gancho AND NOT has_hook THEN
    ALTER TABLE public.outreach_emails RENAME COLUMN gancho TO hook;
  ELSIF has_gancho AND has_hook THEN
    -- Both exist (someone re-added the old column): keep hook, fill gaps from gancho, drop gancho.
    UPDATE public.outreach_emails SET hook = gancho WHERE hook IS NULL AND gancho IS NOT NULL;
    ALTER TABLE public.outreach_emails DROP COLUMN gancho;
  END IF;
END $$;

-- 2) Old -> new value map (tags, industry keys, segments, campaigns), inline as JSON so it
--    works in the Supabase SQL editor (temp tables don't survive between its statements).
--    Monthly campaign tags ("campana-2026-10") are handled by pattern.

-- 3) contacts.tags: translate, deduplicate, keep the original order.
UPDATE public.contacts c
SET tags = (
  SELECT array_agg(x.tag ORDER BY x.pos)
  FROM (
    SELECT COALESCE('{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ->> u.tag, regexp_replace(u.tag, '^campana-', 'campaign-')) AS tag, min(u.pos) AS pos
    FROM unnest(c.tags) WITH ORDINALITY AS u(tag, pos)
    GROUP BY 1
  ) x
)
WHERE c.tags IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(c.tags) AS t(tag)
    WHERE '{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ? t.tag OR t.tag LIKE 'campana-%'
  );

-- 4) contacts.source: only the generated "Google Places[ semanal] - <industry> - <date>".
WITH parsed AS (
  SELECT id, regexp_match(source, '^Google Places( semanal)? - (.+) - (\d{4}-\d{2}-\d{2})$') AS p
  FROM public.contacts
  WHERE source LIKE 'Google Places%'
)
UPDATE public.contacts c
SET source = 'Google Places' || CASE WHEN parsed.p[1] IS NOT NULL THEN ' weekly' ELSE '' END
          || ' - ' || COALESCE('{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ->> parsed.p[2], parsed.p[2]) || ' - ' || parsed.p[3]
FROM parsed
WHERE c.id = parsed.id
  AND parsed.p IS NOT NULL
  AND (parsed.p[1] IS NOT NULL OR '{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ? parsed.p[2]);

-- 5) outreach_emails.campaign (the segment of the contact: logistica, corporativo...).
UPDATE public.outreach_emails
SET campaign = '{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ->> campaign
WHERE '{"salud": "health", "escuelas": "schools", "construccion": "construction", "restaurantes": "restaurants", "inmobiliaria": "real-estate", "ferreteria": "hardware-stores", "contabilidad": "accounting", "abogados": "law-firms", "automotriz": "automotive", "corporativo": "corporate", "empresa-grande": "large-company", "abastos": "wholesale-market", "mayoristas": "wholesalers", "granjas": "farms", "talleres": "auto-repair-shops", "clinicas-estetica": "aesthetic-clinics", "logistica": "logistics", "logistica-gdl": "logistics-gdl", "aduanal": "customs-brokers", "joyeria": "jewelry", "ropa": "clothing", "transportista": "carrier", "duplicado-empresa": "duplicate-company", "otros": "other", "redes-descartado": "social-discarded", "correo-invalido": "invalid-email", "zona-premium": "premium-zone", "auto-semanal": "auto-weekly", "pymes-zmg": "smb-zmg", "campana-sep-2026": "campaign-sep-2026"}'::jsonb ? campaign;

-- 6) technologies.category (jsonb array; a legacy row may still hold a plain string).
UPDATE public.technologies t
SET category = (
  SELECT jsonb_agg(x.v ORDER BY x.pos)
  FROM (
    SELECT CASE WHEN e.v = 'servidor' THEN 'server' ELSE e.v END AS v, min(e.pos) AS pos
    FROM jsonb_array_elements_text(t.category) WITH ORDINALITY AS e(v, pos)
    GROUP BY 1
  ) x
)
WHERE jsonb_typeof(t.category) = 'array' AND t.category ? 'servidor';

UPDATE public.technologies
SET category = '"server"'::jsonb
WHERE category = '"servidor"'::jsonb;

COMMIT;

-- Check (should return 0 rows):
-- SELECT tag, count(*) FROM contacts, unnest(tags) tag
-- WHERE tag IN ('salud','escuelas','construccion','restaurantes','inmobiliaria','ferreteria','contabilidad','abogados','automotriz','corporativo','empresa-grande','abastos','logistica','logistica-gdl','aduanal','joyeria','redes-descartado','correo-invalido','zona-premium','auto-semanal','pymes-zmg') OR tag LIKE 'campana-%'
-- GROUP BY 1;
