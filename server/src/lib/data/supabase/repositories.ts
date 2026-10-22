/**
 * Supabase implementations of the repositories.
 *
 * ⚠️  Reference implementation: it targets the schema in
 *     `supabase/migrations/0001_init.sql` but has not been exercised against a
 *     live project yet (the app runs on the memory backend by default).
 *     Before switching `MENUFY_DATA_SOURCE=supabase`, create the schema and
 *     smoke-test the endpoints listed in `server/README.md`.
 *
 * Business rules (filtering, typo-tolerant search, DTO composition) are shared
 * with the memory backend through `../presentation.ts`; this file only maps
 * PostgREST rows and writes.
 */
import { DAY_SLOTS, slotDate } from "../../dates";
import { CITY_CENTER } from "../../geo";
import { slugify } from "../../slug";
import { ALLERGENS, DEFAULT_CUISINES } from "../catalog";
import { selectRestaurants, toRestaurantDTO } from "../presentation";
import type {
  Catalog,
  MenuItem,
  MenuItemInput,
  MenuPatchInput,
  MenuRecord,
  MenuUpsertInput,
  Notice,
  OpeningHours,
  Repositories,
  RestaurantCreateInput,
  RestaurantDTO,
  RestaurantListFilter,
  RestaurantRecord,
  RestaurantStatus,
} from "../types";
import { supabaseAdmin } from "./client";

/* ------------------------------------------------------------------ rows --- */

type MenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  weight: string | null;
  price_cents: number | string | null;
  allergens: number[] | null;
  tag: string | null;
  position: number | string | null;
};

type MenuRow = {
  id: string;
  kind: "daily" | "standard" | string;
  date: string | null;
  status: string;
  note: string | null;
  published_at: string | null;
  updated_at: string | null;
  menu_items: MenuItemRow[] | null;
};

type ReviewRow = { author: string; stars: number | string | null; reviewed_on: string | null; body: string | null };

type TypeLinkRow = { type: { name: string } | null };

type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  initials: string | null;
  tagline: string | null;
  city: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  web: string | null;
  ico: string | null;
  rating: number | string | null;
  rating_count: number | string | null;
  lat: number | string | null;
  lng: number | string | null;
  delivery_available: boolean | null;
  delivery_eta: string | null;
  hours: OpeningHours | null;
  image: string | null;
  gallery: string[] | null;
  status: RestaurantStatus;
  created_at: string;
  restaurant_type_links: TypeLinkRow[] | null;
  restaurant_reviews: ReviewRow[] | null;
  menus: MenuRow[] | null;
};

const MENU_ITEM_FIELDS = "id, name, description, weight, price_cents, allergens, tag, position";

const MENU_SELECT = `id, kind, date, status, note, published_at, updated_at, menu_items(${MENU_ITEM_FIELDS})`;

const RESTAURANT_SELECT = `
  id, slug, name, initials, tagline, city, district, address, phone, email, web, ico,
  rating, rating_count, lat, lng, delivery_available, delivery_eta, hours, image, gallery,
  status, created_at,
  restaurant_type_links(type:restaurant_types(name)),
  restaurant_reviews(author, stars, reviewed_on, body),
  menus(${MENU_SELECT})
`;

/* --------------------------------------------------------------- mapping --- */

const num = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();

function itemsFromRows(rows: MenuItemRow[] | null): MenuItem[] {
  return [...(rows ?? [])]
    .sort((a, b) => num(a.position) - num(b.position))
    .map((row, index) => ({
      id: row.id,
      name: row.name,
      desc: row.description ?? "",
      weight: row.weight ?? "",
      allergens: (row.allergens ?? []).map((value) => num(value)).filter((value) => value >= 1 && value <= 14),
      price: Math.round(num(row.price_cents)) / 100,
      tag: row.tag ?? "",
      position: index,
    }));
}

function menuFromRow(row: MenuRow, restaurantSlug: string): MenuRecord {
  return {
    id: row.id,
    restaurantSlug,
    date: row.date ?? "",
    status: row.status === "published" ? "published" : "draft",
    note: row.note,
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? row.published_at ?? new Date().toISOString(),
    items: itemsFromRows(row.menu_items),
  };
}

function restaurantFromRow(row: RestaurantRow): { record: RestaurantRecord; menus: MenuRecord[] } {
  const dailyMenus = (row.menus ?? []).filter((menu) => menu.kind === "daily");
  const standardMenu = (row.menus ?? []).find((menu) => menu.kind === "standard");

  const record: RestaurantRecord = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: row.initials || initialsOf(row.name),
    tagline: row.tagline ?? "",
    cuisines: (row.restaurant_type_links ?? [])
      .map((link) => link.type?.name)
      .filter((name): name is string => Boolean(name)),
    city: row.city,
    district: row.district ?? "",
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    web: row.web ?? "",
    ico: row.ico ?? undefined,
    rating: num(row.rating),
    ratingCount: num(row.rating_count),
    lat: num(row.lat, CITY_CENTER.lat),
    lng: num(row.lng, CITY_CENTER.lng),
    delivery: { available: Boolean(row.delivery_available), eta: row.delivery_eta ?? "" },
    hours: (row.hours ?? []) as OpeningHours,
    image: row.image ?? "",
    gallery: row.gallery ?? [],
    standard: itemsFromRows(standardMenu?.menu_items ?? null),
    reviews: (row.restaurant_reviews ?? []).map((review) => ({
      author: review.author,
      stars: num(review.stars),
      date: review.reviewed_on ?? "",
      text: review.body ?? "",
    })),
    status: row.status,
    createdAt: row.created_at,
  };

  return { record, menus: dailyMenus.map((menu) => menuFromRow(menu, row.slug)) };
}

/* --------------------------------------------------------------- helpers --- */

async function profileIdFor(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    console.warn(`[menufy] profiles lookup failed: ${error.message}`);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
}

async function restaurantRow(slug: string): Promise<RestaurantRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("restaurants")
    .select(RESTAURANT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data as unknown as RestaurantRow | null) ?? null;
}

async function restaurantIdForSlug(slug: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin().from("restaurants").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data as { id: string } | null)?.id ?? null;
}

async function fetchDTO(slug: string, includeDrafts = false): Promise<RestaurantDTO | null> {
  const row = await restaurantRow(slug);
  if (!row) return null;
  const { record, menus } = restaurantFromRow(row);
  return toRestaurantDTO(record, menus, new Date(), includeDrafts);
}

async function getMenu(restaurantSlug: string, date: string): Promise<MenuRecord | null> {
  const restaurantId = await restaurantIdForSlug(restaurantSlug);
  if (!restaurantId) return null;
  const { data, error } = await supabaseAdmin()
    .from("menus")
    .select(MENU_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("kind", "daily")
    .eq("date", date)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? menuFromRow(data as unknown as MenuRow, restaurantSlug) : null;
}

/* ---------------------------------------------------------- repositories --- */

export function createSupabaseRepositories(): Repositories {
  return {
    restaurants: {
      async list(filter: RestaurantListFilter) {
        const allowed = filter.statuses ?? (["active"] as RestaurantStatus[]);
        let query = supabaseAdmin().from("restaurants").select(RESTAURANT_SELECT).in("status", allowed);
        if (filter.city) query = query.eq("city", filter.city);
        if (filter.district) query = query.eq("district", filter.district);
        if (filter.delivery) query = query.eq("delivery_available", true);
        if (filter.minRating) query = query.gte("rating", filter.minRating);

        const { data, error } = await query;
        if (error) throw new Error(`Supabase: ${error.message}`);

        const now = new Date();
        const dtos = ((data ?? []) as unknown as RestaurantRow[]).map((row) => {
          const { record, menus } = restaurantFromRow(row);
          return toRestaurantDTO(record, menus, now);
        });

        // Menu-level filters and fuzzy search run in shared code; at this scale
        // (hundreds of restaurants) that is cheaper than several round trips.
        return selectRestaurants(dtos, filter);
      },

      async bySlug(slug: string) {
        return fetchDTO(slug);
      },

      async listByStatus(status: RestaurantStatus) {
        const { data, error } = await supabaseAdmin()
          .from("restaurants")
          .select(RESTAURANT_SELECT)
          .eq("status", status)
          .order("name");
        if (error) throw new Error(`Supabase: ${error.message}`);

        const now = new Date();
        return ((data ?? []) as unknown as RestaurantRow[]).map((row) => {
          const { record, menus } = restaurantFromRow(row);
          return toRestaurantDTO(record, menus, now, true);
        });
      },

      async create(input: RestaurantCreateInput) {
        const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
        if (!slug) return null;

        const { data, error } = await supabaseAdmin()
          .from("restaurants")
          .insert({
            slug,
            name: input.name,
            initials: initialsOf(input.name),
            tagline: input.tagline,
            city: input.city,
            district: input.district,
            address: input.address,
            phone: input.phone,
            email: input.email,
            web: input.web,
            ico: input.ico,
            lat: input.lat ?? CITY_CENTER.lat,
            lng: input.lng ?? CITY_CENTER.lng,
            hours: input.hours ?? [],
            status: "pending",
          })
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") return null; // slug already exists
          throw new Error(`Supabase: ${error.message}`);
        }

        const restaurantId = (data as { id: string }).id;

        if (input.cuisines.length) {
          const { data: types } = await supabaseAdmin()
            .from("restaurant_types")
            .select("id")
            .in("name", input.cuisines);
          const links = ((types ?? []) as { id: string }[]).map((type) => ({
            restaurant_id: restaurantId,
            type_id: type.id,
          }));
          if (links.length) {
            const { error: linkError } = await supabaseAdmin().from("restaurant_type_links").insert(links);
            if (linkError) console.warn(`[menufy] type links not saved: ${linkError.message}`);
          }
        }

        // If the contact already has an account, make them the restaurant owner.
        const profileId = await profileIdFor(input.contactEmail);
        if (profileId) {
          const { error: ownerError } = await supabaseAdmin()
            .from("restaurant_users")
            .insert({ user_id: profileId, restaurant_id: restaurantId, role: "owner" });
          if (ownerError) console.warn(`[menufy] owner link not saved: ${ownerError.message}`);
        }

        return fetchDTO(slug, true);
      },

      async updateStatus(slug: string, status: RestaurantStatus) {
        const { data, error } = await supabaseAdmin()
          .from("restaurants")
          .update({ status })
          .eq("slug", slug)
          .select("id")
          .maybeSingle();
        if (error) throw new Error(`Supabase: ${error.message}`);
        if (!data) return null;
        return fetchDTO(slug, true);
      },

      async catalog(): Promise<Catalog> {
        const { data, error } = await supabaseAdmin()
          .from("restaurants")
          .select("city, district, restaurant_type_links(type:restaurant_types(name))")
          .eq("status", "active");
        if (error) throw new Error(`Supabase: ${error.message}`);

        const rows = (data ?? []) as unknown as {
          city: string;
          district: string | null;
          restaurant_type_links: TypeLinkRow[] | null;
        }[];

        const cuisines = new Set(DEFAULT_CUISINES);
        const cities = new Map<string, Set<string>>();

        for (const row of rows) {
          for (const link of row.restaurant_type_links ?? []) {
            if (link.type?.name) cuisines.add(link.type.name);
          }
          if (!cities.has(row.city)) cities.set(row.city, new Set());
          if (row.district) cities.get(row.city)!.add(row.district);
        }

        return {
          cuisines: [...cuisines].sort((a, b) => a.localeCompare(b, "sk")),
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
        return getMenu(restaurantSlug, date);
      },

      async listRange(restaurantSlug: string, from: string, to: string) {
        const restaurantId = await restaurantIdForSlug(restaurantSlug);
        if (!restaurantId) return [];
        const { data, error } = await supabaseAdmin()
          .from("menus")
          .select(MENU_SELECT)
          .eq("restaurant_id", restaurantId)
          .eq("kind", "daily")
          .gte("date", from)
          .lte("date", to)
          .order("date");
        if (error) throw new Error(`Supabase: ${error.message}`);
        return ((data ?? []) as unknown as MenuRow[]).map((row) => menuFromRow(row, restaurantSlug));
      },

      async upsert(input: MenuUpsertInput) {
        const supabase = supabaseAdmin();
        const restaurantId = await restaurantIdForSlug(input.restaurantSlug);
        if (!restaurantId) throw new Error(`Reštaurácia ${input.restaurantSlug} neexistuje.`);

        const { data: existing, error: findError } = await supabase
          .from("menus")
          .select("id, published_at")
          .eq("restaurant_id", restaurantId)
          .eq("kind", "daily")
          .eq("date", input.date)
          .maybeSingle();
        if (findError) throw new Error(`Supabase: ${findError.message}`);

        const current = existing as { id: string; published_at: string | null } | null;
        const now = new Date().toISOString();
        const publishedAt =
          input.status === "published" ? (current?.published_at ?? now) : (current?.published_at ?? null);
        const payload = {
          status: input.status,
          note: input.note ?? null,
          published_at: publishedAt,
          updated_at: now,
        };

        let menuId = current?.id;
        if (menuId) {
          const { error } = await supabase.from("menus").update(payload).eq("id", menuId);
          if (error) throw new Error(`Supabase: ${error.message}`);
          const { error: clearError } = await supabase.from("menu_items").delete().eq("menu_id", menuId);
          if (clearError) throw new Error(`Supabase: ${clearError.message}`);
        } else {
          const { data, error } = await supabase
            .from("menus")
            .insert({ ...payload, restaurant_id: restaurantId, kind: "daily", date: input.date })
            .select("id")
            .single();
          if (error) throw new Error(`Supabase: ${error.message}`);
          menuId = (data as { id: string }).id;
        }

        await insertItems(menuId!, input.items);

        const menu = await getMenu(input.restaurantSlug, input.date);
        if (!menu) throw new Error("Menu sa nepodarilo načítať po uložení.");
        return menu;
      },

      async update(id: string, patch: MenuPatchInput) {
        const supabase = supabaseAdmin();
        const { data: row, error: findError } = await supabase
          .from("menus")
          .select("id, restaurant:restaurants(slug)")
          .eq("id", id)
          .maybeSingle();
        if (findError) throw new Error(`Supabase: ${findError.message}`);
        if (!row) return null;

        const slug = (row as unknown as { restaurant: { slug: string } | null }).restaurant?.slug ?? "";
        const now = new Date().toISOString();
        const payload: Record<string, unknown> = { updated_at: now };
        if (patch.status !== undefined) {
          payload.status = patch.status;
          if (patch.status === "published") payload.published_at = now;
        }
        if (patch.note !== undefined) payload.note = patch.note;

        const { error } = await supabase.from("menus").update(payload).eq("id", id);
        if (error) throw new Error(`Supabase: ${error.message}`);

        if (patch.items !== undefined) {
          const { error: clearError } = await supabase.from("menu_items").delete().eq("menu_id", id);
          if (clearError) throw new Error(`Supabase: ${clearError.message}`);
          await insertItems(id, patch.items);
        }

        const { data, error: fetchError } = await supabase
          .from("menus")
          .select(MENU_SELECT)
          .eq("id", id)
          .maybeSingle();
        if (fetchError) throw new Error(`Supabase: ${fetchError.message}`);
        return data ? menuFromRow(data as unknown as MenuRow, slug) : null;
      },
    },

    favorites: {
      async list(_userId: string, email: string) {
        const profileId = await profileIdFor(email);
        if (!profileId) return [];
        const { data, error } = await supabaseAdmin()
          .from("favorites")
          .select("restaurant:restaurants(slug)")
          .eq("user_id", profileId);
        if (error) throw new Error(`Supabase: ${error.message}`);
        return ((data ?? []) as unknown as { restaurant: { slug: string } | null }[])
          .map((row) => row.restaurant?.slug)
          .filter((slug): slug is string => Boolean(slug))
          .sort((a, b) => a.localeCompare(b));
      },

      async add(_userId: string, email: string, slug: string) {
        const profileId = await profileIdFor(email);
        if (!profileId) return false;
        const { data: restaurant } = await supabaseAdmin()
          .from("restaurants")
          .select("id")
          .eq("slug", slug)
          .eq("status", "active")
          .maybeSingle();
        const restaurantId = (restaurant as { id: string } | null)?.id;
        if (!restaurantId) return false;

        const { error } = await supabaseAdmin()
          .from("favorites")
          .upsert({ user_id: profileId, restaurant_id: restaurantId }, { onConflict: "user_id,restaurant_id" });
        if (error) throw new Error(`Supabase: ${error.message}`);
        return true;
      },

      async remove(_userId: string, email: string, slug: string) {
        const profileId = await profileIdFor(email);
        if (!profileId) return false;
        const restaurantId = await restaurantIdForSlug(slug);
        if (!restaurantId) return false;

        const { error } = await supabaseAdmin()
          .from("favorites")
          .delete()
          .eq("user_id", profileId)
          .eq("restaurant_id", restaurantId);
        if (error) throw new Error(`Supabase: ${error.message}`);
        return true;
      },
    },

    notifications: {
      async list(_userId: string, email: string): Promise<Notice[]> {
        const profileId = await profileIdFor(email);
        let query = supabaseAdmin()
          .from("notifications")
          .select("id, kind, title, body, time_label, restaurant_slug, created_at")
          .order("created_at", { ascending: false });
        query = profileId ? query.or(`user_id.is.null,user_id.eq.${profileId}`) : query.is("user_id", null);

        const { data, error } = await query;
        if (error) throw new Error(`Supabase: ${error.message}`);

        const readIds = new Set<string>();
        if (profileId) {
          const { data: reads } = await supabaseAdmin()
            .from("notification_reads")
            .select("notification_id")
            .eq("user_id", profileId);
          for (const row of (reads ?? []) as { notification_id: string }[]) readIds.add(row.notification_id);
        }

        return ((data ?? []) as unknown as {
          id: string;
          kind: string;
          title: string;
          body: string;
          time_label: string;
          restaurant_slug: string | null;
          created_at: string;
        }[]).map((row) => ({
          id: row.id,
          kind: row.kind === "menu" || row.kind === "offer" ? row.kind : "system",
          title: row.title,
          body: row.body,
          time: row.time_label,
          slug: row.restaurant_slug,
          createdAt: row.created_at,
          read: readIds.has(row.id),
        }));
      },

      async markRead(_userId: string, email: string, id: string) {
        const profileId = await profileIdFor(email);
        if (!profileId) return false;
        const { data } = await supabaseAdmin().from("notifications").select("id").eq("id", id).maybeSingle();
        if (!data) return false;

        const { error } = await supabaseAdmin()
          .from("notification_reads")
          .upsert({ notification_id: id, user_id: profileId }, { onConflict: "notification_id,user_id" });
        if (error) throw new Error(`Supabase: ${error.message}`);
        return true;
      },
    },
  };
}

async function insertItems(menuId: string, items: MenuItemInput[]): Promise<void> {
  if (!items.length) return;
  const { error } = await supabaseAdmin()
    .from("menu_items")
    .insert(
      items.map((item, index) => ({
        menu_id: menuId,
        name: item.name,
        description: item.desc,
        weight: item.weight,
        price_cents: Math.round(item.price * 100),
        allergens: item.allergens,
        tag: item.tag,
        position: index,
      })),
    );
  if (error) throw new Error(`Supabase: ${error.message}`);
}
