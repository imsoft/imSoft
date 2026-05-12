-- Agrega columnas de caso de estudio a la tabla portfolio
-- Ejecutar en Supabase SQL Editor

ALTER TABLE portfolio
  ADD COLUMN IF NOT EXISTS challenge_es    TEXT,
  ADD COLUMN IF NOT EXISTS challenge_en    TEXT,
  ADD COLUMN IF NOT EXISTS results_es      TEXT[],
  ADD COLUMN IF NOT EXISTS results_en      TEXT[],
  ADD COLUMN IF NOT EXISTS client_quote_es TEXT,
  ADD COLUMN IF NOT EXISTS client_quote_en TEXT,
  ADD COLUMN IF NOT EXISTS year            INTEGER;
