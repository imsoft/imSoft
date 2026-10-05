-- SEGURIDAD: el contenido publico del sitio solo lo modifica el administrador.
--
-- Comprobado el 5-oct-2026 con un usuario de prueba recien registrado: podia EDITAR los
-- articulos del blog, el portafolio y las preguntas del cotizador, y leer los 37
-- borradores del blog sin publicar. El registro esta abierto, asi que cualquiera podia.
--
-- Estas tres tablas quedan con un juego de reglas limpio y conocido:
--   leer: todo el mundo (del blog, solo lo publicado); modificar: solo el administrador.
-- El blog automatico y los scripts usan la llave de servicio y no se ven afectados.
--
-- Aplicar a mano en Supabase (SQL Editor). Va en un solo bloque (todo o nada) y se puede
-- repetir. Requiere la migracion 20261005_roles_app_metadata.sql (usa is_admin()).
-- Al final devuelve una tabla que debe salir VACIA.

do $migracion$
declare
  p record;
  t text;
begin
  foreach t in array array['blog', 'portfolio', 'quotation_questions'] loop
    -- Fuera todas las reglas actuales de la tabla: se reemplazan por las dos de abajo.
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to public using (%s)',
      t || ' lectura publica', t, case when t = 'blog' then 'published = true' else 'true' end);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || ' admin', t);
  end loop;
end
$migracion$;

-- Resultado: debe salir vacio. Lista cualquier regla de estas tablas que no sea una de
-- las dos esperadas.
select tablename as tabla, policyname as politica, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('blog', 'portfolio', 'quotation_questions')
  and policyname not in (tablename || ' lectura publica', tablename || ' admin');
