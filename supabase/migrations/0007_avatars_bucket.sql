-- 0007_avatars_bucket.sql: Storage bucket + RLS for user avatars.
-- Path convention: {user_id}/avatar.{jpg|png|webp}. Bucket is public for
-- read so <Avatar.Image> can load the URL without a signed token; writes
-- are scoped via split_part(name, '/', 1) = auth.uid() so users can only
-- touch their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "avatars_select_public"
    on storage.objects
    for select
    to public
    using (bucket_id = 'avatars');

create policy "avatars_insert_own"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'avatars'
        and auth.uid()::text = split_part(name, '/', 1)
    );

create policy "avatars_update_own"
    on storage.objects
    for update
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid()::text = split_part(name, '/', 1)
    );

create policy "avatars_delete_own"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid()::text = split_part(name, '/', 1)
    );