-- Run after the initial backend schema. Existing imported reviews remain readable.
begin;

alter table public.restaurant_reviews
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- One review per member and restaurant. Imported reviews have no member account.
create unique index if not exists restaurant_reviews_member_unique_idx
  on public.restaurant_reviews (restaurant_id, user_id) where user_id is not null;

alter table public.restaurant_reviews
  drop constraint if exists restaurant_reviews_member_content_check;
alter table public.restaurant_reviews
  add constraint restaurant_reviews_member_content_check check (
    user_id is null or (
      char_length(btrim(author)) between 2 and 60
      and char_length(btrim(body)) between 10 and 2000
    )
  );

alter table public.restaurant_reviews enable row level security;
grant select on public.restaurant_reviews to anon, authenticated;
grant insert (restaurant_id, user_id, author, stars, reviewed_on, body)
  on public.restaurant_reviews to authenticated;

drop policy if exists "members add own reviews" on public.restaurant_reviews;
create policy "members add own reviews" on public.restaurant_reviews
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and stars between 1 and 5
    and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.status = 'active'
    )
  );

commit;
