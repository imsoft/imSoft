-- Script para corregir las políticas RLS de la tabla contact
-- El problema es que las políticas intentan acceder a auth.users directamente,
-- pero en Supabase las políticas RLS no tienen permisos para leer auth.users
-- Solución: Usar una función auxiliar con SECURITY DEFINER o verificar el rol desde el JWT

-- Opción 1: Crear una función auxiliar con SECURITY DEFINER
-- Esta función puede acceder a auth.users porque tiene permisos de seguridad definer
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

-- Eliminar las políticas existentes
DROP POLICY IF EXISTS "Public can read contact data" ON contact;
DROP POLICY IF EXISTS "Admins can insert contact data" ON contact;
DROP POLICY IF EXISTS "Admins can update contact data" ON contact;
DROP POLICY IF EXISTS "Admins can delete contact data" ON contact;

-- Recrear las políticas usando la función auxiliar
-- Política: Permitir lectura pública de datos de contacto
CREATE POLICY "Public can read contact data"
  ON contact FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar datos de contacto
CREATE POLICY "Admins can insert contact data"
  ON contact FOR INSERT
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden actualizar datos de contacto
CREATE POLICY "Admins can update contact data"
  ON contact FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden eliminar datos de contacto
CREATE POLICY "Admins can delete contact data"
  ON contact FOR DELETE
  USING (is_admin());

-- Comentarios para documentación
COMMENT ON FUNCTION is_admin() IS 'Función auxiliar para verificar si el usuario actual es administrador. Usa SECURITY DEFINER para poder acceder a auth.users.';

