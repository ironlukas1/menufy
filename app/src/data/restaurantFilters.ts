import { dailyFor, type Restaurant } from "./restaurants.ts";
import { nextAt, openStatus } from "../lib.ts";
import type { Filters } from "./filtersStorage.ts";

// Shared by the result list and the map. Rating is applied separately so the
// map can highlight matching markers and dim the rest instead of hiding them.
export const matchesFilters = (r: Restaurant, f: Filters, query: string, favorites: string[]) => {
  if (r.city !== f.city) return false;
  if (f.district !== "Všetky časti" && r.district !== f.district) return false;
  if (f.cuisines.length && !r.cuisines.some((c) => f.cuisines.includes(c))) return false;
  if (f.delivery && !r.delivery.available) return false;
  if (f.openAt && !openStatus(r, nextAt(f.openAt)).open) return false;
  if (f.sort === "favorites" && !favorites.includes(r.slug)) return false;

  const q = query.trim().toLocaleLowerCase("sk");
  const dayMenu = dailyFor(r, f.day);
  const items = (r.live && !dayMenu.length ? r.standard : dayMenu).filter(
    (it) => it.price <= f.maxPrice && !it.allergens.some((a) => f.excluded.includes(String(a))),
  );
  const publishesMenu = r.daily.some((d) => d.length) || r.standard.length > 0;
  if (!items.length && publishesMenu) return false;
  return !q || r.name.toLocaleLowerCase("sk").includes(q) || items.some((it) => it.name.toLocaleLowerCase("sk").includes(q));
};
