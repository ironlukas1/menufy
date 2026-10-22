import { getRepositories } from "@/lib/data";
import { env } from "@/lib/env";
import { notFound, ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/restaurants/[slug] – profile, week menu and reviews. Public. */
export const GET = route<{ slug: string }>(async (_req, { params }) => {
  const { slug } = await params;
  const restaurant = await getRepositories().restaurants.bySlug(slug);
  if (!restaurant || restaurant.status !== "active") throw notFound("Reštaurácia sa nenašla.");
  return ok(restaurant, { meta: { dataSource: env.dataSource } });
});
