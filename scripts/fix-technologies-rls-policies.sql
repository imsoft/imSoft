-- Corregir políticas RLS para technologies y technology_companies
-- El problema es que las políticas intentan acceder a auth.users directamente
-- que requiere permisos especiales. Usaremos auth.jwt() en su lugar.

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Admins can insert technologies" ON technologies;
DROP POLICY IF EXISTS "Admins can update technologies" ON technologies;
DROP POLICY IF EXISTS "Admins can delete technologies" ON technologies;
DROP POLICY IF EXISTS "Admins can insert technology companies" ON technology_companies;
DROP POLICY IF EXISTS "Admins can update technology companies" ON technology_companies;
DROP POLICY IF EXISTS "Admins can delete technology companies" ON technology_companies;

-- Crear nuevas políticas usando auth.jwt() en lugar de auth.users
-- Permitir inserción solo a admins
CREATE POLICY "Admins can insert technologies"
  ON technologies FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Permitir actualización solo a admins
CREATE POLICY "Admins can update technologies"
  ON technologies FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Permitir eliminación solo a admins
CREATE POLICY "Admins can delete technologies"
  ON technologies FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Políticas para technology_companies
-- Permitir inserción solo a admins
CREATE POLICY "Admins can insert technology companies"
  ON technology_companies FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Permitir actualización solo a admins
CREATE POLICY "Admins can update technology companies"
  ON technology_companies FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Permitir eliminación solo a admins
CREATE POLICY "Admins can delete technology companies"
  ON technology_companies FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
