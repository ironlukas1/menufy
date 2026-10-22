import { env } from "../../env";
import { seedMenus, seedNotices, seedRestaurants } from "../seed";
import type { MenuRecord, Notice, RestaurantRecord } from "../types";

export const menuKey = (slug: string, date: string) => `${slug}|${date}`;

export type MemoryStore = {
  restaurants: Map<string, RestaurantRecord>;
  menus: Map<string, MenuRecord>;
  /** userId -> favourite restaurant slugs */
  favorites: Map<string, Set<string>>;
  /** noticeId -> userIds that marked it read */
  noticeRead: Map<string, Set<string>>;
  notices: Notice[];
};

function createStore(): MemoryStore {
  const now = new Date();
  const restaurants = new Map(seedRestaurants(now).map((r) => [r.slug, r]));
  const menus = new Map(seedMenus(now).map((m) => [menuKey(m.restaurantSlug, m.date), m]));

  // The prototype starts with one favourite for the demo account.
  const favorites = new Map<string, Set<string>>([[`user_${env.devUserEmail}`, new Set(["bistro-mlyn"])]]);

  return {
    restaurants,
    menus,
    favorites,
    noticeRead: new Map(),
    notices: seedNotices(now),
  };
}

/** Kept on globalThis so `next dev` hot reloads do not wipe written data. */
const globalStore = globalThis as typeof globalThis & { __menufyMemoryStore?: MemoryStore };

export function getStore(): MemoryStore {
  globalStore.__menufyMemoryStore ??= createStore();
  return globalStore.__menufyMemoryStore;
}
