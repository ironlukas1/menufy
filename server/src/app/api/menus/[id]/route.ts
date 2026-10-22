import { requireRole } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { notFound, ok, parseBody, preflight, route } from "@/lib/http";
import { menuPatchSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** PATCH /api/menus/[id] – edit items or publish/unpublish a menu. Manager/admin. */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const { id } = await params;
  requireRole(req, "manager", "admin");
  const patch = await parseBody(req, menuPatchSchema);

  const menu = await getRepositories().menus.update(id, patch);
  if (!menu) throw notFound("Menu sa nenašlo.");
  return ok(menu);
});
