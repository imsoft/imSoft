-- Permitir lectura pública de empresas (solo para mostrar logos en la página principal)
CREATE POLICY "Public can view companies"
  ON companies FOR SELECT
  TO anon
  USING (true);
