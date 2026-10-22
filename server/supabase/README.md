# Supabase setup

The API can run on PostgreSQL/Supabase instead of the in-memory store. The
schema is in [`migrations/0001_init.sql`](./migrations/0001_init.sql).

## 1. Create the project

1. Create a project at <https://supabase.com/dashboard>.
2. Copy **Project URL** and the **service_role** key from
   *Project settings → API*.

> The service-role key bypasses Row Level Security. It belongs only in
> `server/.env.local`; never put it in `app/` or a mobile build.

## 2. Apply the schema

With the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
cd server
supabase link --project-ref <project-ref>
supabase db push
```

Or paste the files below into the SQL editor, **in this order**, and run each
one once:

1. `migrations/0001_init.sql` – creates the schema.

If the project is not empty and the schema was left half-applied (or placeholder
tables exist with the wrong columns), reset it first:

- `reset.sql` – **dev only**, drops every Menufy table (and the signup trigger)
  so the schema can be created from scratch.
- `apply_fresh.sql` – the two above combined in one transaction, for a single
  paste into the SQL editor.

> Applying the schema needs DDL rights: the SQL editor, `supabase db push`, or
> the Postgres connection string. The service-role/secret API key **cannot**
> create tables — it is only used by the running API to read and write rows.

What it creates:

| Table | Purpose |
|---|---|
| `restaurants` | Profiles, opening hours (`jsonb`), status `pending`/`active`/`hidden` |
| `restaurant_types`, `restaurant_type_links` | Cuisine filter (many-to-many) |
| `menus` | One row per restaurant and date (`kind = 'daily'`) + one `standard` menu |
| `menu_items` | Dishes; price stored as integer cents |
| `restaurant_reviews` | Demo reviews |
| `profiles` | Mirrors `auth.users`, holds the role |
| `restaurant_users` | Which manager owns which restaurant |
| `favorites`, `notifications`, `notification_reads` | Per-user data |

Also included:

- `pg_trgm` + `unaccent` search index (`name_search`) for typo-tolerant names.
- `handle_new_user()` trigger: creates a `profiles` row on Supabase signup.
- Updated-at triggers.
- RLS policies: public reads for active restaurants and published menus, owners
  edit their own data, users own their favourites/notifications.

## 3. Point the API at it

`server/.env.local`:

```dotenv
MENUFY_DATA_SOURCE=supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Restart the API. `GET /api/health` then reports `"dataSource": "supabase"`.

## 4. Seed + smoke test

Load the demo data used by the memory backend (8 restaurants, their daily and
standard menus, reviews and notices):

```bash
cd server
pnpm seed:supabase
```

The script is idempotent — it upserts restaurants by slug and replaces their
menus/reviews, so you can re-run it after schema changes. It talks to Supabase
with the service-role key from `.env.local`.

Then:

```bash
curl "http://localhost:3001/api/health"
curl "http://localhost:3001/api/restaurants"
curl "http://localhost:3001/api/restaurants/<slug>"
curl "http://localhost:3001/api/types"
curl "http://localhost:3001/api/favorites"
curl "http://localhost:3001/api/notifications"
```

Writes need a manager/admin address (`MENUFY_MANAGER_EMAILS` /
`MENUFY_ADMIN_EMAILS`) and a matching `profiles` row:

```bash
curl -X POST "http://localhost:3001/api/restaurants/<slug>/menus" \
  -H 'Content-Type: application/json' \
  -H 'X-Menufy-User: obed@bistromlyn.sk' \
  -d '{"date":"2026-10-22","status":"published","items":[{"name":"Rezeň","price":8.5}]}'
```

## Status / caveats

- The Supabase repositories in `src/lib/data/supabase/` have been smoke-tested
  against a live project (list/detail reads, menu writes, favourites) and are
  the supported backend when `MENUFY_DATA_SOURCE=supabase`.
- Favourites/notifications resolve the caller's email to a `profiles` row. In
  dev-auth mode that row must already exist (the demo emails are not created
  automatically).
- Prices are stored as `price_cents` integer; the API converts to/from euros.
- Menu dates are real dates. The UI's four day slots are mapped server-side
  (today, tomorrow, next Monday, next Tuesday) in
  `src/lib/dates.ts`.

## Moving from the dev auth stub to Supabase Auth

1. Sign users in from the PWA with `supabase.auth` (anon key).
2. Send the access token as `Authorization: Bearer <token>`.
3. In `server/src/lib/auth.ts`, replace the header stub with
   `supabase.auth.getUser(token)` as described in the file. Read the role from
   `app_metadata.role`.
4. Keep the `CurrentUser` shape; routes, repositories and the frontend do not
   change.
5. Remove `X-Menufy-User` and `MENUFY_DEV_USER` handling from production builds.
