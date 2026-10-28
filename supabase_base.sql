-- =====================================================================
-- MÓDULO BASES: controles de elementos de emergencia en bases
-- (Neuquén, Rincón de los Sauces, Añelo)
-- Correr completo en el SQL Editor de Supabase. Se puede correr más de una vez.
-- =====================================================================

-- 1) Perfil: base asignada al usuario (rol 'base')
alter table public.profiles add column if not exists base text;

-- 1b) Permitir el rol 'base' en profiles (mantiene todos los roles que ya existían)
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
    union select unnest(array['admin', 'inspector', 'base'])
  ) t;

  alter table public.profiles drop constraint if exists profiles_role_check;
  execute format('alter table public.profiles add constraint profiles_role_check check (role is null or role in (%s))', lista);
end $$;

-- 2) Funciones auxiliares para las reglas de acceso
create or replace function public.hse_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      or coalesce(auth.jwt() ->> 'email', '') = 'axel.mayer90@gmail.com';
$$;

create or replace function public.hse_my_base() returns text
language sql stable security definer set search_path = public as $$
  select p.base from public.profiles p where p.id = auth.uid();
$$;

-- 3) Inventario de elementos por base (extintores, botiquines, DEA, etc.)
create table if not exists public.base_elements (
  id uuid primary key default gen_random_uuid(),
  base text not null,
  type text not null,              -- EXTINTOR | LAVAOJOS | BOTIQUIN | DUCHA | KIT_DERRAMES | DEA
  code text,                       -- N° / identificación
  location text,                   -- ubicación física
  data jsonb not null default '{}',-- datos fijos (tipo, clase, kg, vencimientos, marca, modelo...)
  active boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) Controles realizados
create table if not exists public.base_controls (
  id uuid primary key default gen_random_uuid(),
  element_id uuid not null references public.base_elements(id) on delete cascade,
  base text not null,
  type text not null,
  control_date date not null default current_date,
  responsible text,
  answers jsonb not null default '{}',
  element_snapshot jsonb,          -- datos del elemento al momento del control
  observations text,
  issues int not null default 0,   -- cantidad de ítems en Mal / Falta / No
  created_by uuid default auth.uid(),
  created_by_name text,
  created_at timestamptz default now(),
  reviewed_by_name text,           -- "Revisó" (administrador)
  reviewed_at timestamptz
);
create index if not exists base_controls_element_idx on public.base_controls (element_id, control_date desc);
create index if not exists base_controls_base_idx on public.base_controls (base, control_date desc);

-- 5) Reglas de acceso: el administrador ve todo; el usuario de base, solo su base
alter table public.base_elements enable row level security;
alter table public.base_controls enable row level security;

drop policy if exists "base_elements_rw" on public.base_elements;
create policy "base_elements_rw" on public.base_elements for all to authenticated
  using (public.hse_is_admin() or base = public.hse_my_base())
  with check (public.hse_is_admin() or base = public.hse_my_base());

drop policy if exists "base_controls_select" on public.base_controls;
create policy "base_controls_select" on public.base_controls for select to authenticated
  using (public.hse_is_admin() or base = public.hse_my_base());

drop policy if exists "base_controls_insert" on public.base_controls;
create policy "base_controls_insert" on public.base_controls for insert to authenticated
  with check (public.hse_is_admin() or base = public.hse_my_base());

drop policy if exists "base_controls_update" on public.base_controls;
create policy "base_controls_update" on public.base_controls for update to authenticated
  using (public.hse_is_admin() or (base = public.hse_my_base() and created_by = auth.uid()))
  with check (public.hse_is_admin() or (base = public.hse_my_base() and created_by = auth.uid()));

drop policy if exists "base_controls_delete" on public.base_controls;
create policy "base_controls_delete" on public.base_controls for delete to authenticated
  using (public.hse_is_admin());

-- 6) El administrador puede asignar el rol 'base' y la base a un usuario desde la app
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated
  using (public.hse_is_admin()) with check (public.hse_is_admin());
