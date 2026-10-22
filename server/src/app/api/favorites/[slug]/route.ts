import { requireUser } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { notFound, ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** POST /api/favorites/[slug] – add a favourite. */
export const POST = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  const user = requireUser(req);
  const changed = await getRepositories().favorites.add(user.id, user.email, slug);
  if (!changed) throw notFound("Reštaurácia sa nenašla.");
  return ok({ slug, favorite: true });
});

/** DELETE /api/favorites/[slug] – remove a favourite. */
export const DELETE = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  const user = requireUser(req);
  const changed = await getRepositories().favorites.remove(user.id, user.email, slug);
  if (!changed) throw notFound("Reštaurácia sa nenašla.");
  return ok({ slug, favorite: false });
});
