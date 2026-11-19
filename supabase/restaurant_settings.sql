-- Apply after owner_portal.sql. Owners may edit profile fields, never approval or ownership.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-images', 'restaurant-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_manage_restaurant_image(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and p_name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
    and exists (select 1 from public.restaurant_users ru
      where ru.user_id = auth.uid() and ru.restaurant_id::text = split_part(p_name, '/', 1));
$$;
create or replace function public.is_unused_restaurant_image(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.can_manage_restaurant_image(p_name)
    and not exists (select 1 from public.restaurants r where r.image = 'restaurant-images/' || p_name);
$$;
revoke all on function public.can_manage_restaurant_image(text) from public, anon;
revoke all on function public.is_unused_restaurant_image(text) from public, anon;
grant execute on function public.can_manage_restaurant_image(text), public.is_unused_restaurant_image(text) to authenticated;

drop policy if exists "managers upload restaurant photos" on storage.objects;
create policy "managers upload restaurant photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'restaurant-images' and public.can_manage_restaurant_image(name));
drop policy if exists "managers read restaurant photos" on storage.objects;
create policy "managers read restaurant photos" on storage.objects for select to authenticated
  using (bucket_id = 'restaurant-images' and public.can_manage_restaurant_image(name));
-- Versioned filenames avoid overwriting a live image. Only unused uploads can be removed.
drop policy if exists "managers remove unused restaurant photos" on storage.objects;
create policy "managers remove unused restaurant photos" on storage.objects for delete to authenticated
  using (bucket_id = 'restaurant-images' and public.can_manage_restaurant_image(name)
    and public.is_unused_restaurant_image(name));

create or replace function public.update_owned_restaurant(p_restaurant_id uuid, p_restaurant jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  saved public.restaurants;
  type_id uuid;
  restaurant_name text := btrim(p_restaurant->>'name');
  city_name text := p_restaurant->>'city';
  website text := btrim(coalesce(p_restaurant->>'web', ''));
  image_name text := coalesce(p_restaurant->>'image', '');
  object_name text;
  latitude double precision;
  longitude double precision;
  opening_hours jsonb := p_restaurant->'hours';
  entry jsonb;
  expected_days text[] := array['Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota','Nedeľa'];
  day_index integer := 0;
begin
  if auth.uid() is null or not public.manages_restaurant(p_restaurant_id)
  then raise exception 'Restaurant access denied' using errcode = '42501'; end if;
  select * into saved from public.restaurants where id = p_restaurant_id for update;
  if not found then raise exception 'Restaurant not found' using errcode = '22023'; end if;
  if restaurant_name is null or char_length(restaurant_name) not between 2 and 120
    or city_name is null or city_name not in ('Bratislava','Košice')
    or char_length(btrim(coalesce(p_restaurant->>'address',''))) not between 5 and 200
    or char_length(btrim(coalesce(p_restaurant->>'email',''))) not between 5 and 254
    or coalesce(p_restaurant->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(btrim(coalesce(p_restaurant->>'phone',''))) not between 5 and 40
    or char_length(coalesce(p_restaurant->>'district','')) > 100
    or char_length(coalesce(p_restaurant->>'tagline','')) > 200
    or char_length(website) > 300 or (website <> '' and website !~ '^https?://[^[:space:]/@]+([/?#][^[:space:]]*)?$')
    or coalesce(jsonb_typeof(p_restaurant->'delivery_available'),'') <> 'boolean'
    or char_length(coalesce(p_restaurant->>'delivery_eta','')) > 80
  then raise exception 'Invalid restaurant details' using errcode = '22023'; end if;
  latitude := (p_restaurant->>'lat')::double precision;
  longitude := (p_restaurant->>'lng')::double precision;
  if latitude is null or longitude is null or not (latitude between -90 and 90 and longitude between -180 and 180)
  then raise exception 'Invalid map position' using errcode = '22023'; end if;
  select t.id into type_id from public.restaurant_types t where t.name = p_restaurant->>'cuisine';
  if type_id is null then raise exception 'Unknown cuisine' using errcode = '22023'; end if;
  if opening_hours is null or jsonb_typeof(opening_hours) <> 'array'
  then raise exception 'Invalid opening hours' using errcode = '22023'; end if;
  if jsonb_array_length(opening_hours) not in (0,7)
  then raise exception 'Opening hours require all seven days' using errcode = '22023'; end if;
  for entry in select value from jsonb_array_elements(opening_hours) loop
    day_index := day_index + 1;
    if jsonb_typeof(entry) <> 'array' then raise exception 'Invalid opening hours' using errcode = '22023'; end if;
    if jsonb_array_length(entry) <> 2 or (entry->>0) is distinct from expected_days[day_index]
      or coalesce(entry->>1,'') !~ '^(Zatvorené|([01][0-9]|2[0-3]):[0-5][0-9] – (([01][0-9]|2[0-3]):[0-5][0-9]|24:00))$'
    then raise exception 'Invalid opening hours' using errcode = '22023'; end if;
  end loop;
  -- Existing imported URLs may be retained. New images must be real uploads in this restaurant's folder.
  if image_name <> '' and image_name is distinct from saved.image then
    object_name := substr(image_name, char_length('restaurant-images/') + 1);
    if image_name not like 'restaurant-images/%' or split_part(object_name,'/',1) <> p_restaurant_id::text
      or not public.can_manage_restaurant_image(object_name)
    then raise exception 'Invalid restaurant image' using errcode = '22023'; end if;
    perform 1 from storage.objects where bucket_id = 'restaurant-images' and name = object_name for share;
    if not found then raise exception 'Photo upload not found' using errcode = '22023'; end if;
  end if;
  update public.restaurants set
    name = restaurant_name, city = city_name,
    district = coalesce(p_restaurant->>'district',''), address = btrim(p_restaurant->>'address'),
    email = btrim(p_restaurant->>'email'), phone = btrim(p_restaurant->>'phone'), web = website,
    tagline = coalesce(p_restaurant->>'tagline',''), lat = latitude, lng = longitude,
    image = image_name, hours = opening_hours, delivery_available = (p_restaurant->>'delivery_available')::boolean,
    delivery_eta = case when (p_restaurant->>'delivery_available')::boolean then coalesce(p_restaurant->>'delivery_eta','') else '' end
    where id = p_restaurant_id returning * into saved;
  delete from public.restaurant_type_links where restaurant_id = p_restaurant_id;
  insert into public.restaurant_type_links (restaurant_id,type_id) values (p_restaurant_id,type_id);
  return to_jsonb(saved);
end;
$$;
revoke all on function public.update_owned_restaurant(uuid,jsonb) from public, anon;
grant execute on function public.update_owned_restaurant(uuid,jsonb) to authenticated;
commit;
