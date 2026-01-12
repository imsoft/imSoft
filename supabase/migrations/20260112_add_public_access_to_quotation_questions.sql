-- Habilitar RLS en las tablas si no está habilitado
ALTER TABLE quotation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Allow public read access to quotation questions" ON quotation_questions;
DROP POLICY IF EXISTS "Allow public insert access to quotations" ON quotations;
DROP POLICY IF EXISTS "Allow users to read their own quotations" ON quotations;
DROP POLICY IF EXISTS "Allow admins full access to quotations" ON quotations;

-- Política para permitir lectura pública de preguntas de cotización
CREATE POLICY "Allow public read access to quotation questions"
  ON quotation_questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política para permitir inserción pública de cotizaciones (sin autenticación)
CREATE POLICY "Allow public insert access to quotations"
  ON quotations FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL); -- Solo permitir cotizaciones sin user_id (públicas)

-- Política para que usuarios autenticados puedan leer sus propias cotizaciones
CREATE POLICY "Allow users to read their own quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para que admins puedan leer todas las cotizaciones
CREATE POLICY "Allow admins full access to quotations"
  ON quotations FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
