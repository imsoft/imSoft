-- SEGURIDAD: el rol de administrador se lee de app_metadata, no de user_metadata.
--
-- user_metadata lo puede escribir el propio usuario con supabase.auth.updateUser, y el
-- registro esta abierto: cualquiera que se registrara podia volverse administrador en la
-- base (comprobado el 5-oct-2026: un usuario de prueba leyo los 378 contactos del CRM).
-- app_metadata solo lo escribe el servidor con la llave de servicio.
--
-- Aplicar a mano en Supabase (SQL Editor). Se puede correr las veces que haga falta.
-- Todo va en un solo bloque: o se aplica completo o no cambia nada. Al final devuelve una
-- tabla que debe salir VACIA.
--
-- (La primera version usaba una tabla temporal y fallo con 'relation "_sin_corregir" does
-- not exist': el editor ejecuta cada instruccion por separado y la tabla ya no existia.)

do $migracion$
declare
  p record;
  q text;
  w text;
  -- Formas en que Postgres guarda las comprobaciones de rol que hay que reemplazar.
  en_token constant text := '(((auth.jwt() -> ''user_metadata''::text) ->> ''role''::text) = ''admin''::text)';
  en_tabla constant text := '\(EXISTS \( SELECT 1\s+FROM auth\.users\s+WHERE \(\(users\.id = auth\.uid\(\)\) AND \(\(users\.raw_user_meta_data ->> ''role''::text\) = ''admin''::text\)\)\)\)';
  -- Tablas del CRM: solo las maneja el administrador.
  crm constant text[] := array['contacts', 'deals', 'deal_stages', 'deal_emails', 'contact_emails', 'contact_custom_fields', 'activities'];
begin
  -- 1) is_admin(): la usan casi todas las politicas. Lee el rol directo de auth.users para
  --    que valga al instante, sin esperar a que se renueve el token de la sesion.
  execute $fn$
    create or replace function public.is_admin() returns boolean
    language sql stable security definer set search_path = ''
    as $body$
      select coalesce((select (u.raw_app_meta_data ->> 'role') = 'admin' from auth.users u where u.id = auth.uid()), false)
    $body$
  $fn$;
  execute 'revoke all on function public.is_admin() from public';
  execute 'grant execute on function public.is_admin() to anon, authenticated, service_role';

  -- 2) Politicas que comprobaban el rol por su cuenta (en el token, o consultando
  --    auth.users, que ademas daba "permission denied for table users"): ahora is_admin().
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname in ('public', 'storage')
      and (coalesce(qual, '') ~ 'user_meta' or coalesce(with_check, '') ~ 'user_meta')
  loop
    q := regexp_replace(replace(p.qual, en_token, 'public.is_admin()'), en_tabla, 'public.is_admin()', 'g');
    w := regexp_replace(replace(p.with_check, en_token, 'public.is_admin()'), en_tabla, 'public.is_admin()', 'g');
    if coalesce(q, '') ~ 'user_meta' or coalesce(w, '') ~ 'user_meta' then
      -- Forma no reconocida. Si la politica es de administradores (se llaman "Admins can
      -- ..."), toda su condicion es la comprobacion de rol: se sustituye completa. Estas
      -- politicas consultan auth.users y fallan con "permission denied for table users",
      -- lo que rompia la tabla entera para todos, tambien para el admin.
      if p.policyname ~* '^admins? can ' then
        q := case when p.qual is not null then 'public.is_admin()' end;
        w := case when p.with_check is not null then 'public.is_admin()' end;
      else
        raise notice 'No reconozco la forma de %.% "%": revisar a mano', p.schemaname, p.tablename, p.policyname;
        continue;
      end if;
    end if;
    begin
      execute format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename)
        || case when q is not null then format(' using (%s)', q) else '' end
        || case when w is not null then format(' with check (%s)', w) else '' end;
    exception when others then
      raise notice 'No pude cambiar %.% "%": %', p.schemaname, p.tablename, p.policyname, sqlerrm;
    end;
  end loop;

  -- 3) CRM: las politicas decian "cualquier usuario con sesion" (USING true). Un cliente
  --    registrado podia leer, editar y borrar todos los contactos. Ahora solo el admin.
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename = any (crm)
      and (qual = 'true' or with_check = 'true')
  loop
    execute format('alter policy %I on public.%I', p.policyname, p.tablename)
      || case when p.qual is not null then format(' using (%s)', case when p.qual = 'true' then 'public.is_admin()' else p.qual end) else '' end
      || case when p.with_check is not null then format(' with check (%s)', case when p.with_check = 'true' then 'public.is_admin()' else p.with_check end) else '' end;
  end loop;

  -- 4) Mensajes del formulario de contacto: cualquier usuario con sesion podia leer,
  --    editar y borrar TODOS. Ahora: el admin todo; cada usuario solo los que mando con su
  --    propio correo. Enviar un mensaje sigue abierto a cualquiera.
  execute 'drop policy if exists "Authenticated users can read contact messages" on public.contact_messages';
  execute 'drop policy if exists "Authenticated users can update contact messages" on public.contact_messages';
  execute 'drop policy if exists "Authenticated users can delete contact messages" on public.contact_messages';
  execute 'drop policy if exists "authenticated_select_contact_messages" on public.contact_messages';
  execute 'drop policy if exists "authenticated_update_contact_messages" on public.contact_messages';
  execute 'drop policy if exists "authenticated_delete_contact_messages" on public.contact_messages';
  execute 'drop policy if exists "contact_messages admin" on public.contact_messages';
  execute 'drop policy if exists "contact_messages propios" on public.contact_messages';
  execute 'create policy "contact_messages admin" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  execute $pol$create policy "contact_messages propios" on public.contact_messages for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'))$pol$;

  -- 5) Proyectos: un cliente podia editar o borrar los suyos, incluido el precio total. El
  --    portal no lo usa (solo crea y lee); editar y borrar queda para el admin.
  execute 'drop policy if exists "Users can update their own projects" on public.projects';
  execute 'drop policy if exists "Users can delete their own projects" on public.projects';
end
$migracion$;

-- Resultado: debe salir vacio. Lista cualquier regla que aun lea el rol de user_metadata
-- o que siga abriendo una tabla del CRM a cualquier usuario.
select schemaname || '.' || tablename as tabla, policyname as politica,
       case when coalesce(qual, '') ~ 'user_meta' or coalesce(with_check, '') ~ 'user_meta' then 'aun lee user_metadata' else 'abierta a cualquier usuario' end as motivo
from pg_policies
where coalesce(qual, '') ~ 'user_meta' or coalesce(with_check, '') ~ 'user_meta'
   or (schemaname = 'public'
       and tablename in ('contacts', 'deals', 'deal_stages', 'deal_emails', 'contact_emails', 'contact_custom_fields', 'activities')
       and (qual = 'true' or with_check = 'true'));
