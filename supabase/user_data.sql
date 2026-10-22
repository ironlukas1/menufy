create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  restaurant_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_slug)
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  notify_daily boolean not null default true,
  notify_fav boolean not null default true,
  notify_promo boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.favorites enable row level security;
alter table public.preferences enable row level security;

drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "own preferences" on public.preferences;
create policy "own preferences" on public.preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
