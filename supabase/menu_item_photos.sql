-- Apply after owner_portal.sql and restaurant_settings.sql.
-- Optional dish photos live in the same public bucket as restaurant photos,
-- inside the owning restaurant's folder: restaurant-images/<restaurant_uuid>/<uuid>.<ext>
begin;

alter table public.menu_items add column if not exists image text not null default '';

-- A photo is not unused when a menu item still references it, even if the
-- restaurant profile has since changed its cover image.
create or replace function public.is_unused_restaurant_image(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.can_manage_restaurant_image(p_name)
    and not exists (select 1 from public.restaurants r where r.image = 'restaurant-images/' || p_name)
    and not exists (select 1 from public.menu_items mi where mi.image = 'restaurant-images/' || p_name);
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
  image_name text;
  object_name text;
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
      or char_length(coalesce(item->>'image', '')) > 300
      or coalesce(jsonb_typeof(item->'allergens'), '') <> 'array'
    then raise exception 'Invalid menu item' using errcode = '22023'; end if;
    select coalesce(array_agg(value::smallint), '{}'::smallint[]) into allergen_values
      from jsonb_array_elements_text(item->'allergens');
    if not (allergen_values <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14]::smallint[])
    then raise exception 'Invalid allergens' using errcode = '22023'; end if;
    image_name := coalesce(btrim(item->>'image'), '');
    if image_name <> '' then
      object_name := substr(image_name, char_length('restaurant-images/') + 1);
      if image_name not like 'restaurant-images/%'
        or split_part(object_name, '/', 1) <> p_restaurant_id::text
        or object_name !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
        or not public.can_manage_restaurant_image(object_name)
      then raise exception 'Invalid dish photo' using errcode = '22023'; end if;
      perform 1 from storage.objects where bucket_id = 'restaurant-images' and name = object_name for share;
      if not found then raise exception 'Dish photo upload not found' using errcode = '22023'; end if;
    else
      image_name := '';
    end if;
    insert into public.menu_items (menu_id, name, description, weight, price_cents, allergens, tag, image, position)
    values (target, btrim(item->>'name'), coalesce(item->>'description', ''), coalesce(item->>'weight', ''),
      (item->>'price_cents')::integer, allergen_values, coalesce(item->>'tag', ''), image_name, item_position);
    item_position := item_position + 1;
  end loop;
  return target;
end;
$$;

commit;
