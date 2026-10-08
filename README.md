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
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
   Alternatively, `brew install pnpm`.
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

## Design scaffold (optional)

`design/` is a separate Vite project (Figma Make export). Same steps, from the `design` folder:
```bash
cd design
pnpm install
pnpm dev
```
