import { DAY_SLOTS, hoursForToday, slotDate } from "../dates";
import { distanceKm, round1, round2 } from "../geo";
import { MATCH_THRESHOLD, matchScore } from "../search";
import type {
  MenuItem,
  MenuRecord,
  RestaurantDTO,
  RestaurantListFilter,
  RestaurantListResult,
  RestaurantRecord,
} from "./types";

const byPosition = (a: MenuItem, b: MenuItem) => a.position - b.position;

/**
 * Composition shared by every data source: stored profile + menus -> API shape.
 * Keeping it here means the memory and Supabase backends cannot drift apart.
 */
export function toRestaurantDTO(
  record: RestaurantRecord,
  menus: MenuRecord[],
  now: Date = new Date(),
  includeDrafts = false,
): RestaurantDTO {
  const dates = DAY_SLOTS.map((slot) => slotDate(slot, now));
  const byDate = new Map(menus.filter((menu) => menu.date).map((menu) => [menu.date, menu]));

  const daily = dates.map((date) => {
    const menu = byDate.get(date);
    if (!menu) return [];
    if (!includeDrafts && menu.status !== "published") return [];
    return [...menu.items].sort(byPosition);
  });

  const todayMenu = byDate.get(dates[0]);
  const publishedToday = todayMenu && todayMenu.status === "published" ? todayMenu : null;
  const avgPrice = daily[0].length
    ? round2(daily[0].reduce((sum, item) => sum + item.price, 0) / daily[0].length)
    : null;

  const { status, ...profile } = record;
  return {
    ...profile,
    status,
    todayHours: hoursForToday(record.hours, now),
    daily,
    hasMenuToday: Boolean(publishedToday && daily[0].length > 0),
    menuUpdatedAt: publishedToday?.updatedAt ?? null,
    avgPrice,
  };
}

/**
 * Menu filters, typo-tolerant search and ordering (spec FR-01..FR-03).
 * Runs on DTOs so it is independent of where the rows came from.
 */
export function selectRestaurants(
  sources: RestaurantDTO[],
  filter: RestaurantListFilter,
): RestaurantListResult {
  const query = (filter.q ?? "").trim();
  const scored: { dto: RestaurantDTO; score: number }[] = [];

  for (const source of sources) {
    if (filter.city && source.city !== filter.city) continue;
    if (filter.district && source.district !== filter.district) continue;
    if (filter.cuisines?.length && !source.cuisines.some((c) => filter.cuisines!.includes(c))) continue;
    if (filter.delivery && !source.delivery.available) continue;
    if (filter.minRating && source.rating < filter.minRating) continue;

    const items = source.daily[filter.day] ?? [];
    if (!items.length) continue;

    const eligible = items.filter(
      (item) =>
        (filter.maxPrice == null || item.price <= filter.maxPrice) &&
        !item.allergens.some((allergen) => (filter.excluded ?? []).includes(allergen)),
    );
    if (!eligible.length) continue;

    let score = 1;
    if (query) {
      score = Math.max(matchScore(query, source.name), ...eligible.map((item) => matchScore(query, item.name)));
      if (score < MATCH_THRESHOLD) continue;
    }

    scored.push({
      dto: {
        ...source,
        distanceKm: round1(distanceKm(filter.origin, { lat: source.lat, lng: source.lng })),
      },
      score,
    });
  }

  scored.sort((a, b) => {
    if (filter.sort === "distance") {
      return (a.dto.distanceKm ?? Infinity) - (b.dto.distanceKm ?? Infinity);
    }
    if (filter.sort === "price") {
      return (a.dto.avgPrice ?? Infinity) - (b.dto.avgPrice ?? Infinity);
    }
    return (
      b.dto.rating - a.dto.rating ||
      b.dto.ratingCount - a.dto.ratingCount ||
      b.score - a.score ||
      a.dto.name.localeCompare(b.dto.name, "sk")
    );
  });

  return {
    total: scored.length,
    items: scored.slice(filter.offset, filter.offset + filter.limit).map((entry) => entry.dto),
  };
}
