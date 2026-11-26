-- Security hardening migration — 2026-11-26
--
-- Restaurant photos live in a PRIVATE bucket. Pending photos (uploaded by an
-- owner but not yet referenced by a restaurant profile) MUST NOT be publicly
-- readable: there is no public URL for them, and anon access must stay denied.
-- Only authenticated restaurant managers may read their own bucket objects.
--
-- This migration replaces the old `on conflict ... do update set public = true`
-- upsert used by restaurant_settings.sql / repair_restaurant_photos.sql.
begin;

-- Create the bucket only when missing; never set public = true.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-images', 'restaurant-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Force the existing bucket private, regardless of its previous setting.
update storage.buckets set public = false where id = 'restaurant-images';

-- Remove legacy policies that exposed the bucket to anon/public readers.
drop policy if exists "public read restaurant photos" on storage.objects;
drop policy if exists "public restaurant images" on storage.objects;
drop policy if exists "anyone can read restaurant photos" on storage.objects;
drop policy if exists "public read restaurant-images" on storage.objects;

-- Replace any older read policy with an authenticated, owner-scoped one.
drop policy if exists "managers read restaurant photos" on storage.objects;
create policy "managers read restaurant photos" on storage.objects for select to authenticated
  using (bucket_id = 'restaurant-images' and public.can_manage_restaurant_image(name));

-- Fail loudly if an anon/public policy still grants access to these objects.
do $$
declare
  leaked text;
begin
  select string_agg(p.policyname, ', ')
    into leaked
    from pg_policies p
   where p.schemaname = 'storage'
     and p.tablename = 'objects'
     and (p.roles is null or cardinality(p.roles) = 0 or 'anon'::name = any(p.roles))
     and (p.qual is null
          or p.qual::text like '%restaurant-images%'
          or p.with_check::text like '%restaurant-images%');
  if leaked is not null then
    raise exception 'Anon/public storage policy still exposes restaurant-images: %', leaked;
  end if;

  if not exists (select 1 from storage.buckets where id = 'restaurant-images' and public = false) then
    raise exception 'restaurant-images bucket is not private';
  end if;
end $$;

commit;

-- Manual verification (do not run against production without approval):
--   select id, public from storage.buckets where id = 'restaurant-images';
--   select policyname, roles, qual from pg_policies
--    where schemaname = 'storage' and tablename = 'objects'
--      and (qual::text like '%restaurant-images%' or with_check::text like '%restaurant-images%');
