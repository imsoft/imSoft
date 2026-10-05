-- SEGURIDAD: el rol de administrador se lee de app_metadata, no de user_metadata.
--
-- user_metadata lo puede escribir el propio usuario con supabase.auth.updateUser, y el
-- registro esta abierto: cualquiera que se registrara podia volverse administrador en la
-- base (comprobado el 5-oct-2026: un usuario de prueba leyo los 378 contactos del CRM).
-- app_metadata solo lo escribe el servidor con la llave de servicio.
--
-- Aplicar a mano en Supabase (SQL Editor), completo y de una sola vez. Al final devuelve
-- una tabla: si sale vacia, no quedo ninguna regla leyendo el rol de user_metadata.

begin;

-- 1) is_admin(): la usan casi todas las politicas. Lee el rol directo de auth.users para
--    que valga al instante, sin esperar a que se renueve el token de la sesion.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select (u.raw_app_meta_data ->> 'role') = 'admin' from auth.users u where u.id = auth.uid()), false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 2) Politicas que comprobaban el rol por su cuenta (en el token o consultando auth.users,
--    que ademas daba "permission denied for table users"): ahora llaman a is_admin().
create temp table _sin_corregir (tabla text, politica text, motivo text) on commit drop;

do $$
declare
  p record;
  q text;
  w text;
  sql text;
  -- Formas en que Postgres guarda esas comprobaciones.
  en_token constant text := '(((auth.jwt() -> ''user_metadata''::text) ->> ''role''::text) = ''admin''::text)';
  en_tabla constant text := '\(EXISTS \( SELECT 1\s+FROM auth\.users\s+WHERE \(\(users\.id = auth\.uid\(\)\) AND \(\(users\.raw_user_meta_data ->> ''role''::text\) = ''admin''::text\)\)\)\)';
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname in ('public', 'storage')
      and (coalesce(qual, '') ~ 'user_meta' or coalesce(with_check, '') ~ 'user_meta')
  loop
    q := regexp_replace(replace(p.qual, en_token, 'public.is_admin()'), en_tabla, 'public.is_admin()', 'g');
    w := regexp_replace(replace(p.with_check, en_token, 'public.is_admin()'), en_tabla, 'public.is_admin()', 'g');
    if coalesce(q, '') ~ 'user_meta' or coalesce(w, '') ~ 'user_meta' then
      insert into _sin_corregir values (p.schemaname || '.' || p.tablename, p.policyname, 'forma no reconocida: revisar a mano');
      continue;
    end if;
    sql := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename)
      || case when q is not null then format(' using (%s)', q) else '' end
      || case when w is not null then format(' with check (%s)', w) else '' end;
    begin
      execute sql;
    exception when others then
      insert into _sin_corregir values (p.schemaname || '.' || p.tablename, p.policyname, sqlerrm);
    end;
  end loop;
end $$;

-- 3) Mensajes del formulario de contacto: cualquier usuario con sesion podia leer, editar
--    y borrar TODOS (nombres, correos y telefonos de quienes escriben). Ahora: el admin
--    todo; cada usuario solo los que mando con su propio correo. Enviar sigue abierto.
drop policy if exists "Authenticated users can read contact messages" on public.contact_messages;
drop policy if exists "Authenticated users can update contact messages" on public.contact_messages;
drop policy if exists "Authenticated users can delete contact messages" on public.contact_messages;
drop policy if exists "authenticated_select_contact_messages" on public.contact_messages;
drop policy if exists "authenticated_update_contact_messages" on public.contact_messages;
drop policy if exists "authenticated_delete_contact_messages" on public.contact_messages;
drop policy if exists "contact_messages admin" on public.contact_messages;
drop policy if exists "contact_messages propios" on public.contact_messages;
create policy "contact_messages admin" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contact_messages propios" on public.contact_messages
  for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 4) Proyectos: un cliente podia editar o borrar los suyos, incluido el precio total. El
--    portal no lo usa (solo crea y lee); editar y borrar queda para el admin.
drop policy if exists "Users can update their own projects" on public.projects;
drop policy if exists "Users can delete their own projects" on public.projects;

commit;

-- Resultado: lo que no se pudo corregir, mas cualquier regla que aun lea el rol de
-- user_metadata. Debe salir vacio.
select schemaname || '.' || tablename as tabla, policyname as politica, 'aun lee user_metadata' as motivo
from pg_policies
where coalesce(qual, '') ~ 'user_meta' or coalesce(with_check, '') ~ 'user_meta';
