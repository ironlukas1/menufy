import { DAYS, restaurants as prototypeRestaurants, type MenuItem, type Restaurant } from '../data/restaurants';
import type { StoredMenu } from '../data/owner';

type PublicRestaurantRow = {
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  city: string;
  district: string;
  address: string;
  email: string;
  phone: string;
  web: string;
  rating: number;
  rating_count: number;
  lat: number;
  lng: number;
  image: string;
  gallery: string[];
  hours: [string, string][];
  delivery_available: boolean;
  delivery_eta: string;
  menus: StoredMenu[];
  restaurant_type_links: { restaurant_types: { name: string } }[];
};

function items(menu: StoredMenu | undefined): MenuItem[] {
  return [...(menu?.menu_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      name: item.name,
      desc: item.description,
      weight: item.weight,
      allergens: item.allergens,
      price: item.price_cents / 100,
      tag: item.tag,
    }));
}

export function toRestaurant(row: PublicRestaurantRow): Restaurant {
  return {
    slug: row.slug,
    name: row.name,
    initials: row.initials,
    tagline: row.tagline,
    city: row.city,
    district: row.district,
    address: row.address,
    email: row.email,
    phone: row.phone,
    web: row.web,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    lat: row.lat,
    lng: row.lng,
    image: row.image || prototypeRestaurants[0].image,
    gallery: row.gallery ?? [],
    cuisines: row.restaurant_type_links.map((link) => link.restaurant_types.name),
    hours: row.hours ?? [],
    todayHours: '',
    delivery: { available: row.delivery_available, eta: row.delivery_eta },
    reviews: [],
    live: true,
    daily: DAYS.map((day) =>
      items(
        row.menus.find(
          (menu) => menu.kind === 'daily' && menu.date === day.date && menu.status === 'published',
        ),
      ),
    ),
    standard: items(
      row.menus.find((menu) => menu.kind === 'standard' && menu.status === 'published'),
    ),
  };
}

export const RESTAURANT_SELECT =
  'slug, name, initials, tagline, city, district, address, email, phone, web, rating, rating_count, lat, lng, image, gallery, hours, delivery_available, delivery_eta, restaurant_type_links(restaurant_types(name)), menus(id, kind, date, status, menu_items(name, description, weight, price_cents, allergens, tag, position))';
