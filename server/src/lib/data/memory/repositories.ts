import { DAY_SLOTS, slotDate } from "../../dates";
import { CITY_CENTER } from "../../geo";
import { slugify } from "../../slug";
import { ALLERGENS, DEFAULT_CUISINES } from "../catalog";
import { selectRestaurants, toRestaurantDTO } from "../presentation";
import type {
  Catalog,
  MenuItem,
  MenuPatchInput,
  MenuRecord,
  MenuUpsertInput,
  Notice,
  Repositories,
  RestaurantCreateInput,
  RestaurantListFilter,
  RestaurantRecord,
  RestaurantStatus,
} from "../types";
import { getStore, menuKey } from "./store";

const DEFAULT_HOURS: [string, string][] = [
  ["Pondelok", "Zatvorené"],
  ["Utorok", "Zatvorené"],
  ["Streda", "Zatvorené"],
  ["Štvrtok", "Zatvorené"],
  ["Piatok", "Zatvorené"],
  ["Sobota", "Zatvorené"],
  ["Nedeľa", "Zatvorené"],
];

function menusFor(slug: string): MenuRecord[] {
  return [...getStore().menus.values()].filter((menu) => menu.restaurantSlug === slug);
}

function withItems(menuId: string, items: Omit<MenuItem, "id" | "position">[]): MenuItem[] {
  return items.map((item, index) => ({
    ...item,
    id: `mi_${menuId}_${index}`,
    position: index,
  }));
}

export function createMemoryRepositories(): Repositories {
  return {
    restaurants: {
      async list(filter: RestaurantListFilter) {
        const allowed = filter.statuses ?? (["active"] as RestaurantStatus[]);
        const dtos = [...getStore().restaurants.values()]
          .filter((record) => allowed.includes(record.status))
          .map((record) => toRestaurantDTO(record, menusFor(record.slug)));
        return selectRestaurants(dtos, filter);
      },

      async bySlug(slug: string) {
        const record = getStore().restaurants.get(slug);
        if (!record) return null;
        return toRestaurantDTO(record, menusFor(record.slug));
      },

      async listByStatus(status: RestaurantStatus) {
        return [...getStore().restaurants.values()]
          .filter((record) => record.status === status)
          .map((record) => toRestaurantDTO(record, menusFor(record.slug), new Date(), true))
          .sort((a, b) => a.name.localeCompare(b.name, "sk"));
      },

      async create(input: RestaurantCreateInput) {
        const store = getStore();
        const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
        if (!slug || store.restaurants.has(slug)) return null;

        const record: RestaurantRecord = {
          id: `r_${slug}`,
          slug,
          name: input.name,
          initials: input.name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0] ?? "")
            .join("")
            .toUpperCase(),
          tagline: input.tagline,
          cuisines: input.cuisines,
          city: input.city,
          district: input.district,
          address: input.address,
          phone: input.phone,
          email: input.email,
          web: input.web,
          ico: input.ico,
          contactName: input.contactName,
          rating: 0,
          ratingCount: 0,
          lat: input.lat ?? CITY_CENTER.lat,
          lng: input.lng ?? CITY_CENTER.lng,
          delivery: { available: false, eta: "" },
          hours: input.hours ?? DEFAULT_HOURS,
          image: "",
          gallery: [],
          standard: [],
          reviews: [],
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        store.restaurants.set(slug, record);
        return toRestaurantDTO(record, []);
      },

      async updateStatus(slug: string, status: RestaurantStatus) {
        const store = getStore();
        const record = store.restaurants.get(slug);
        if (!record) return null;
        record.status = status;
        store.restaurants.set(slug, record);
        return toRestaurantDTO(record, menusFor(slug), new Date(), true);
      },

      async catalog(): Promise<Catalog> {
        const restaurants = [...getStore().restaurants.values()];
        const cuisines = [...new Set([...DEFAULT_CUISINES, ...restaurants.flatMap((r) => r.cuisines)])].sort((a, b) =>
          a.localeCompare(b, "sk"),
        );

        const cities = new Map<string, Set<string>>();
        for (const restaurant of restaurants) {
          if (!cities.has(restaurant.city)) cities.set(restaurant.city, new Set());
          if (restaurant.district) cities.get(restaurant.city)!.add(restaurant.district);
        }

        return {
          cuisines,
          cities: [...cities.entries()]
            .map(([name, districts]) => ({
              name,
              districts: [...districts].sort((a, b) => a.localeCompare(b, "sk")),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, "sk")),
          allergens: ALLERGENS,
          days: DAY_SLOTS.map((slot) => ({ slot, date: slotDate(slot) })),
        };
      },
    },

    menus: {
      async get(restaurantSlug: string, date: string) {
        return getStore().menus.get(menuKey(restaurantSlug, date)) ?? null;
      },

      async listRange(restaurantSlug: string, from: string, to: string) {
        return [...getStore().menus.values()]
          .filter((menu) => menu.restaurantSlug === restaurantSlug && menu.date >= from && menu.date <= to)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      async upsert(input: MenuUpsertInput) {
        const store = getStore();
        const key = menuKey(input.restaurantSlug, input.date);
        const existing = store.menus.get(key);
        const now = new Date();
        const id = existing?.id ?? `m_${input.restaurantSlug}_${input.date}`;

        const menu: MenuRecord = {
          id,
          restaurantSlug: input.restaurantSlug,
          date: input.date,
          status: input.status,
          note: input.note ?? null,
          publishedAt:
            input.status === "published"
              ? (existing?.publishedAt ?? now.toISOString())
              : (existing?.publishedAt ?? null),
          updatedAt: now.toISOString(),
          items: withItems(id, input.items),
        };

        store.menus.set(key, menu);
        return menu;
      },

      async update(id: string, patch: MenuPatchInput) {
        const store = getStore();
        const entry = [...store.menus.entries()].find(([, menu]) => menu.id === id);
        if (!entry) return null;
        const [key, existing] = entry;
        const now = new Date();
        const status = patch.status ?? existing.status;

        const menu: MenuRecord = {
          ...existing,
          status,
          note: patch.note === undefined ? existing.note : patch.note,
          items: patch.items === undefined ? existing.items : withItems(existing.id, patch.items),
          publishedAt:
            status === "published" ? (existing.publishedAt ?? now.toISOString()) : existing.publishedAt,
          updatedAt: now.toISOString(),
        };

        store.menus.set(key, menu);
        return menu;
      },
    },

    favorites: {
      async list(userId: string) {
        return [...(getStore().favorites.get(userId) ?? [])].sort((a, b) => a.localeCompare(b));
      },

      async add(userId: string, _email: string, slug: string) {
        const store = getStore();
        const restaurant = store.restaurants.get(slug);
        if (!restaurant || restaurant.status !== "active") return false;
        const set = store.favorites.get(userId) ?? new Set<string>();
        set.add(slug);
        store.favorites.set(userId, set);
        return true;
      },

      async remove(userId: string, _email: string, slug: string) {
        const store = getStore();
        if (!store.restaurants.has(slug)) return false;
        store.favorites.get(userId)?.delete(slug);
        return true;
      },
    },

    notifications: {
      async list(userId: string): Promise<Notice[]> {
        const store = getStore();
        return store.notices
          .map((notice) => ({
            ...notice,
            read: store.noticeRead.get(notice.id)?.has(userId) ?? false,
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },

      async markRead(userId: string, _email: string, id: string) {
        const store = getStore();
        if (!store.notices.some((notice) => notice.id === id)) return false;
        const readers = store.noticeRead.get(id) ?? new Set<string>();
        readers.add(userId);
        store.noticeRead.set(id, readers);
        return true;
      },
    },
  };
}
