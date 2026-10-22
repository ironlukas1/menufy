# menufy API (`server/`)

API-only Next.js app (App Router route handlers, TypeScript, Zod). It serves the
Vite PWA in `../app` and is the future target for the Capacitor builds.

- Port: **3001** (the Vite dev server proxies `/api` there)
- No UI, no server-rendered pages – only JSON under `/api/*`
- Data access is behind repository interfaces so the storage can change

## Quick start

```bash
pnpm install
cp .env.example .env.local   # optional; defaults work
pnpm dev                     # http://localhost:3001
```

Check it:

```bash
curl http://localhost:3001/api/health
curl "http://localhost:3001/api/restaurants?q=bistr%20mlin"
```

Opening <http://localhost:3001> in a browser now returns a small JSON index of the
API. There is no UI here — the app is at <http://localhost:5173>.

### Testing from a phone

Open the PWA (not the API) from the phone:

```bash
cd app
pnpm dev -- --host
```

Then visit `http://<laptop-LAN-IP>:5173` on the phone. Vite proxies `/api` to this
server, so no CORS or `VITE_API_URL` change is needed. Opening `:3001` directly
from another device can trigger Next's "Blocked cross-origin request to
/_next/hmr" dev warning; it does not affect the API (add the hostname to
`allowedDevOrigins` in `next.config.ts` only if you want Next dev HMR there).

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `MENUFY_DATA_SOURCE` | `memory` | `memory` or `supabase` |
| `SUPABASE_URL` | – | Project URL (required for `supabase`) |
| `SUPABASE_SERVICE_ROLE_KEY` | – | Server-only key (required for `supabase`) |
| `MENUFY_DEV_USER` | `zuzana@example.sk` | Identity when no header is sent |
| `MENUFY_ADMIN_EMAILS` | `admin@menufy.sk` | Comma-separated admin addresses |
| `MENUFY_MANAGER_EMAILS` | `obed@bistromlyn.sk` | Comma-separated manager addresses |
| `CORS_ORIGINS` | Vite + Capacitor origins | Comma-separated allowed origins |

### Data sources

- **memory** (default) – seeded from the prototype data in
  `src/lib/data/seed/*.json`, generated from
  `app/src/data/restaurants.ts` + `notifications.ts`. Everything lives in the
  process: restarts/rebuilds reset written data. Menu dates are computed relative
  to "today", so the demo always has a current menu.
- **supabase** – PostgreSQL via `@supabase/supabase-js` with the service-role
  key. See [`supabase/README.md`](./supabase/README.md).

Business rules (day-slot mapping, typo-tolerant search, filters, DTO
composition) live in `src/lib/data/presentation.ts` and are shared by both
backends.

## Endpoints

All responses use `{ "data": ..., "meta"?: ... }`. Errors use
`{ "error": { "code", "message", "details"? } }` with proper HTTP status codes.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | – | JSON index of the API (no UI here) |
| `GET` | `/api/health` | – | Liveness, version, active data source |
| `GET` | `/api/types` | – | Cuisines, cities/districts, allergens, day slots |
| `GET` | `/api/me` | user | Current identity + role |
| `GET` | `/api/restaurants` | – | List/search restaurants for a day slot |
| `POST` | `/api/restaurants` | – | Restaurant registration (creates `pending`) |
| `GET` | `/api/restaurants/[slug]` | – | Detail (profile, 4-day menus, reviews) |
| `GET` | `/api/restaurants/[slug]/menus?from=&to=` | – | Daily menus in a date range |
| `POST` | `/api/restaurants/[slug]/menus` | manager/admin | Create/replace one day's menu |
| `PATCH` | `/api/menus/[id]` | manager/admin | Edit items, publish/unpublish |
| `POST` | `/api/menus/import` | manager/admin | Text → draft items (no auto-publish) |
| `GET` | `/api/favorites` | user | Favourite slugs |
| `POST` | `/api/favorites/[slug]` | user | Add favourite |
| `DELETE` | `/api/favorites/[slug]` | user | Remove favourite |
| `GET` | `/api/notifications` | user | Notices + read state |
| `POST` | `/api/notifications/[id]/read` | user | Mark notice read |
| `GET` | `/api/admin/restaurants?status=pending` | admin | Approval queue |
| `PATCH` | `/api/admin/restaurants/[slug]` | admin | Set `pending` / `active` / `hidden` |

### `GET /api/restaurants` query parameters

| Param | Values | Default | Notes |
|---|---|---|---|
| `q` | text | – | Diacritics-insensitive, typo tolerant (`tratoria` → Trattoria Ponte); matches restaurant names and dish names |
| `day` | `0`–`3` | `0` | 0 = today, 1 = tomorrow, 2 = next Monday, 3 = next Tuesday (Europe/Bratislava) |
| `type` | cuisine name(s) | – | Repeatable or comma separated |
| `city`, `district` | text | – | Exact match |
| `exclude` | allergen numbers | – | e.g. `?exclude=1,7` |
| `maxPrice` | number (€) | – | At least one item must fit |
| `minRating` | 0–5 | `0` | |
| `delivery` | `true` / `1` | off | Only restaurants with delivery |
| `sort` | `rating` / `price` / `distance` | `rating` | |
| `lat`, `lng` | coordinates | Bratislava centre | Used for `distance` |
| `limit`, `offset` | 1–50, ≥0 | 50, 0 | Pagination |

Restaurants without a menu for the selected day are omitted (spec FR-01).

### Example

```bash
curl "http://localhost:3001/api/restaurants?day=0&type=Talianska&maxPrice=9&exclude=7"
curl -X POST http://localhost:3001/api/restaurants/bistro-mlyn/menus \
  -H 'Content-Type: application/json' \
  -H 'X-Menufy-User: obed@bistromlyn.sk' \
  -d '{"date":"2026-10-22","status":"published","items":[{"name":"Rezeň","price":8.5,"allergens":[1,3]}]}'
```

## Auth (development stub)

`src/lib/auth.ts` resolves the caller from `X-Menufy-User: <email>` or
`MENUFY_DEV_USER`; there is no password/token yet. Roles come from
`MENUFY_ADMIN_EMAILS` / `MENUFY_MANAGER_EMAILS`.

This is intentionally insecure and must be replaced before production. The file
contains the exact Supabase Auth replacement (`auth.getUser(token)` +
`app_metadata.role`) and routes depend only on the `CurrentUser` shape.

## Supabase

See [`supabase/README.md`](./supabase/README.md). Short version:

1. Run `supabase/migrations/0001_init.sql` in your project (and `reset.sql`
   first if the project already has half-applied tables).
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and
   `MENUFY_DATA_SOURCE=supabase` in `.env.local`.
3. Seed the demo data: `pnpm seed:supabase` (idempotent, safe to re-run).
4. Restart the API.

> The Supabase repositories have been smoke-tested against a live project
> (list/detail reads, menu writes, favourites). Re-run the endpoint checks after
> changing the schema.

## CORS

Handled explicitly in `src/lib/http.ts` (including `OPTIONS` preflight), because
the API is consumed by the Vite dev server and the Capacitor webview. Add your
production origin to `CORS_ORIGINS`. Every route exports
`OPTIONS = preflight` and is wrapped by `route()`, which also maps validation
and unexpected errors to JSON.

## Layout

```
src/app/api/                 route handlers
src/lib/http.ts              response envelope, CORS, parsers, errors
src/lib/auth.ts              dev auth stub (+ Supabase Auth notes)
src/lib/validation.ts        Zod schemas for every query/body
src/lib/dates.ts             day slots <-> real dates (Europe/Bratislava)
src/lib/search.ts            diacritics + typo-tolerant matching
src/lib/menu-parser.ts       pasted text -> draft items
src/lib/data/types.ts        repository + DTO contract
src/lib/data/presentation.ts shared filtering/sorting/DTO composition
src/lib/data/memory/         default backend
src/lib/data/supabase/       Supabase backend
supabase/migrations/         PostgreSQL schema
```

## Checks

```bash
pnpm typecheck
pnpm build
```
