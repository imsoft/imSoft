-- Script mejorado para permitir que los administradores vean todas las empresas
-- Incluye una función auxiliar similar a la usada en la tabla contact

-- Función auxiliar para verificar si el usuario actual es administrador
-- IMPORTANTE: Esta función usa SECURITY DEFINER para poder acceder a auth.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Modificar la columna user_id para permitir NULL (si no se ha hecho ya)
ALTER TABLE companies
ALTER COLUMN user_id DROP NOT NULL;

-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;

-- Política: Los usuarios pueden ver sus propias empresas Y las empresas sin usuario
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

-- Política: Los usuarios solo pueden insertar empresas para sí mismos
CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias empresas
CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias empresas
CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Política: Los administradores pueden hacer TODO (SELECT, INSERT, UPDATE, DELETE)
-- Esta política debe estar al final para que tenga prioridad
CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Comentarios para documentación
COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario autenticado tiene el rol de administrador';
COMMENT ON POLICY "Admins can manage all companies" ON companies IS 'Permite a los administradores gestionar todas las empresas, incluyendo las sin usuario';

