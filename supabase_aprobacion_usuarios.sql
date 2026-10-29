-- =====================================================================
-- APROBACIÓN DE USUARIOS + ROL "SOLO INFORMES"
-- Correr completo en el SQL Editor de Supabase. Se puede correr más de una vez.
--
-- Qué hace:
--  1) Agrega la columna "approved" a profiles. Los usuarios que YA existen
--     quedan aprobados; los que se registren de ahora en más quedan pendientes.
--  2) Agrega el rol 'informes' (usuario que solo ve el módulo Informes).
--  3) Impide que alguien se registre con rol admin o se auto-apruebe
--     (solo el administrador puede cambiar rol, base y aprobación).
--  4) Bloquea a nivel base de datos a los usuarios NO aprobados: aunque
--     tengan cuenta, no pueden leer ni escribir ninguna tabla (solo su propio perfil).
-- =====================================================================

-- 1) Columna de aprobación
alter table public.profiles add column if not exists approved boolean;
update public.profiles set approved = true where approved is null;      -- los actuales siguen entrando
alter table public.profiles alter column approved set default false;    -- los nuevos quedan pendientes
alter table public.profiles alter column approved set not null;
alter table public.profiles add column if not exists approved_at timestamptz;

-- 2) Permitir el rol 'informes' (mantiene todos los roles que ya existían)
do $$
declare
  old_def text;
  lista text;
begin
  select pg_get_constraintdef(c.oid) into old_def
  from pg_constraint c
  where c.conname = 'profiles_role_check' and c.conrelid = 'public.profiles'::regclass;

  select string_agg(quote_literal(r), ',') into lista from (
    select (regexp_matches(coalesce(old_def, ''), '''([^'']+)''', 'g'))[1] as r
    union select distinct role from public.profiles where role is not null
    union select unnest(array['admin', 'inspector', 'base', 'informes'])
  ) t;

  alter table public.profiles drop constraint if exists profiles_role_check;
  execute format('alter table public.profiles add constraint profiles_role_check check (role is null or role in (%s))', lista);
end $$;

-- 3) Función auxiliar: ¿el usuario actual está aprobado? (el admin siempre)
create or replace function public.hse_is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select public.hse_is_admin()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved);
$$;

-- 4) Protección de campos sensibles del perfil
--    - Al registrarse: siempre queda pendiente y como inspector (aunque mande otro rol).
--    - Al editar: solo el admin puede cambiar rol, base o aprobación.
create or replace function public.hse_protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Admin de la app, panel de Supabase (postgres) o procesos con service_role: pueden todo
  if public.hse_is_admin() or session_user = 'postgres' or coalesce(auth.role(), '') = 'service_role' then
    if tg_op = 'UPDATE' and new.approved and not coalesce(old.approved, false) then
      new.approved_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.approved := false;
    new.approved_at := null;
    if new.role is distinct from 'inspector' then new.role := 'inspector'; end if;
    new.base := null;
  else
    new.approved := old.approved;
    new.approved_at := old.approved_at;
    new.role := old.role;
    new.base := old.base;
  end if;
  return new;
end $$;

drop trigger if exists hse_protect_profile on public.profiles;
create trigger hse_protect_profile
  before insert or update on public.profiles
  for each row execute function public.hse_protect_profile();

-- 5) Bloqueo general: en TODAS las tablas con reglas de acceso (RLS) activas,
--    se agrega una regla RESTRICTIVA que exige estar aprobado.
--    Las reglas que ya tenías siguen igual; esta se suma a todas.
--    En profiles, el usuario pendiente puede ver su propio perfil (para mostrarle
--    "pendiente de aprobación"), pero nada más.
do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  loop
    execute format('drop policy if exists hse_require_approved on public.%I', t.relname);
    if t.relname = 'profiles' then
      execute 'create policy hse_require_approved on public.profiles as restrictive for all to authenticated
               using (public.hse_is_approved() or id = auth.uid())
               with check (public.hse_is_approved() or id = auth.uid())';
    else
      execute format('create policy hse_require_approved on public.%I as restrictive for all to authenticated
                      using (public.hse_is_approved()) with check (public.hse_is_approved())', t.relname);
    end if;
  end loop;
end $$;

-- 6) Control: tablas SIN reglas de acceso (RLS) activas.
--    Si aparece alguna acá, cualquier usuario logueado (incluso pendiente) podría leerla.
select c.relname as tabla_sin_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
