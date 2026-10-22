import { env } from "@/lib/env";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/**
 * The server is API-only, so `/` would otherwise be a bare 404. This index makes
 * the API discoverable when someone opens the port in a browser.
 * The visitor UI lives in `../app` (http://localhost:5173).
 */
export const GET = route(async () =>
  ok({
    service: "menufy-api",
    version: env.version,
    dataSource: env.dataSource,
    ui: "http://localhost:5173",
    docs: "server/README.md",
    endpoints: {
      health: "/api/health",
      catalog: "/api/types",
      restaurants: "/api/restaurants?q=&day=0",
      restaurant: "/api/restaurants/{slug}",
      menus: "/api/restaurants/{slug}/menus?from=&to=",
      menuImport: "POST /api/menus/import",
      favorites: "/api/favorites",
      notifications: "/api/notifications",
      me: "/api/me",
      admin: "/api/admin/restaurants?status=pending",
    },
  }),
);
