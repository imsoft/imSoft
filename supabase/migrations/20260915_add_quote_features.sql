-- La cotizacion pasa de "conceptos con cantidad y precio" a un precio unico del
-- proyecto mas una lista de caracteristicas. `items` se conserva con una sola linea
-- (el precio) para no romper lo ya guardado.
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb;
