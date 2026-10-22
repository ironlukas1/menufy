import { requireUser } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/favorites – slugs of the current user's favourite restaurants. */
export const GET = route(async (req) => {
  const user = requireUser(req);
  const slugs = await getRepositories().favorites.list(user.id, user.email);
  return ok(slugs, { meta: { count: slugs.length } });
});
