-- Script para permitir que user_id sea NULL en la tabla companies
-- Esto permite crear empresas sin usuarios asociados (para proyectos existentes)

-- Modificar la columna user_id para permitir NULL
ALTER TABLE companies
ALTER COLUMN user_id DROP NOT NULL;

-- Actualizar el índice para incluir empresas sin usuario
-- (El índice existente seguirá funcionando, pero podemos crear uno adicional si es necesario)

-- Actualizar las políticas RLS para permitir empresas sin usuario
-- Las empresas sin usuario solo pueden ser gestionadas por administradores

-- Asegurarse de que la función is_admin() existe
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

-- Política: Permitir que los administradores vean todas las empresas (incluyendo las sin usuario)
DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;

CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política: Permitir que los administradores creen empresas sin usuario
-- (Ya está cubierta por la política anterior)

-- Política: Los usuarios pueden ver empresas sin usuario (para que puedan asociarlas)
-- Pero solo los admins pueden verlas todas
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;

CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL  -- Los usuarios pueden ver empresas sin usuario para asociarlas
  );

-- Actualizar comentarios
COMMENT ON COLUMN companies.user_id IS 'Referencia al usuario propietario de la empresa. NULL si la empresa no tiene usuario asociado (empresas creadas por admin para proyectos existentes)';

