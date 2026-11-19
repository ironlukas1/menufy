# menufy

Prototype of the Menufy app (React 19 + Vite 8 + Tailwind 4 + Leaflet).

- `app/` – the runnable prototype
- `design/` – Figma Make scaffold (design reference)
- `docs/` – functional specification

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| Node.js | 22.12+ (or 20.19+) | Required by Vite 8 |
| pnpm | 9+ | Package manager (repo uses `pnpm-lock.yaml`) |
| Git | any | To clone the repo |
| Internet access | – | Map tiles (Leaflet) are loaded online |

A modern browser (Chrome, Firefox, Safari, Edge) is needed to view the prototype.

## Windows

1. Install Node.js and Git (PowerShell):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   winget install Git.Git
   ```
   Alternatively, download the installers from <https://nodejs.org> and <https://git-scm.com>.
2. Close and reopen PowerShell, then enable pnpm:
   ```powershell
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
   If `corepack enable` fails with a permissions error, run PowerShell as Administrator, or use `npm install -g pnpm` instead.
3. Clone and run:
   ```powershell
   git clone https://github.com/ironlukas1/menufy.git menufy
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
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
   Alternatively, `brew install pnpm`.
2. Clone and run:
   ```bash
   git clone https://github.com/ironlukas1/menufy.git menufy
   cd menufy/app
   pnpm install
   pnpm dev
   ```
3. Open <http://localhost:5173>.

## Verify installation

```bash
node -v    # v22.12.0 or newer
pnpm -v    # 9.x or newer
```

## Scripts (run inside `app/`)

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Type-check and build to `app/dist` |
| `pnpm preview` | Serve the production build locally |

## Troubleshooting

- **Port 5173 in use** – Vite picks the next free port; use the URL printed in the terminal.
- **`pnpm` not found** – reopen the terminal after installing Node, then repeat the `corepack` step.
- **Map is blank** – check the internet connection (tiles load from an online provider).
- **Install errors after switching Node version** – delete `app/node_modules` and run `pnpm install` again.

## Backend API

The backend is a separate Next.js App Router service in `backend/`. Keeping it separate preserves the Vite and Capacitor frontend while giving the project server-side API routes that can later connect to Supabase.

Run the backend in a second terminal:

```bash
cd backend
pnpm install
pnpm dev
```

The backend runs on <http://localhost:3001>. The Vite dev server proxies `/api/*` requests to it, so frontend requests can use same-origin paths such as `/api/v1/health`. The initial health endpoint is <http://localhost:3001/api/v1/health>.

Keep database access behind server-side modules and call those modules from Route Handlers. When Supabase is added, keep secret keys in backend environment variables and never expose them with a `NEXT_PUBLIC_` prefix. Use the publishable key for user-scoped access; reserve the secret key for trusted admin operations because it bypasses row-level security. Use `backend/.env.example` as the starting point for local configuration.

Production deployment builds the backend from `backend/` and routes `/api/*` through Nginx to the Next.js service. Set `MENUFY_CORS_ORIGINS` in the deployment environment if a native Capacitor build will call the API directly from an origin beyond the defaults in `backend/src/server/http/cors.ts`.

## Android APK

The Android app is a Capacitor wrapper around the same web build, so it must be rebuilt whenever the web app changes. The APK bundles `app/dist` inside `assets/public`, which means it runs without the Vite dev server (data still comes from Supabase over the network).

Requirements: Node 22.12+, pnpm, JDK 17+ and the Android SDK (`ANDROID_HOME` set, or `app/android/local.properties` pointing at the SDK).

### Local build

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File app\scripts\build-apk.ps1
```

The script installs dependencies, builds the web app, runs `cap sync android`, builds a debug APK and copies it next to the old APK as `Menufy-v1.0.1-debug.apk` (one folder above the checkout; use `-OutputDir` to change it). The old `Menufy-debug.apk` is not modified.

### Build in CI

`.github/workflows/android.yml` builds the same APK on every push to `main` that touches `app/`, and on manual dispatch. It uses the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` repository secrets.

Each successful run publishes the APK to the rolling `android-latest` release, so the phone can download the file directly (no zip to extract):

```
https://github.com/<owner>/<repo>/releases/download/android-latest/Menufy-v1.0.1-debug.apk
```

Open that link on the phone, allow "install unknown apps" for the browser, and install. It installs over any earlier debug build of `sk.menufy.app`.

### Notes

- The shipped `Menufy-debug.apk` was packaged without the web bundle, so it opens a blank screen. Both build paths above verify that `assets/public/assets/index-*.js` exists before packaging.
- The app boots even when `VITE_SUPABASE_*` was not set at build time: it logs an error and shows the bundled prototype restaurants instead of a white screen. Real data and login need those variables (CI reads them from repository secrets, local builds from `app/.env.local`).
- Version is `1.0.1` (`versionCode 2`) in `app/android/app/build.gradle`; bump it for each new sideloaded build.
- Debug builds are signed with the local debug key, so installing `1.0.1` over the old debug build works as an update of `sk.menufy.app`.

## Design scaffold (optional)

`design/` is a separate Vite project (Figma Make export). Same steps, from the `design` folder:
```bash
cd design
pnpm install
pnpm dev
```
