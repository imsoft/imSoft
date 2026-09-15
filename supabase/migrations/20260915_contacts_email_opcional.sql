-- Contactos sin correo: prospeccion por WhatsApp e Instagram.
--
-- Muchos negocios pequenos no publican correo; se contactan por WhatsApp. Hasta
-- ahora no cabian en el CRM porque `contacts.email` era NOT NULL.
--
-- El indice UNIQUE se conserva: en Postgres varios NULL no chocan entre si, asi
-- que se sigue evitando el correo duplicado sin obligar a que exista.

ALTER TABLE public.contacts
  ALTER COLUMN email DROP NOT NULL;

-- Un contacto tiene que ser localizable por algun lado: correo, telefono o
-- redes. Sin ninguno de los tres no sirve de nada tenerlo.
ALTER TABLE public.contacts
  DROP CONSTRAINT IF EXISTS contacts_tiene_algun_contacto;

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_tiene_algun_contacto CHECK (
    email IS NOT NULL
    OR phone IS NOT NULL
    OR (additional_phones IS NOT NULL AND array_length(additional_phones, 1) > 0)
    OR instagram_url IS NOT NULL
    OR (social_links IS NOT NULL AND jsonb_array_length(social_links) > 0)
  );

COMMENT ON COLUMN public.contacts.email IS
  'Opcional desde 2026-09-15: los prospectos de WhatsApp e Instagram no siempre tienen correo.';
