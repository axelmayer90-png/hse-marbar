# MARBAR HSE Perforación

App web (PWA) de seguimiento HSE de equipos de perforación: plan de tareas por pozo,
diario 14x14, informes de visita RG.SGI.27, contingencias, bienes, histórico y
controles de elementos de emergencia en bases.

- Frontend: React + Vite + Tailwind, desplegado en Vercel.
- Datos y usuarios: Supabase (la seguridad depende de las reglas RLS de la base).
- `api/weekly-reminder.js`: recordatorio semanal por mail (Vercel Cron).

## Desarrollo

```bash
npm ci
npm run dev     # servidor local
npm run lint
npm run build
```

## Scripts SQL (correr en el SQL Editor de Supabase)

- `supabase_base.sql` – módulo Bases.
- `supabase_visit_reports.sql` – registro de informes de visita.
- `supabase_aprobacion_usuarios.sql` – aprobación de usuarios y rol "Solo Informes".
- `supabase_auditoria_seguridad.sql` – auditoría de seguridad de solo lectura.
