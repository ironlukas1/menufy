import { requireRole } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { ok, parseQuery, preflight, route } from "@/lib/http";
import { adminListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/admin/restaurants?status=pending – approval queue. Admin only. */
export const GET = route(async (req) => {
  requireRole(req, "admin");
  const { status } = await parseQuery(req, adminListQuerySchema);
  const restaurants = await getRepositories().restaurants.listByStatus(status);
  return ok(restaurants, { meta: { status, count: restaurants.length } });
});
