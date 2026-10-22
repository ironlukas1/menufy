import { requireUser } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/notifications – notices for the current user (+ broadcasts). */
export const GET = route(async (req) => {
  const user = requireUser(req);
  const notices = await getRepositories().notifications.list(user.id, user.email);
  return ok(notices, { meta: { unread: notices.filter((notice) => !notice.read).length } });
});
