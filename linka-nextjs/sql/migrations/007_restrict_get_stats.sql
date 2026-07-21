-- Migrare 007 — aplicata iulie 2026
-- Restrange permisiunea de EXECUTE pe functia get_stats() doar la service_role.
-- Gasit in al doilea audit tehnic: Postgres acorda implicit EXECUTE catre PUBLIC
-- la crearea oricarei functii noi, deci oricine cu cheia anon publica putea
-- apela get_stats() direct si citi numarul de comenzi/venituri. Functia e
-- folosita doar server-side (app/admin/page.tsx, prin clientul service_role),
-- deci anon/authenticated nu au nevoie de acces la ea.

REVOKE EXECUTE ON FUNCTION public.get_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_stats() TO service_role;
