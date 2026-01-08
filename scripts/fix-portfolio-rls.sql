-- Script para arreglar las políticas RLS de portfolio
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las políticas existentes de la tabla portfolio
DROP POLICY IF EXISTS "Authenticated users can read portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Public can read portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Authenticated users can create portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Authenticated users can update portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Authors can update own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Authors can delete own portfolio" ON public.portfolio;

-- 2. Crear política para lectura pública
CREATE POLICY "Anyone can read portfolio"
ON public.portfolio
FOR SELECT
USING (true);

-- 3. Crear política para que usuarios autenticados puedan crear
CREATE POLICY "Authenticated users can create portfolio"
ON public.portfolio
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Crear política para que usuarios autenticados puedan actualizar
CREATE POLICY "Authenticated users can update portfolio"
ON public.portfolio
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Crear política para que usuarios autenticados puedan eliminar
CREATE POLICY "Authenticated users can delete portfolio"
ON public.portfolio
FOR DELETE
TO authenticated
USING (true);

-- 6. Asegurarse de que RLS está habilitado
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Verificación: Esta consulta debería funcionar con autenticación
-- SELECT * FROM portfolio;
