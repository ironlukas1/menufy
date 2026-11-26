import { ALLERGENS, CUISINES, LOCATIONS } from "./allergens.ts";
import { DAYS } from "./restaurants.ts";

export const MAX_PRICE = 15;
export const FILTERS_KEY = "menufy-filters";

export type Filters = {
  day: number;
  city: string;
  district: string;
  cuisines: string[];
  excluded: string[];
  maxPrice: number;
  delivery: boolean;
  minRating: number;
  openAt: string;
  sort: "rating" | "price" | "distance" | "favorites";
};

export const initialFilters: Filters = {
  day: 0,
  city: "Bratislava",
  district: "Všetky časti",
  cuisines: [],
  excluded: [],
  maxPrice: MAX_PRICE,
  delivery: false,
  minRating: 0,
  openAt: "",
  sort: "rating",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const inList = <T extends string>(value: unknown, list: readonly T[]): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

const clampInteger = (value: unknown, min: number, max: number, fallback: number) => {
  const number = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : Number.NaN;
  return Number.isFinite(number) ? Math.min(Math.max(number, min), max) : fallback;
};

const isOpenAt = (value: unknown): value is string =>
  value === "" || value === "now" || (typeof value === "string" && /^(?:[01]\d|2[0-3]):00$/.test(value));

export function parseFilters(raw: string | null): Filters {
  if (!raw) return initialFilters;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return initialFilters;
  }
  if (!isRecord(value)) return initialFilters;

  const city = typeof value.city === "string" && Object.prototype.hasOwnProperty.call(LOCATIONS, value.city)
    ? value.city
    : initialFilters.city;
  const district = typeof value.district === "string" && LOCATIONS[city].includes(value.district)
    ? value.district
    : initialFilters.district;
  const cuisines = Array.isArray(value.cuisines)
    ? [...new Set(value.cuisines.filter((item): item is string => inList(item, CUISINES)))]
    : [];
  const excluded = Array.isArray(value.excluded)
    ? [...new Set(value.excluded.filter((item): item is string =>
        typeof item === "string" && ALLERGENS.some((a) => a.code === item)))]
    : [];
  const sort = inList(value.sort, ["rating", "price", "distance", "favorites"] as const)
    ? value.sort
    : initialFilters.sort;

  return {
    day: clampInteger(value.day, 0, Math.max(0, DAYS.length - 1), initialFilters.day),
    city,
    district,
    cuisines,
    excluded,
    maxPrice: clampInteger(value.maxPrice, 6, MAX_PRICE, initialFilters.maxPrice),
    delivery: typeof value.delivery === "boolean" ? value.delivery : initialFilters.delivery,
    minRating: clampInteger(value.minRating, 0, 5, initialFilters.minRating),
    openAt: isOpenAt(value.openAt) ? value.openAt : initialFilters.openAt,
    sort,
  };
}

export function loadFilters(): Filters {
  try {
    return parseFilters(localStorage.getItem(FILTERS_KEY));
  } catch {
    return initialFilters;
  }
}

export function saveFilters(filters: Filters): void {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
}
