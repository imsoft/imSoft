-- Script para arreglar las políticas RLS del blog
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las políticas existentes de la tabla blog
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog;
DROP POLICY IF EXISTS "Users can read published blog posts" ON public.blog;
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON public.blog;
DROP POLICY IF EXISTS "Authors can update their own blog posts" ON public.blog;
DROP POLICY IF EXISTS "Authors can delete their own blog posts" ON public.blog;

-- 2. Crear política simple para lectura pública de posts publicados
-- Esta política NO intenta verificar author_id, solo verifica published
CREATE POLICY "Anyone can read published blogs"
ON public.blog
FOR SELECT
USING (published = true);

-- 3. Crear política para que usuarios autenticados puedan crear posts
CREATE POLICY "Authenticated users can create blogs"
ON public.blog
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Crear política para que los autores puedan actualizar sus propios posts
CREATE POLICY "Authors can update own blogs"
ON public.blog
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 5. Crear política para que los autores puedan eliminar sus propios posts
CREATE POLICY "Authors can delete own blogs"
ON public.blog
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 6. Asegurarse de que RLS está habilitado
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;

-- Verificación: Esta consulta debería funcionar sin autenticación
-- SELECT * FROM blog WHERE published = true;
