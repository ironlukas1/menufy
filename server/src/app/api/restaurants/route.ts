import { getRepositories } from "@/lib/data";
import type { DaySlot } from "@/lib/dates";
import { slotDate } from "@/lib/dates";
import { env } from "@/lib/env";
import { CITY_CENTER } from "@/lib/geo";
import { ApiError, ok, parseBody, parseQuery, preflight, route } from "@/lib/http";
import { restaurantCreateSchema, restaurantListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/**
 * GET /api/restaurants
 * Search by name (typo tolerant), filter by cuisine/allergens/price and return
 * the menu for the requested day slot. Public.
 */
export const GET = route(async (req) => {
  const query = await parseQuery(req, restaurantListQuerySchema);
  const day = query.day as DaySlot;

  const result = await getRepositories().restaurants.list({
    q: query.q,
    city: query.city,
    district: query.district,
    cuisines: query.type,
    excluded: query.exclude,
    maxPrice: query.maxPrice ?? null,
    delivery: query.delivery,
    minRating: query.minRating,
    day,
    sort: query.sort,
    limit: query.limit,
    offset: query.offset,
    origin: { lat: query.lat ?? CITY_CENTER.lat, lng: query.lng ?? CITY_CENTER.lng },
  });

  return ok(result.items, {
    meta: {
      total: result.total,
      limit: query.limit,
      offset: query.offset,
      day,
      date: slotDate(day),
      dataSource: env.dataSource,
    },
  });
});

/**
 * POST /api/restaurants
 * Restaurant registration (FR-05). Creates a `pending` profile that an admin
 * must approve before it appears in search. Public by design.
 */
export const POST = route(async (req) => {
  const input = await parseBody(req, restaurantCreateSchema);
  const created = await getRepositories().restaurants.create(input);
  if (!created) {
    throw new ApiError(409, "slug_taken", "Reštaurácia s týmto názvom alebo adresou už existuje.");
  }
  return ok(created, { status: 201 });
});
