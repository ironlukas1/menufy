-- Run after owner_portal.sql and member_reviews.sql. Store Place IDs, never Google rating snapshots.
begin;
alter table public.restaurants add column if not exists google_place_id text;
alter table public.restaurants drop constraint if exists restaurants_google_place_id_check;
alter table public.restaurants add constraint restaurants_google_place_id_check
  check (google_place_id is null or google_place_id ~ '^[A-Za-z0-9_-]{10,255}$');

create or replace function public.set_restaurant_google_place(p_restaurant_id uuid, p_place_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare cleaned text := nullif(btrim(p_place_id),''); begin
  if auth.uid() is null or not (public.manages_restaurant(p_restaurant_id) or public.is_admin())
  then raise exception 'Restaurant access denied' using errcode = '42501'; end if;
  if cleaned is not null and cleaned !~ '^[A-Za-z0-9_-]{10,255}$'
  then raise exception 'Invalid Google Place ID' using errcode = '22023'; end if;
  update public.restaurants set google_place_id = cleaned where id = p_restaurant_id;
  if not found then raise exception 'Restaurant not found' using errcode = '22023'; end if;
end;
$$;
revoke all on function public.set_restaurant_google_place(uuid,text) from public, anon;
grant execute on function public.set_restaurant_google_place(uuid,text) to authenticated;

-- Browsing and map filters use our members' ratings, independently of Google content.
create or replace function public.restaurant_community_ratings()
returns table(slug text, rating numeric, rating_count bigint)
language sql stable security invoker set search_path = '' as $$
  select r.slug, round(avg(v.stars),1), count(*)
  from public.restaurants r join public.restaurant_reviews v on v.restaurant_id = r.id
  where r.status = 'active' and v.user_id is not null
  group by r.slug;
$$;
revoke all on function public.restaurant_community_ratings() from public;
grant execute on function public.restaurant_community_ratings() to anon, authenticated;
commit;
