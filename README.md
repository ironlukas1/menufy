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

To connect an existing Supabase project, copy `backend/.env.example` to `backend/.env.local` and set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (a publishable or legacy anon key), and `SUPABASE_HEALTH_TABLE` (an existing table in the public schema). Restart the backend, then check `/api/v1/health/database` through Vite, or `http://localhost:3001/api/v1/health/database` directly. This endpoint makes a read-only HEAD query and returns no row contents. Missing configuration or a failed query returns HTTP 503; a successful query returns HTTP 200. Row-level security still applies, so a successful check confirms query access, not that every row is visible.

Database access lives in `backend/src/server/db/supabase.ts`, which is restricted to server imports. The current client uses the anonymous database role; authenticated queries need the user's session added separately. Keep secret keys out of the frontend. This connection does not migrate data or replace the frontend's mock restaurant data.

Production deployment builds the backend from `backend/` and routes `/api/*` through Nginx to the Next.js service. Set `MENUFY_CORS_ORIGINS` in the deployment environment if a native Capacitor build will call the API directly from an origin beyond the defaults in `backend/src/server/http/cors.ts`.

## Design scaffold (optional)

`design/` is a separate Vite project (Figma Make export). Same steps, from the `design` folder:
```bash
cd design
pnpm install
pnpm dev
```

## Member restaurant reviews

Apply [`supabase/member_reviews.sql`](supabase/member_reviews.sql) in the Supabase SQL editor after the initial backend schema. It preserves imported reviews, links new reviews to the authenticated account, and allows one review per member per restaurant. Row-level security permits authenticated members to insert only their own reviews for active restaurants; database constraints validate ratings and text lengths.

Restaurant detail pages read reviews from Supabase. Guests can read reviews and follow a sign-in link back to the restaurant. Members can publish a 1–5 star rating under their account name (or “Člen menufy” if the account has no name) with a review of 10–2,000 characters. Successful submissions appear immediately and persist after reload; failed submissions keep the form contents for retrying.

To verify after applying the SQL: open a restaurant as a guest and check the sign-in prompt, sign in and publish a review, then reload and check that the review and community average persist. A second review from the same member for that restaurant must be rejected. An anonymous insert or an insert with another member's user ID must be rejected by the database.

Usernames are saved by signup and account settings in Supabase Auth `user_metadata.display_name`. No additional column, table, or SQL migration is needed for usernames. Existing members can set their name under Settings → Account. New reviews store the account name at the time of posting; changing the name does not rename older reviews.

## Restaurant owner portal

The **Vlastníš reštauráciu?** navigation entry opens `/owners`. Guests can register an owner account; existing members can use their current account. The owner signup marker in Auth metadata does not grant permissions. A successful restaurant submission atomically creates a pending restaurant and links it to the signed-in owner.

Apply [`supabase/owner_portal.sql`](supabase/owner_portal.sql) in the Supabase SQL editor after the initial backend schema and `supabase/user_data.sql`. The migration can be run again. It adds transactional functions for submission, menu saving, and approval, and restricts direct restaurant/menu writes so owners cannot approve themselves. It also replaces the initial menu read policies so pending restaurants and drafts remain private. Existing custom code that writes directly to those tables as an authenticated user must use these functions instead; service-role access is unchanged.

To designate a trusted approval administrator, run this once in the Supabase SQL editor using the email of an existing account:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

Only designate an account you trust to approve restaurants. Refresh `/owners`: admins see an approval queue and can approve or reject applications. Only approved restaurants appear publicly. Owners can prepare daily menus by date or one standard menu, with prices, descriptions, weights, tags, and allergens. They can save drafts before approval and publish after approval. Saving a published menu as a draft withdraws it from public view. Menu replacements are atomic, so a failed save preserves the previous menu.

Public browsing, search, map, saved restaurants, and detail pages include approved owner-submitted restaurants alongside the prototype data. Owner-submitted restaurants use their published menus for the four displayed calendar dates; drafts are never used as a public fallback. Focus the app or reload to fetch newly approved restaurants; approval and publishing in the portal also refresh public data.

Verification: the frontend test command covers price parsing and calendar dates. [`supabase/tests/owner_portal.sql`](supabase/tests/owner_portal.sql) tests ownership, anonymous access, self-approval prevention, admin approval, draft privacy, publishing, validation rollback, and unpublishing. Run it only in a disposable PostgreSQL/Supabase database with the initial schema and owner migration installed (e.g. `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/owner_portal.sql`). Test rows are rolled back.

## Restaurant settings and photos

Owners can switch between **Menu** and **Nastavenia reštaurácie** in `/owners`. Settings cover the restaurant name, description, cuisine, contacts, website, map position, opening hours, delivery, and cover photo. IČO and approval status cannot be changed through this form. Switching sections or restaurants prompts before discarding unsaved changes.

Apply [`supabase/restaurant_settings.sql`](supabase/restaurant_settings.sql) in the Supabase SQL editor after `owner_portal.sql`. It creates the `restaurant-images` public Storage bucket (JPEG, PNG, WebP; maximum 5 MB), restricts uploads to each manager's restaurant folder, and adds the validated `update_owned_restaurant` function. No service-role key is needed in the frontend. Profile edits preserve the existing approval status and URL slug.

Then apply [`supabase/restaurant_delivery.sql`](supabase/restaurant_delivery.sql) and reload the app. Owners can save optional Wolt, Bolt Food, and Bistro.sk restaurant links in Settings → Donáška. The migration adds validated `delivery_links` and updates the profile-save function; reapply it if you rerun `restaurant_settings.sql`. Only HTTPS links on the selected provider's domain are accepted. Disabling delivery hides the links while preserving them for later. Delivery estimates are not displayed or entered in owner settings; guests follow the ordering links to the provider. This feature does not fetch Wolt estimates or require Wolt credentials. Run [`supabase/tests/restaurant_delivery.sql`](supabase/tests/restaurant_delivery.sql) only in a disposable database after these migrations.

For existing projects with missing photo storage or a removed `restaurants.initials` column, run [`supabase/repair_restaurant_photos.sql`](supabase/repair_restaurant_photos.sql) after `owner_portal.sql`. This combined, repeatable repair creates/configures the photo bucket, restores owner-only Storage policies, and installs current profile and delivery saving without depending on `initials`. Existing photos are retained. Reload the app after applying it.

Selecting a photo shows a local preview; uploading and profile changes happen when **Uložiť nastavenia** is pressed. Photos in this bucket are publicly accessible, including photos uploaded for a restaurant still awaiting approval. The photo path is stored in the existing `restaurants.image` field, and the frontend resolves it to a public URL for cards, the profile banner, and the gallery when no separate gallery exists. Imported image URLs still work. Replacement uploads use unique filenames; cleanup can remove unused uploads but cannot delete the current profile photo.

Validation includes `app/src/data/restaurantSettings.test.ts` and [`supabase/tests/restaurant_settings.sql`](supabase/tests/restaurant_settings.sql). Run the SQL tests only in a disposable database with the initial schema and both owner migrations installed. They check profile ownership, protected fields, hours and URL validation, image access, and photo cleanup. Supabase Storage's file-size and MIME restrictions are enforced by its upload API; the local SQL tests verify the bucket configuration and row policies.

## Live Google Maps ratings

Google ratings load on restaurant detail pages through `/api/v1/restaurants/:slug/google-rating`. The backend calls Places API (New) for only the selected restaurant; it requests the rating, count, business name, Maps link, and provider attributions, without fetching review text or photos. Responses and provider fetches use `no-store`; Google rating values are not written to Supabase or browser storage. Google Place IDs are stored in `restaurants.google_place_id`.

Setup:

1. Apply [`supabase/google_ratings.sql`](supabase/google_ratings.sql) after `owner_portal.sql` and `member_reviews.sql`.
2. In a billing-enabled Google Cloud project, enable **Places API (New)** and create a server key restricted to that API. Set `GOOGLE_PLACES_API_KEY` in `backend/.env.local`, then restart the backend. In deployment, set it in the Compose environment. Keep it out of frontend environment variables. Configure provider quotas in Google Cloud; this server also limits requests to 30 per minute per process (not a distributed quota).
3. In the restaurant's **Nastavenia reštaurácie → Hodnotenie z Google Maps**, find and save its exact Google Place ID. This is a separate save action. Owners can edit their own linkage; admins can link any restaurant through the SQL RPC. Existing restaurants can also be linked in the SQL editor with `update public.restaurants set google_place_id = 'VERIFIED_PLACE_ID' where slug = 'RESTAURANT_SLUG';`.

Use the official [Place ID finder](https://developers.google.com/maps/documentation/places/web-service/place-id#find-id) to identify the correct branch. No automatic name matching is performed, so prototype business names are not accidentally assigned another business's ratings.

The public rating block shows Google Maps attribution, a link to the exact listing, optional provider attributions, and a review-policy link. Missing configuration, unlinked restaurants, unrated places, and provider failures have separate empty states, with no sample-score fallback. Card ratings, sorting, and filters use actual member reviews only; map pins use restaurant initials. Google ratings are displayed on the detail page, where the app does not render its OpenStreetMap panel. These display and storage choices follow Google's [Places attribution policies](https://developers.google.com/maps/documentation/places/web-service/policies) and [EEA integration guidance](https://developers.google.com/maps/comms/eea/faq).

Verify with the backend test command (`cd backend && pnpm test`) and [`supabase/tests/google_ratings.sql`](supabase/tests/google_ratings.sql) in a disposable database. Unit tests use stub provider responses; live verification requires a configured Google key and a linked, approved restaurant. The route returns HTTP 503 with `NOT_CONFIGURED` until the key is set.
