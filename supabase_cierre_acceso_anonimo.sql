-- =====================================================================
-- CIERRE DEL ACCESO ANÓNIMO (URGENTE)
-- Correr completo en el SQL Editor de Supabase. Se puede correr más de una vez.
--
-- Problema: varias reglas viejas estaban creadas para el rol "public", que
-- incluye a "anon" (sin iniciar sesión). Como la clave anon viaja dentro de la
-- app, cualquiera en internet podía leer, modificar y borrar tareas, equipos,
-- plantillas, eventos, locaciones, bienes, partes diarios y perfiles.
-- La regla "hse_require_approved" no lo frenaba porque solo aplica a "authenticated".
--
-- Qué hace (para los usuarios logueados NO cambia nada):
--  1) Pasa esas reglas de "public" a "authenticated".
--  2) Quita al rol anon todos los permisos sobre las tablas de la app.
--  3) Quita a anon la ejecución de las funciones SECURITY DEFINER y fija search_path.
-- =====================================================================

-- 1) Reglas creadas para "public" -> solo usuarios logueados
do $$
declare
  p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public' and 'public' = any(roles)
  loop
    execute format('alter policy %I on public.%I to authenticated', p.policyname, p.tablename);
  end loop;
end $$;

-- 2) El rol anónimo no necesita tocar ninguna tabla (el login lo maneja Supabase Auth)
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- 3) Funciones SECURITY DEFINER: anon no las puede llamar; las de trigger, nadie por API
revoke execute on function public.hse_is_admin() from anon, public;
revoke execute on function public.hse_is_approved() from anon, public;
revoke execute on function public.hse_my_base() from anon, public;
grant execute on function public.hse_is_admin() to authenticated;
grant execute on function public.hse_is_approved() to authenticated;
grant execute on function public.hse_my_base() to authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.hse_protect_profile() from anon, authenticated, public;
alter function public.handle_new_user() set search_path = public;
alter function public.set_rig_new_location(uuid, text, date) set search_path = public;
revoke execute on function public.set_rig_new_location(uuid, text, date) from anon, public;
grant execute on function public.set_rig_new_location(uuid, text, date) to authenticated;

-- Control: debe dar 0 filas
select tablename, policyname from pg_policies where schemaname = 'public' and 'public' = any(roles);
