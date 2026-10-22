-- Registro (solo texto) de los informes de visita técnica RG.SGI.27 generados desde la app.
-- Las fotos NO se guardan acá: quedan en el dispositivo del inspector y dentro del PDF.
create table if not exists public.visit_reports (
  id uuid primary key,
  report_code text not null default 'RG.SGI.27',
  report_type text,
  rig_id text,
  location_id text,
  equipo text,
  locacion text,
  pozo text,
  visit_date_text text,
  sector text,
  responsable text,
  participantes text,
  resumen jsonb,
  observaciones jsonb,
  plan_acciones jsonb,
  desvios_count int default 0,
  photos_count int default 0,
  file_name text,
  created_by uuid default auth.uid(),
  created_by_name text,
  generated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.visit_reports enable row level security;

drop policy if exists "visit_reports_select" on public.visit_reports;
create policy "visit_reports_select" on public.visit_reports
  for select to authenticated using (true);

drop policy if exists "visit_reports_insert" on public.visit_reports;
create policy "visit_reports_insert" on public.visit_reports
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "visit_reports_update" on public.visit_reports;
create policy "visit_reports_update" on public.visit_reports
  for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());

create index if not exists visit_reports_generated_at_idx on public.visit_reports (generated_at desc);

-- (Agregado) Detalle de los checklists RG.SSA.06 / RG.SSA.07 cargados en cada informe
alter table public.visit_reports add column if not exists checklists jsonb;
