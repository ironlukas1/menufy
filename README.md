# menufy

Prototype of the Menufy app (React 19 + Vite 8 + Tailwind 4 + Leaflet) with a
Next.js API backend.

- `app/` – the visitor PWA (Vite + React, also the Capacitor shell)
- `server/` – the API (Next.js App Router route handlers, port `3001`)
- `design/` – Figma Make scaffold (design reference)
- `docs/` – functional specification

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| Node.js | 22.12+ (or 20.19+) | Required by Vite 8 |
| pnpm | 10.x | Package manager (repo uses `pnpm-lock.yaml`) |
| Git | any | To clone the repo |
| Internet access | – | Map tiles (Leaflet) are loaded online |

A modern browser (Chrome, Firefox, Safari, Edge) is needed to view the prototype.

## Quick start (app + API)

Run two terminals from the repo root:

```bash
# terminal 1 – API on http://localhost:3001
cd server
pnpm install
cp .env.example .env.local   # optional, defaults work
pnpm dev

# terminal 2 – PWA on http://localhost:5173
cd app
pnpm install
pnpm dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api/*` to the
Next.js server (see `app/vite.config.ts`), so the browser uses a single origin.

If the API is not running, the PWA automatically falls back to the bundled
prototype data in `app/src/data/restaurants.ts`, so the UI remains demoable
offline. The "Prototyp" panel (bottom right) shows whether live API data is in
use.

The API works without any database: `MENUFY_DATA_SOURCE=memory` seeds an
in-memory store from the prototype data. Writes (menus, favourites,
registration) are lost when the server restarts. See `server/README.md` for the
endpoint list and the Supabase switch.

## Windows

1. Install Node.js and Git (PowerShell):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   winget install Git.Git
   ```
   Alternatively, download the installers from <https://nodejs.org> and <https://git-scm.com>.
2. Close and reopen PowerShell, then install pnpm:
   ```powershell
   npm install -g pnpm@10
   ```
   Node 25+ no longer bundles Corepack, so `npm install -g pnpm` is the reliable route. On older Node versions `corepack enable` still works. If npm reports a permissions error, run PowerShell as Administrator (or use `npx pnpm@10` without installing).
3. Clone and run:
   ```powershell
   git clone <repo-url> menufy
   cd menufy\app
   pnpm install
   pnpm dev
   ```
4. Open <http://localhost:5173>.

If PowerShell blocks scripts (`running scripts is disabled`), run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## macOS

1. Install [Homebrew](https://brew.sh) if missing, then:
   ```bash
   brew install node git
   npm install -g pnpm@10
   ```
   Alternatively, `brew install pnpm`. Node 25+ no longer bundles Corepack, so use npm (or `npx pnpm@10`) if `corepack` is missing.
2. Clone and run:
   ```bash
   git clone <repo-url> menufy
   cd menufy/app
   pnpm install
   pnpm dev
   ```
3. Open <http://localhost:5173>.

## Verify installation

```bash
node -v    # v22.12.0 or newer
pnpm -v    # 10.x
```

## Scripts (run inside `app/`)

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Type-check and build to `app/dist` |
| `pnpm preview` | Serve the production build locally |

## Scripts (run inside `server/`)

| Command | What it does |
|---|---|
| `pnpm dev` | Start the API on <http://localhost:3001> |
| `pnpm build` | Production build (route handlers + type check) |
| `pnpm start` | Serve the production build on port 3001 |
| `pnpm typecheck` | `tsc --noEmit` |

## Backend

The API is API-only Next.js (App Router route handlers) and lives behind a
repository seam, so the storage engine can change without touching the routes:

```
server/src/app/api/...            HTTP routes (validation, auth, CORS)
server/src/lib/data/types.ts      Repository interfaces + DTO contract
server/src/lib/data/memory/       Default in-memory backend (seeded)
server/src/lib/data/supabase/     Supabase backend (reference implementation)
server/supabase/migrations/       SQL schema for Supabase/PostgreSQL
```

Useful endpoints (full list in `server/README.md`):

| Method + path | Purpose |
|---|---|
| `GET /api/restaurants?q=&type=&day=&maxPrice=&exclude=` | Search/filter restaurants and their day menu |
| `GET /api/restaurants/[slug]` | Restaurant detail |
| `POST /api/restaurants/[slug]/menus` | Create/replace a daily menu (manager) |
| `POST /api/menus/import` | Paste text → draft menu items (manager) |
| `GET/POST/DELETE /api/favorites[...]` | Current user's favourites |
| `GET /api/notifications` | Notices for the current user |
| `GET /api/health` | Liveness + active data source |

Dev auth is stubbed: the server accepts `X-Menufy-User: <email>` (or
`MENUFY_DEV_USER`). Write endpoints need a manager/admin address
(`obed@bistromlyn.sk`, `admin@menufy.sk` by default). Replace
`server/src/lib/auth.ts` with Supabase Auth before production.

### Supabase later

1. Create a Supabase project and run `server/supabase/migrations/0001_init.sql`.
2. Copy the project URL and service-role key into `server/.env.local`.
3. Set `MENUFY_DATA_SOURCE=supabase` and restart the API.
4. Load the demo data with `cd server && pnpm seed:supabase`.

No route or frontend change is needed. Details and current caveats:
`server/README.md` and `server/supabase/README.md`.

The PWA's browser-side Supabase client (`app/src/api/supabase.ts`) uses
`VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` from `app/.env.local`; the
publishable key is safe to ship, the secret/service-role key never leaves
`server/`.

## Troubleshooting

- **Port 5173 in use** – Vite picks the next free port; use the URL printed in the terminal.
- **Port 3001 in use** – another API instance is running; stop it or start with `pnpm dev -- --port 3002` and set `VITE_API_PROXY_TARGET=http://localhost:3002` in `app/.env.local`.
- **`pnpm` not found** – install it with `npm install -g pnpm@10` and reopen the terminal. Node 25+ no longer bundles Corepack, so the old `corepack enable` step is not available there.
- **"API nedostupné" in the Prototyp panel** – the Next.js server is not running. The PWA falls back to bundled data; start `server/` and click "skúsiť znova".
- **Map is blank** – check the internet connection (tiles load from an online provider).
- **Install errors after switching Node version** – delete `app/node_modules` (or `server/node_modules`) and run `pnpm install` again.
- **Changes disappear after restarting the API** – expected with `MENUFY_DATA_SOURCE=memory`. Configure Supabase for persistence.

## Deployment

`app/` builds to static files (`app/dist`) and can be served by nginx or any
static host. `server/` is a separate Node process:

```bash
cd server && pnpm install && pnpm build && pnpm start   # port 3001
```

The production web server must forward `/api/*` to that process, or you can set
`VITE_API_URL` at build time to an absolute API origin (required for Capacitor):

```bash
cd app && VITE_API_URL=https://api.menufy.example pnpm build
```

For the nginx setup in `deploy/`, add a proxy block:

```nginx
location /api/ {
    proxy_pass http://menufy-api:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Design scaffold (optional)

`design/` is a separate Vite project (Figma Make export). Same steps, from the `design` folder:
```bash
cd design
pnpm install
pnpm dev
```
