-- 0005_fix_handle_new_user_security.sql
-- Convert the auto-create-profile trigger to SECURITY DEFINER and pin its search_path.
--
-- Why: when GoTrue creates a user in auth.users it does so as the supabase_auth_admin
-- role, which does not have INSERT permission on public.profiles. With SECURITY INVOKER
-- the trigger inherits that role's permissions and fails with
-- "permission denied for table profiles" during signup.
--
-- SECURITY DEFINER makes the function run as its owner (the postgres role) which has
-- bypassrls and all grants. Pinning search_path avoids the mutable-search-path warning
-- flagged by Supabase advisors.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    meta_full_name text;
    meta_avatar   text;
begin
    meta_full_name := coalesce(
        new.raw_user_meta_data ->> 'full_name',
        split_part(new.email, '@', 1)
    );
    meta_avatar := new.raw_user_meta_data ->> 'avatar_url';

    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, meta_full_name, meta_avatar)
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
