/**
 * Domain types. These are the contract between the route handlers and the data
 * layer (memory today, Supabase tomorrow). The public `RestaurantDTO` mirrors
 * `app/src/data/restaurants.ts` so the PWA can consume it without a mapper.
 */

export type { DaySlot } from "../dates";
import type { DaySlot } from "../dates";

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  weight: string;
  allergens: number[];
  price: number;
  tag: string;
  position: number;
};

export type MenuItemInput = Omit<MenuItem, "id" | "position">;

export type Review = {
  author: string;
  stars: number;
  date: string;
  text: string;
};

export type RestaurantStatus = "pending" | "active" | "hidden";
export type MenuStatus = "draft" | "published";

export type OpeningHours = [string, string][];

/** Stored profile. Menus are a separate collection keyed by date. */
export type RestaurantRecord = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  cuisines: string[];
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  web: string;
  ico?: string;
  contactName?: string;
  rating: number;
  ratingCount: number;
  lat: number;
  lng: number;
  delivery: { available: boolean; eta: string };
  hours: OpeningHours;
  image: string;
  gallery: string[];
  standard: MenuItem[];
  reviews: Review[];
  status: RestaurantStatus;
  createdAt: string;
};

export type MenuRecord = {
  id: string;
  restaurantSlug: string;
  /** `YYYY-MM-DD` in Europe/Bratislava. */
  date: string;
  status: MenuStatus;
  note: string | null;
  publishedAt: string | null;
  updatedAt: string;
  items: MenuItem[];
};

export type NoticeKind = "menu" | "offer" | "system";

export type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  /** Pre-formatted label kept from the prototype ("Dnes 9:12"). */
  time: string;
  slug: string | null;
  createdAt: string;
  read: boolean;
};

/** Shape returned by `GET /api/restaurants` and `GET /api/restaurants/[slug]`. */
export type RestaurantDTO = Omit<RestaurantRecord, "status"> & {
  status: RestaurantStatus;
  todayHours: string;
  daily: MenuItem[][];
  hasMenuToday: boolean;
  menuUpdatedAt: string | null;
  avgPrice: number | null;
  distanceKm?: number;
};

export type Catalog = {
  cuisines: string[];
  cities: { name: string; districts: string[] }[];
  allergens: { code: number; name: string }[];
  days: { slot: DaySlot; date: string }[];
};

export type RestaurantListFilter = {
  q?: string;
  city?: string;
  district?: string;
  cuisines?: string[];
  excluded?: number[];
  maxPrice?: number | null;
  delivery?: boolean;
  minRating?: number;
  day: DaySlot;
  sort: "rating" | "price" | "distance";
  limit: number;
  offset: number;
  origin: { lat: number; lng: number };
  statuses?: RestaurantStatus[];
};

export type RestaurantListResult = {
  items: RestaurantDTO[];
  total: number;
};

export type RestaurantCreateInput = {
  name: string;
  slug?: string;
  tagline: string;
  cuisines: string[];
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  web: string;
  ico: string;
  contactName: string;
  contactEmail: string;
  lat?: number;
  lng?: number;
  hours?: OpeningHours;
};

export type MenuUpsertInput = {
  restaurantSlug: string;
  date: string;
  status: MenuStatus;
  note?: string | null;
  items: MenuItemInput[];
};

export type MenuPatchInput = {
  status?: MenuStatus;
  note?: string | null;
  items?: MenuItemInput[];
};

export type RestaurantRepository = {
  list(filter: RestaurantListFilter): Promise<RestaurantListResult>;
  bySlug(slug: string): Promise<RestaurantDTO | null>;
  listByStatus(status: RestaurantStatus): Promise<RestaurantDTO[]>;
  /** `null` when the slug is already taken. New restaurants start as `pending`. */
  create(input: RestaurantCreateInput): Promise<RestaurantDTO | null>;
  updateStatus(slug: string, status: RestaurantStatus): Promise<RestaurantDTO | null>;
  catalog(): Promise<Catalog>;
};

export type MenuRepository = {
  get(restaurantSlug: string, date: string): Promise<MenuRecord | null>;
  listRange(restaurantSlug: string, from: string, to: string): Promise<MenuRecord[]>;
  upsert(input: MenuUpsertInput): Promise<MenuRecord>;
  update(id: string, patch: MenuPatchInput): Promise<MenuRecord | null>;
};

export type FavoriteRepository = {
  list(userId: string, email: string): Promise<string[]>;
  /** `false` when the restaurant does not exist or is not public. */
  add(userId: string, email: string, slug: string): Promise<boolean>;
  /** `false` when the restaurant does not exist. */
  remove(userId: string, email: string, slug: string): Promise<boolean>;
};

export type NotificationRepository = {
  list(userId: string, email: string): Promise<Notice[]>;
  markRead(userId: string, email: string, id: string): Promise<boolean>;
};

export type Repositories = {
  restaurants: RestaurantRepository;
  menus: MenuRepository;
  favorites: FavoriteRepository;
  notifications: NotificationRepository;
};
