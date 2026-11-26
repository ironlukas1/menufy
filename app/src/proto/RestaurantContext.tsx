import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DAYS, restaurants as prototypeRestaurants, type Restaurant, type MenuItem } from "@/data/restaurants";
import type { StoredMenu } from "@/data/owner";
import { restaurantImageUrl, supabase } from "@/supabase";
import { deliveryLinkUrl, safeImageUrl, websiteUrl, type DeliveryLink } from "@/data/restaurantSettings";
import { mergeRestaurants } from "@/data/restaurantMerge";

type PublicRestaurantRow = {
  slug: string; name: string; initials: string; tagline: string; city: string; district: string; address: string;
  email: string; phone: string; web: string; rating: number; rating_count: number; lat: number; lng: number;
  image: string; gallery: string[]; hours: [string, string][]; delivery_available: boolean; delivery_eta: string;
  delivery_links?: DeliveryLink[]; menus: StoredMenu[]; restaurant_type_links: { restaurant_types: { name: string } }[];
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);
const text = (value: unknown) => (typeof value === "string" ? value : "");
const finite = (value: unknown, fallback = 0) => {
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : fallback;
};
const boundedRating = (value: unknown) => Math.min(5, Math.max(0, finite(value)));
const count = (value: unknown) => Math.max(0, Math.trunc(finite(value)));
const imageUrl = (value: unknown) =>
  typeof value === "string" && value.trim() ? safeImageUrl(restaurantImageUrl(value.trim())) : null;

const isPublicRestaurantRow = (row: unknown): row is PublicRestaurantRow => {
  if (!row || typeof row !== "object") return false;
  const candidate = row as Record<string, unknown>;
  const lat = finite(candidate.lat, NaN);
  const lng = finite(candidate.lng, NaN);
  return typeof candidate.slug === "string" && candidate.slug.length > 0
    && typeof candidate.name === "string" && candidate.name.trim().length > 0
    && !Number.isNaN(lat) && Math.abs(lat) <= 90 && !Number.isNaN(lng) && Math.abs(lng) <= 180;
};

function toRestaurant(row: PublicRestaurantRow): Restaurant {
  const menus = asArray<StoredMenu>(row.menus).filter((menu) => !!menu && typeof menu === "object");
  const items = (menu: StoredMenu | undefined): MenuItem[] =>
    asArray<StoredMenu["menu_items"][number]>(menu?.menu_items)
      .filter((item) => !!item && typeof item === "object")
      .sort((a, b) => finite(a.position) - finite(b.position))
      .map((item) => ({
        name: text(item.name), desc: text(item.description), weight: text(item.weight),
        allergens: asArray<unknown>(item.allergens).map(Number).filter(Number.isFinite),
        price: finite(item.price_cents) / 100, tag: text(item.tag),
      }));
  const coverImage = imageUrl(row.image) ?? "";
  const deliveryLinks = asArray<DeliveryLink>(row.delivery_links).flatMap((link) => {
    if (!link || typeof link !== "object") return [];
    const url = deliveryLinkUrl(link.name, link.url);
    return url ? [{ name: text(link.name) || "Donáška", url }] : [];
  });
  const gallery = asArray<unknown>(row.gallery).map(imageUrl).filter((value): value is string => !!value);
  const hours = asArray<unknown>(row.hours).filter((pair): pair is [string, string] =>
    Array.isArray(pair) && pair.length >= 2 && typeof pair[0] === "string" && typeof pair[1] === "string");
  const cuisines = asArray<{ restaurant_types?: { name?: unknown } }>(row.restaurant_type_links).flatMap((link) => {
    const name = link?.restaurant_types?.name;
    return typeof name === "string" && name.trim() ? [name.trim()] : [];
  });
  return {
    slug: row.slug, name: row.name, initials: row.initials || row.name.slice(0, 2).toUpperCase(), tagline: text(row.tagline),
    city: text(row.city), district: text(row.district), address: text(row.address), email: text(row.email), phone: text(row.phone),
    web: websiteUrl(row.web) ?? "", rating: boundedRating(row.rating), ratingCount: count(row.rating_count),
    lat: finite(row.lat), lng: finite(row.lng), image: coverImage || safeImageUrl(prototypeRestaurants[0].image) || "",
    gallery: gallery.length ? gallery : coverImage ? [coverImage] : [], cuisines, hours,
    todayHours: "", delivery: {
      available: Boolean(row.delivery_available),
      eta: deliveryLinks.some((link) => link.name === "Wolt") ? "" : text(row.delivery_eta),
      links: row.delivery_available ? deliveryLinks : [],
    },
    reviews: [], live: true,
    daily: DAYS.map((day) => items(menus.find((menu) => menu?.kind === "daily" && menu.date === day.date && menu.status === "published"))),
    standard: items(menus.find((menu) => menu?.kind === "standard" && menu.status === "published")),
  };
}

type CommunityRating = { slug: string; rating: number; rating_count: number };
const Context = createContext<{ restaurants: Restaurant[]; loading: boolean; refresh: () => void } | null>(null);
export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [liveRestaurants, setLiveRestaurants] = useState<Restaurant[]>([]);
  const [ratings, setRatings] = useState<CommunityRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const { data, error } = await supabase.rpc("restaurant_community_ratings");
        if (live && !error) {
          const rows = asArray<Partial<CommunityRating>>(data).filter((row) => !!row && typeof row.slug === "string" && Number.isFinite(Number(row.rating)));
          setRatings(rows.map((row) => ({ slug: row.slug as string, rating: boundedRating(row.rating), rating_count: count(row.rating_count) })));
        }
      } catch { /* No fabricated rating fallback. */ }
    })();
    void (async () => {
      try {
        const { data, error } = await supabase.from("restaurants")
          .select("*, restaurant_type_links(restaurant_types(name)), menus(id, kind, date, status, menu_items(name, description, weight, price_cents, allergens, tag, position))")
          .eq("status", "active").eq("owner_submitted", true);
        if (error) throw error;
        if (live) setLiveRestaurants(asArray<unknown>(data).filter(isPublicRestaurantRow).map(toRestaurant));
      } catch {
        // Keep the prototype usable before the portal migration or during an outage.
      } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [revision]);
  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);
  const value = useMemo(() => ({ restaurants: mergeRestaurants(prototypeRestaurants, liveRestaurants).map((restaurant) => {
    const rating = ratings.find((entry) => entry.slug === restaurant.slug);
    return { ...restaurant, rating: boundedRating(rating?.rating ?? restaurant.rating), ratingCount: count(rating?.rating_count ?? restaurant.ratingCount) };
  }), loading, refresh }), [liveRestaurants, ratings, loading, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useRestaurants() {
  const value = useContext(Context);
  if (!value) throw new Error("useRestaurants outside RestaurantProvider");
  return value;
}
