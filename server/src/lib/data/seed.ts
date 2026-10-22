import { slotDate, type DaySlot } from "../dates";
import type { MenuItem, MenuRecord, Notice, NoticeKind, OpeningHours, RestaurantRecord, RestaurantStatus, MenuStatus } from "./types";
import restaurantsJson from "./seed/restaurants.json";
import menusJson from "./seed/menus.json";
import notificationsJson from "./seed/notifications.json";

type SeedRestaurant = Omit<RestaurantRecord, "hours" | "status" | "standard" | "createdAt"> & {
  hours: string[][];
  status: RestaurantStatus;
  standard: Omit<MenuItem, "position">[];
};

type SeedMenu = {
  id: string;
  restaurantSlug: string;
  dayIndex: DaySlot;
  status: MenuStatus;
  publishedAtTime: string;
  items: Omit<MenuItem, "position">[];
};

type SeedNotification = {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  time: string;
  slug: string | null;
  hoursAgo: number;
  read: boolean;
};

export function seedRestaurants(now: Date = new Date()): RestaurantRecord[] {
  return (restaurantsJson as unknown as SeedRestaurant[]).map((restaurant) => ({
    ...restaurant,
    hours: restaurant.hours as OpeningHours,
    status: restaurant.status,
    standard: restaurant.standard.map((item, index) => ({ ...item, position: index })),
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  }));
}

/**
 * Menus are seeded relative to "now", so the prototype always has a today's
 * menu (and the API never looks stale after a few days).
 */
export function seedMenus(now: Date = new Date()): MenuRecord[] {
  return (menusJson as unknown as SeedMenu[]).map((menu) => {
    const date = slotDate(menu.dayIndex, now);
    const publishedAt = new Date(`${date}T${menu.publishedAtTime}:00`).toISOString();
    return {
      id: `m_${menu.restaurantSlug}_${date}`,
      restaurantSlug: menu.restaurantSlug,
      date,
      status: menu.status,
      note: null,
      publishedAt,
      updatedAt: publishedAt,
      items: menu.items.map((item, index) => ({ ...item, position: index })),
    };
  });
}

export function seedNotices(now: Date = new Date()): Notice[] {
  return (notificationsJson as unknown as SeedNotification[]).map((notice) => ({
    id: notice.id,
    kind: notice.kind,
    title: notice.title,
    body: notice.body,
    time: notice.time,
    slug: notice.slug,
    createdAt: new Date(now.getTime() - notice.hoursAgo * 60 * 60 * 1000).toISOString(),
    read: false,
  }));
}
