import type { Restaurant } from "@/data/restaurants";

export const CITY_CENTER = { lat: 48.1486, lng: 17.1077 };
export const USER_POS = { lat: 48.1469, lng: 17.1175 };

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const fmtKm = (km: number) => km.toFixed(1).replace(".", ",") + " km";

const toMin = (s: string) => {
  const [h, m] = s.trim().split(":").map(Number);
  return h * 60 + m;
};

export function openStatus(r: Restaurant, now = new Date()) {
  const m = r.todayHours.match(/(\d{1,2}:\d{2})\s*–\s*(\d{1,2}:\d{2})/);
  if (!m) return { open: false, label: "Dnes zatvorené" };
  const cur = now.getHours() * 60 + now.getMinutes();
  const [from, to] = [toMin(m[1]), toMin(m[2])];
  if (cur >= from && cur < to) return { open: true, label: `Otvorené do ${m[2]}` };
  if (cur < from) return { open: false, label: `Zatvorené · otvára o ${m[1]}` };
  return { open: false, label: "Zatvorené" };
}

export const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
