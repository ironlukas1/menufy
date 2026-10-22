-- Run after the backend migration (feat/backend server/supabase/migrations/0001_init.sql), which owns
-- public.favorites (user_id -> profiles, restaurant_id -> restaurants) and the profiles trigger.

-- Accounts created before that migration have no profile row, so their favorites fail the FK.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  notify_daily boolean not null default true,
  notify_fav boolean not null default true,
  notify_promo boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

drop policy if exists "own preferences" on public.preferences;
create policy "own preferences" on public.preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
