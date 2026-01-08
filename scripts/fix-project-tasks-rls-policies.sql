-- Actualizar políticas RLS de la tabla project_tasks para usar la función is_admin()
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
DROP POLICY IF EXISTS "Admins can view all tasks" ON project_tasks;
DROP POLICY IF EXISTS "Admins can insert tasks" ON project_tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON project_tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON project_tasks;

-- Crear nuevas políticas usando la función is_admin()
CREATE POLICY "Admins can view all tasks"
  ON project_tasks FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert tasks"
  ON project_tasks FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update tasks"
  ON project_tasks FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete tasks"
  ON project_tasks FOR DELETE
  USING (is_admin());

