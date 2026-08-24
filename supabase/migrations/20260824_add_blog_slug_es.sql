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
--
-- Idempotente: se puede volver a ejecutar sin efectos.

-- `unaccent` para que "Transformación" produzca "transformacion".
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE blog ADD COLUMN IF NOT EXISTS slug_es text;

-- Busqueda por cualquiera de los dos slugs en la resolucion de la pagina.
CREATE INDEX IF NOT EXISTS blog_slug_lookup_idx ON blog (slug, slug_es);

-- Backfill: slug en espanol derivado de title_es, sin acentos ni palabras vacias.
--
-- Cinco titulos se repiten entre las 93 filas (los duplicados que dejo el generador
-- automatico antes de que se despublicaran), asi que el slug base colisiona. Se
-- desambigua con un sufijo numerico, y el articulo PUBLICADO se queda siempre el slug
-- limpio: es el unico que se sirve, y su URL no debe cargar con un "-2".
WITH slugged AS (
  SELECT
    id,
    trim(BOTH '-' FROM left(
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
      ),
      70
    )) AS base
  FROM blog
),
ranked AS (
  SELECT
    s.id,
    s.base,
    ROW_NUMBER() OVER (
      PARTITION BY s.base
      -- el publicado primero; a igualdad, el mas antiguo
      ORDER BY b.published DESC, b.created_at ASC, s.id ASC
    ) AS n
  FROM slugged s
  JOIN blog b ON b.id = s.id
  WHERE s.base <> ''
)
UPDATE blog b
SET slug_es = CASE WHEN r.n = 1 THEN r.base ELSE r.base || '-' || r.n END
FROM ranked r
WHERE b.id = r.id
  AND b.slug_es IS NULL;

-- El indice unico se crea DESPUES del backfill: antes fallaba al insertar el segundo
-- duplicado. Parcial sobre NOT NULL para permitir filas sin slug en espanol.
CREATE UNIQUE INDEX IF NOT EXISTS blog_slug_es_key ON blog (slug_es) WHERE slug_es IS NOT NULL;
