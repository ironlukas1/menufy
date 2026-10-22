import { requireRole } from "@/lib/auth";
import { getRepositories } from "@/lib/data";
import { addDays, dateKey } from "@/lib/dates";
import { ApiError, notFound, ok, parseBody, parseQuery, preflight, route } from "@/lib/http";
import { menuRangeQuerySchema, menuUpsertSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/restaurants/[slug]/menus?from=&to= – daily menus in a date range. */
export const GET = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  const query = await parseQuery(req, menuRangeQuerySchema);
  const from = query.from ?? dateKey();
  const to = query.to ?? addDays(from, 6);
  if (to < from) throw new ApiError(422, "invalid_range", "Dátum „do“ musí byť po dátume „od“.");

  const restaurant = await getRepositories().restaurants.bySlug(slug);
  if (!restaurant) throw notFound("Reštaurácia sa nenašla.");

  const menus = await getRepositories().menus.listRange(slug, from, to);
  return ok(menus, { meta: { from, to, restaurant: restaurant.slug } });
});

/**
 * POST /api/restaurants/[slug]/menus
 * Create or replace the menu for one date and publish/draft it (FR-06).
 * Manager/admin only.
 *
 * TODO(supabase): also verify that the caller is linked to this restaurant in
 * `restaurant_users` (RLS does it automatically once the PWA uses Supabase Auth).
 */
export const POST = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  requireRole(req, "manager", "admin");
  const input = await parseBody(req, menuUpsertSchema);

  const restaurant = await getRepositories().restaurants.bySlug(slug);
  if (!restaurant) throw notFound("Reštaurácia sa nenašla.");

  const menu = await getRepositories().menus.upsert({ restaurantSlug: slug, ...input });
  return ok(menu, { status: 201 });
});
