-- Slug en espanol para los articulos del blog.
--
-- Hasta ahora `blog.slug` era unico y se generaba a partir de `title_en`, asi que las
-- URLs en espanol quedaban en ingles:
--   /es/blog/why-your-business-is-still-losing-customers-in-2026
-- con el titulo y el contenido en espanol. El slug es una de las senales on-page mas
-- fuertes y el mercado principal de imSoft es Mexico.
--
-- `slug` se queda como el slug en ingles (lo usa /en) y `slug_es` es el nuevo, usado
-- por /es. Las URLs viejas siguen resolviendo y hacen 301 al slug del idioma pedido,
-- asi que no se pierde nada de lo ya indexado.

-- `unaccent` para que "Transformación" produzca "transformacion".
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE blog ADD COLUMN IF NOT EXISTS slug_es text;

-- Un articulo por slug, pero permitiendo NULL mientras se rellena.
CREATE UNIQUE INDEX IF NOT EXISTS blog_slug_es_key ON blog (slug_es) WHERE slug_es IS NOT NULL;

-- Busqueda por cualquiera de los dos slugs en la resolucion de la pagina.
CREATE INDEX IF NOT EXISTS blog_slug_lookup_idx ON blog (slug, slug_es);

-- Backfill: slug en espanol derivado de title_es, quitando acentos y palabras vacias.
-- Se calcula en SQL para que la migracion sea autocontenida y repetible.
WITH slugged AS (
  SELECT
    id,
    regexp_replace(
      regexp_replace(
        trim(
          regexp_replace(
            lower(unaccent(coalesce(title_es, title, ''))),
            '[^a-z0-9]+', ' ', 'g'
          )
        ),
        -- palabras vacias del espanol: no aportan nada al slug
        '\y(de|del|la|el|los|las|un|una|y|o|que|en|para|por|con|tu|tus|su|sus|al|lo|a)\y',
        ' ', 'g'
      ),
      '\s+', '-', 'g'
    ) AS base
  FROM blog
)
UPDATE blog b
SET slug_es = left(trim(BOTH '-' FROM s.base), 70)
FROM slugged s
WHERE b.id = s.id
  AND b.slug_es IS NULL
  AND s.base <> '';
