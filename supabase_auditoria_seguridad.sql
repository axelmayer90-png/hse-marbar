-- =====================================================================
-- AUDITORÍA DE SEGURIDAD (SOLO LECTURA: no cambia nada)
-- Correr en el SQL Editor de Supabase y revisar cada resultado.
-- =====================================================================

-- 1) Tablas SIN RLS. La clave "anon" está dentro del JavaScript público de la app:
--    cualquier persona en internet (sin cuenta) puede leer/escribir estas tablas.
--    Resultado esperado: ninguna fila.
select c.relname as tabla_sin_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 2) Tablas con RLS pero SIN la regla restrictiva "hse_require_approved"
--    (por ej. tablas creadas después de correr supabase_aprobacion_usuarios.sql).
--    Un usuario recién registrado y NO aprobado podría usarlas.
--    Resultado esperado: ninguna fila (si aparece alguna, volver a correr ese script).
select c.relname as tabla_sin_bloqueo_aprobacion
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  and not exists (select 1 from pg_policies p
                  where p.schemaname = 'public' and p.tablename = c.relname and p.policyname = 'hse_require_approved');

-- 3) Todas las reglas de acceso. Revisar especialmente las que tengan
--    qual / with_check = 'true' en INSERT/UPDATE/DELETE: ahí cualquier inspector aprobado
--    puede borrar o modificar datos de todos (equipos, plantillas, campañas...),
--    aunque la app le oculte el botón.
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 4) Permisos del rol anónimo (sin sesión). Idealmente "anon" no debería tener
--    INSERT/UPDATE/DELETE en ninguna tabla de la app.
select table_name, string_agg(privilege_type, ', ' order by privilege_type) as permisos_anon
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
group by table_name order by table_name;

-- 5) Funciones SECURITY DEFINER (corren con permisos elevados). Todas deberían
--    tener search_path fijo (proconfig con search_path=...).
select p.proname, p.proconfig
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by p.proname;

-- 6) Buckets de Storage públicos (si se usan).
select id, name, public from storage.buckets order by name;

-- 7) Usuarios sin confirmar el mail y perfiles pendientes de aprobación.
select u.email, u.created_at, u.email_confirmed_at, p.role, p.approved
from auth.users u left join public.profiles p on p.id = u.id
where u.email_confirmed_at is null or p.approved is not true
order by u.created_at desc;
