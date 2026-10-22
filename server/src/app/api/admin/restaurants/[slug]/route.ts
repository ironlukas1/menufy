import { requireRole } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { notFound, ok, parseBody, preflight, route } from "@/lib/http";
import { restaurantStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** PATCH /api/admin/restaurants/[slug] – approve / hide a restaurant (FR-07). */
export const PATCH = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  requireRole(req, "admin");
  const { status } = await parseBody(req, restaurantStatusSchema);

  const restaurant = await getRepositories().restaurants.updateStatus(slug, status);
  if (!restaurant) throw notFound("Reštaurácia sa nenašla.");
  return ok({ slug: restaurant.slug, status: restaurant.status });
});
