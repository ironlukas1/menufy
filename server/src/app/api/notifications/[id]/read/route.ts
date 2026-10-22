import { requireUser } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { notFound, ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** POST /api/notifications/[id]/read – mark one notice as read. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const { id } = await params;
  const user = requireUser(req);
  const found = await getRepositories().notifications.markRead(user.id, user.email, id);
  if (!found) throw notFound("Upozornenie sa nenašlo.");
  return ok({ id, read: true });
});
