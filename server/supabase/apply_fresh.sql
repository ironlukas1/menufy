-- Menufy – fresh schema apply (reset + init) in one transaction.
-- Paste this whole file into the Supabase SQL editor and press Run.

begin;

-- ---------------------------------------------------------------------------
-- DEV ONLY – wipe every Menufy table so 0001_init.sql can be applied from
-- scratch. Use this on a project whose schema was left half-applied (or whose
-- placeholder tables have the wrong shape). It deletes all rows in these
-- tables; there is no undo.
-- ---------------------------------------------------------------------------

drop table if exists
  public.notification_reads,
  public.notifications,
  public.favorites,
  public.restaurant_users,
  public.menu_items,
  public.menus,
  public.restaurant_reviews,
  public.restaurant_type_links,
  public.restaurant_types,
  public.profiles,
  public.restaurants
cascade;

-- Left over from earlier runs; recreated by 0001_init.sql.
drop trigger if exists on_auth_user_created on auth.users;

-- ---------------------------------------------------------------------------
-- Menufy – initial schema (Supabase / PostgreSQL 15+)
--
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- The Next.js server talks to these tables with the service-role key, so RLS is
-- not required for the API itself. Policies below are for the future case where
-- the PWA or a dashboard talks to Supabase directly.
-- ---------------------------------------------------------------------------

create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- unaccent() is stable, not immutable, so it cannot be used directly in a
-- generated column. This wrapper is the usual workaround.
create or replace function public.menufy_unaccent(value text)
returns text
language sql
immutable
parallel safe
as $$
  select public.unaccent('public.unaccent', coalesce(value, ''))
$$;

create or replace function public.menufy_search_key(value text)
returns text
language sql
immutable
parallel safe
as $$
  select lower(public.menufy_unaccent(coalesce(value, '')))
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- restaurants
create table public.restaurants (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  name_search        text generated always as (public.menufy_search_key(name)) stored,
  initials           text not null default '',
  tagline            text not null default '',
  ico                text,
  city               text not null,
  district           text not null default '',
  address            text not null default '',
  phone              text not null default '',
  email              text not null default '',
  web                text not null default '',
  rating             numeric(2,1) not null default 0 check (rating between 0 and 5),
  rating_count       integer not null default 0 check (rating_count >= 0),
  lat                double precision not null default 48.1486,
  lng                double precision not null default 17.1077,
  delivery_available boolean not null default false,
  delivery_eta       text not null default '',
  hours              jsonb not null default '[]'::jsonb,
  image              text not null default '',
  gallery            jsonb not null default '[]'::jsonb,
  status             text not null default 'pending'
                     check (status in ('pending', 'active', 'hidden')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index restaurants_name_search_idx on public.restaurants using gin (name_search gin_trgm_ops);
create index restaurants_status_city_idx on public.restaurants (status, city);

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------- types
create table public.restaurant_types (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text
);

create table public.restaurant_type_links (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  type_id       uuid not null references public.restaurant_types(id) on delete cascade,
  primary key (restaurant_id, type_id)
);

insert into public.restaurant_types (slug, name) values
  ('slovenska', 'Slovenská'),
  ('talianska', 'Talianska'),
  ('azijska', 'Ázijská'),
  ('veganska', 'Vegánska'),
  ('burger', 'Burger'),
  ('stredomorska', 'Stredomorská')
on conflict (slug) do nothing;

-- --------------------------------------------------------------- menus/items
create table public.menus (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  kind          text not null default 'daily' check (kind in ('daily', 'standard')),
  date          date,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  note          text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint menus_daily_requires_date check (kind <> 'daily' or date is not null)
);

-- One daily menu per restaurant and day; one standard menu per restaurant.
create unique index menus_daily_unique_idx on public.menus (restaurant_id, date) where kind = 'daily';
create unique index menus_standard_unique_idx on public.menus (restaurant_id) where kind = 'standard';
create index menus_date_idx on public.menus (date) where kind = 'daily';

create trigger menus_set_updated_at
before update on public.menus
for each row execute function public.set_updated_at();

create table public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  menu_id     uuid not null references public.menus(id) on delete cascade,
  name        text not null,
  description text not null default '',
  weight      text not null default '',
  price_cents integer not null check (price_cents >= 0),
  allergens   smallint[] not null default '{}',
  tag         text not null default '',
  position    integer not null default 0,
  constraint menu_items_allergens_range
    check (allergens <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14]::smallint[])
);

create index menu_items_menu_idx on public.menu_items (menu_id, position);

-- ------------------------------------------------------------------- reviews
create table public.restaurant_reviews (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  author        text not null,
  stars         smallint not null check (stars between 1 and 5),
  reviewed_on   text not null default '',
  body          text not null default '',
  created_at    timestamptz not null default now()
);

create index restaurant_reviews_restaurant_idx on public.restaurant_reviews (restaurant_id);

-- --------------------------------------------------------------------- users
-- Mirrors auth.users; created by the trigger below.
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  role              text not null default 'user' check (role in ('user', 'manager', 'admin')),
  push_subscription jsonb,
  created_at        timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.restaurant_users (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  role          text not null default 'owner' check (role in ('owner', 'editor')),
  primary key (user_id, restaurant_id)
);

create table public.favorites (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  notify        boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  -- null = broadcast to every user
  user_id         uuid references public.profiles(id) on delete cascade,
  kind            text not null default 'system' check (kind in ('menu', 'offer', 'system')),
  title           text not null,
  body            text not null default '',
  time_label      text not null default '',
  restaurant_slug text,
  created_at      timestamptz not null default now()
);

create index notifications_created_idx on public.notifications (created_at desc);

create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (notification_id, user_id)
);

-- ------------------------------------------------------------------------ RLS
alter table public.restaurants          enable row level security;
alter table public.restaurant_types     enable row level security;
alter table public.restaurant_type_links enable row level security;
alter table public.menus                enable row level security;
alter table public.menu_items           enable row level security;
alter table public.restaurant_reviews   enable row level security;
alter table public.profiles             enable row level security;
alter table public.restaurant_users     enable row level security;
alter table public.favorites            enable row level security;
alter table public.notifications        enable row level security;
alter table public.notification_reads   enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Helper: does the current user manage the given restaurant?
create or replace function public.manages_restaurant(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_users ru
    where ru.restaurant_id = target and ru.user_id = auth.uid()
  );
$$;

-- Public reads
create policy "public read active restaurants" on public.restaurants
  for select using (status = 'active');
create policy "public read restaurant types" on public.restaurant_types
  for select using (true);
create policy "public read restaurant type links" on public.restaurant_type_links
  for select using (true);
create policy "public read published daily menus" on public.menus
  for select using (
    status = 'published'
    or public.manages_restaurant(restaurant_id)
    or public.is_admin()
  );
create policy "public read items of visible menus" on public.menu_items
  for select using (
    exists (
      select 1 from public.menus m
      where m.id = menu_id
        and (m.status = 'published' or public.manages_restaurant(m.restaurant_id) or public.is_admin())
    )
  );
create policy "public read reviews" on public.restaurant_reviews
  for select using (true);

-- Restaurant registration (FR-05): anyone signed in may submit a pending profile.
create policy "authenticated can register restaurant" on public.restaurants
  for insert to authenticated
  with check (status = 'pending');

-- Managers edit their own restaurant; admins edit everything.
create policy "managers update own restaurant" on public.restaurants
  for update using (public.manages_restaurant(id) or public.is_admin())
  with check (public.manages_restaurant(id) or public.is_admin());

create policy "managers manage menus" on public.menus
  for all using (public.manages_restaurant(restaurant_id) or public.is_admin())
  with check (public.manages_restaurant(restaurant_id) or public.is_admin());

create policy "managers manage menu items" on public.menu_items
  for all using (
    exists (
      select 1 from public.menus m
      where m.id = menu_id and (public.manages_restaurant(m.restaurant_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.menus m
      where m.id = menu_id and (public.manages_restaurant(m.restaurant_id) or public.is_admin())
    )
  );

-- Users own their profile, favourites and notifications.
create policy "own profile" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "own restaurant links" on public.restaurant_users
  for select using (user_id = auth.uid() or public.is_admin());

create policy "own favorites" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own or broadcast notifications" on public.notifications
  for select using (user_id is null or user_id = auth.uid() or public.is_admin());

create policy "own notification reads" on public.notification_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
