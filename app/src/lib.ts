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

const range = (r: Pick<Restaurant, "hours">, day: number) => {
  const m = r.hours[day]?.[1].match(/(\d{1,2}:\d{2})\s*–\s*(\d{1,2}:\d{2})/);
  return m ? { from: toMin(m[1]), to: toMin(m[2]), fromLabel: m[1], toLabel: m[2] } : null;
};

// hours are Monday-first; a range like 20:00 – 04:00 runs past midnight into the next day
export function openStatus(r: Pick<Restaurant, "hours">, now = new Date()) {
  const day = (now.getDay() + 6) % 7;
  const cur = now.getHours() * 60 + now.getMinutes();
  const prev = range(r, (day + 6) % 7);
  if (prev && prev.to <= prev.from && cur < prev.to) return { open: true, label: `Otvorené do ${prev.toLabel}` };
  const today = range(r, day);
  if (!today) return { open: false, label: "Dnes zatvorené" };
  if (cur >= today.from && (today.to <= today.from || cur < today.to)) return { open: true, label: `Otvorené do ${today.toLabel}` };
  if (cur < today.from) return { open: false, label: `Zatvorené · otvára o ${today.fromLabel}` };
  return { open: false, label: "Zatvorené" };
}

// "now" or the next time the clock shows HH:MM
export function nextAt(v: string, now = new Date()) {
  if (v === "now") return now;
  const [h, m] = v.split(":").map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (t < now) t.setDate(t.getDate() + 1);
  return t;
}

export const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
