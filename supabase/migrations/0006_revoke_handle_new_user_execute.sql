-- 0006_revoke_handle_new_user_execute.sql
-- Lock down handle_new_user so it can only be invoked by Postgres triggers, not by
-- anon/authenticated clients via the PostgREST /rest/v1/rpc/ endpoint.
-- Supabase's auth trigger mechanism uses the supabase_auth_admin role, which
-- bypasses these revokes and remains the legitimate caller.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

grant execute on function public.handle_new_user() to supabase_auth_admin;
