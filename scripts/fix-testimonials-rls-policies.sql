-- Script para corregir las políticas RLS de la tabla testimonials
-- El problema es que las políticas intentan acceder a auth.users directamente,
-- pero en Supabase las políticas RLS no tienen permisos para leer auth.users
-- Solución: Usar la función is_admin() con SECURITY DEFINER

-- Asegurarse de que la función is_admin() existe
-- (Esta función ya debería existir si se ejecutó fix-contact-rls-policies.sql o fix-companies-rls-for-admin.sql)
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
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON testimonials;

-- Recrear las políticas usando la función auxiliar
-- Política: Permitir lectura pública de testimonios
CREATE POLICY "Public can read testimonials"
  ON testimonials FOR SELECT
  USING (true);

-- Política: Solo administradores pueden insertar testimonios
CREATE POLICY "Admins can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden actualizar testimonios
CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política: Solo administradores pueden eliminar testimonios
CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  USING (is_admin());

-- Comentarios para documentación
COMMENT ON FUNCTION is_admin() IS 'Función auxiliar para verificar si el usuario actual es administrador. Usa SECURITY DEFINER para poder acceder a auth.users.';

