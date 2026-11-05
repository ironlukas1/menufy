-- Apply after the initial backend schema and supabase/user_data.sql.
-- Account metadata is descriptive only. Ownership and admin access are checked in SQL.
begin;

alter table public.restaurants add column if not exists owner_submitted boolean not null default false;
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users on conflict (id) do nothing;

-- Pending applications are visible only to their managers and admins.
drop policy if exists "public read active restaurants" on public.restaurants;
create policy "public read active restaurants" on public.restaurants for select
  using (status = 'active' or public.manages_restaurant(id) or public.is_admin());

drop policy if exists "public read published daily menus" on public.menus;
create policy "public read published daily menus" on public.menus for select using (
  public.manages_restaurant(restaurant_id) or public.is_admin() or (
    status = 'published' and exists (
      select 1 from public.restaurants r where r.id = restaurant_id and r.status = 'active'
    )
  )
);
drop policy if exists "public read items of visible menus" on public.menu_items;
create policy "public read items of visible menus" on public.menu_items for select using (
  exists (select 1 from public.menus m where m.id = menu_id)
);

-- All portal writes go through the transactional functions below.
-- In particular, owners must never be able to set their restaurant to active themselves.
revoke insert, update, delete on public.restaurants, public.restaurant_users,
  public.menus, public.menu_items from anon, authenticated;
grant select on public.restaurants, public.restaurant_users, public.menus,
  public.menu_items, public.profiles to authenticated;
grant select on public.restaurants, public.menus, public.menu_items to anon;

create or replace function public.submit_owned_restaurant(p_restaurant jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  member_id uuid := auth.uid();
  target uuid;
  type_id uuid;
  restaurant_name text := btrim(p_restaurant->>'name');
  city_name text := p_restaurant->>'city';
  latitude double precision;
  longitude double precision;
begin
  if member_id is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if restaurant_name is null or char_length(restaurant_name) not between 2 and 120
    or coalesce(p_restaurant->>'ico', '') !~ '^[0-9]{8}$'
    or city_name not in ('Bratislava', 'Košice') or city_name is null
    or char_length(btrim(coalesce(p_restaurant->>'address', ''))) not between 5 and 200
    or char_length(btrim(coalesce(p_restaurant->>'email', ''))) not between 5 and 254
    or coalesce(p_restaurant->>'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(btrim(coalesce(p_restaurant->>'phone', ''))) not between 5 and 40
    or char_length(coalesce(p_restaurant->>'tagline', '')) > 200
    or char_length(coalesce(p_restaurant->>'district', '')) > 100
  then raise exception 'Invalid restaurant details' using errcode = '22023'; end if;
  latitude := (p_restaurant->>'lat')::double precision;
  longitude := (p_restaurant->>'lng')::double precision;
  if latitude is null or longitude is null or not (latitude between -90 and 90 and longitude between -180 and 180)
  then raise exception 'Invalid map position' using errcode = '22023'; end if;
  select t.id into type_id from public.restaurant_types t where t.name = p_restaurant->>'cuisine';
  if type_id is null then raise exception 'Unknown cuisine' using errcode = '22023'; end if;
  insert into public.profiles (id, email)
    select id, coalesce(email, '') from auth.users where id = member_id on conflict (id) do nothing;
  insert into public.restaurants (slug, name, initials, ico, city, district, address, email, phone, tagline, lat, lng, status, owner_submitted)
  values (
    trim(both '-' from regexp_replace(public.menufy_search_key(restaurant_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8),
    restaurant_name, upper(left(restaurant_name, 2)), p_restaurant->>'ico', city_name,
    coalesce(p_restaurant->>'district', ''), btrim(p_restaurant->>'address'), btrim(p_restaurant->>'email'),
    btrim(p_restaurant->>'phone'), coalesce(p_restaurant->>'tagline', ''), latitude, longitude, 'pending', true
  ) returning id into target;
  insert into public.restaurant_users (user_id, restaurant_id, role) values (member_id, target, 'owner');
  insert into public.restaurant_type_links (restaurant_id, type_id) values (target, type_id);
  return target;
end;
$$;

create or replace function public.save_owned_menu(
  p_restaurant_id uuid, p_kind text, p_date date, p_status text, p_items jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  restaurant_status text;
  target uuid;
  item jsonb;
  item_position integer := 0;
  allergen_values smallint[];
begin
  if auth.uid() is null or not public.manages_restaurant(p_restaurant_id)
  then raise exception 'Restaurant access denied' using errcode = '42501'; end if;
  -- Serialize saves and approvals so drafts cannot be published during a status change.
  select status into restaurant_status from public.restaurants where id = p_restaurant_id for update;
  if p_kind is null or p_kind not in ('daily', 'standard') or p_status is null or p_status not in ('draft', 'published')
    or (p_kind = 'daily' and p_date is null)
    or p_items is null or jsonb_typeof(p_items) <> 'array'
  then raise exception 'Invalid menu' using errcode = '22023'; end if;
  if jsonb_array_length(p_items) not between 1 and 50
  then raise exception 'Menu needs 1 to 50 items' using errcode = '22023'; end if;
  if p_status = 'published' and restaurant_status <> 'active'
  then raise exception 'Restaurant must be approved before publishing' using errcode = '42501'; end if;
  select id into target from public.menus where restaurant_id = p_restaurant_id and kind = p_kind
    and date is not distinct from (case when p_kind = 'daily' then p_date else null end) for update;
  if target is null then
    insert into public.menus (restaurant_id, kind, date, status, published_at)
    values (p_restaurant_id, p_kind, case when p_kind = 'daily' then p_date else null end, p_status,
      case when p_status = 'published' then now() else null end) returning id into target;
  else
    update public.menus set status = p_status, published_at = case when p_status = 'published' then now() else null end where id = target;
  end if;
  delete from public.menu_items where menu_id = target;
  for item in select value from jsonb_array_elements(p_items) loop
    if char_length(btrim(coalesce(item->>'name', ''))) not between 2 and 120
      or coalesce(item->>'price_cents', '') !~ '^[0-9]{1,7}$'
      or (item->>'price_cents')::integer not between 0 and 100000
      or char_length(coalesce(item->>'description', '')) > 500
      or char_length(coalesce(item->>'weight', '')) > 40
      or char_length(coalesce(item->>'tag', '')) > 40
      or coalesce(jsonb_typeof(item->'allergens'), '') <> 'array'
    then raise exception 'Invalid menu item' using errcode = '22023'; end if;
    select coalesce(array_agg(value::smallint), '{}'::smallint[]) into allergen_values
      from jsonb_array_elements_text(item->'allergens');
    if not (allergen_values <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14]::smallint[])
    then raise exception 'Invalid allergens' using errcode = '22023'; end if;
    insert into public.menu_items (menu_id, name, description, weight, price_cents, allergens, tag, position)
    values (target, btrim(item->>'name'), coalesce(item->>'description', ''), coalesce(item->>'weight', ''),
      (item->>'price_cents')::integer, allergen_values, coalesce(item->>'tag', ''), item_position);
    item_position := item_position + 1;
  end loop;
  return target;
end;
$$;

create or replace function public.review_restaurant_application(p_restaurant_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_admin()
  then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_approve is null then raise exception 'Decision required' using errcode = '22023'; end if;
  update public.restaurants set status = case when p_approve then 'active' else 'hidden' end
    where id = p_restaurant_id and status = 'pending' and owner_submitted;
  if not found then raise exception 'Pending application not found' using errcode = '22023'; end if;
end;
$$;

revoke all on function public.submit_owned_restaurant(jsonb) from public, anon;
revoke all on function public.save_owned_menu(uuid, text, date, text, jsonb) from public, anon;
revoke all on function public.review_restaurant_application(uuid, boolean) from public, anon;
grant execute on function public.submit_owned_restaurant(jsonb) to authenticated;
grant execute on function public.save_owned_menu(uuid, text, date, text, jsonb) to authenticated;
grant execute on function public.review_restaurant_application(uuid, boolean) to authenticated;
commit;
