-- Actualizar políticas RLS de la tabla projects para usar la función is_admin()
-- en lugar de acceder directamente a auth.users

-- Primero, asegurarse de que la función is_admin() existe
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role')::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar las políticas antiguas que acceden directamente a auth.users
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects for any company" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

-- Crear nuevas políticas usando la función is_admin()
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert projects for any company"
  ON projects FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update any project"
  ON projects FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any project"
  ON projects FOR DELETE
  USING (is_admin());

