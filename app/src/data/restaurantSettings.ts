export const RESTAURANT_IMAGE_BUCKET = "restaurant-images";
export const MAX_RESTAURANT_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_RESTAURANT_IMAGE_PIXELS = 25_000_000;
export const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const WEEKDAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
export const DELIVERY_PROVIDERS = [
  { name: "Wolt", host: "wolt.com", placeholder: "https://wolt.com/sk/svk/bratislava/restaurant/…" },
  { name: "Bolt Food", host: "food.bolt.eu", placeholder: "https://food.bolt.eu/…" },
  { name: "Bistro.sk", host: "bistro.sk", placeholder: "https://www.bistro.sk/…" },
] as const;
export type DeliveryLink = { name: string; url: string };

const trimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// Every link that reaches an href/src attribute is normalized here at render time.
// Values coming from the database or an API must never be interpolated verbatim.
export function safeHttpUrl(value: unknown, maxLength = 1000): string | null {
  const input = trimmed(value);
  if (!input || input.length > maxLength) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function deliveryLinkUrl(name: unknown, value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input) return "";
  const provider = typeof name === "string" ? DELIVERY_PROVIDERS.find((entry) => entry.name === name) : undefined;
  const normalized = safeHttpUrl(input, 1000);
  if (!provider || !normalized) return null;
  try {
    const url = new URL(normalized);
    if (url.port || ![provider.host, `www.${provider.host}`].includes(url.hostname) || url.pathname === "/") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function safeImageUrl(value: unknown, maxLength = 2000): string | null {
  return safeHttpUrl(value, maxLength);
}

export function googleMapsUrl(value: unknown): string | null {
  const normalized = safeHttpUrl(value, 2000);
  if (!normalized) return null;
  const host = new URL(normalized).hostname.toLowerCase();
  const allowed = host === "google.com" || host.endsWith(".google.com") || host === "maps.app.goo.gl" || host === "goo.gl";
  return allowed ? normalized : null;
}

export function telHref(value: unknown): string | null {
  const input = trimmed(value);
  if (!input || input.length > 40) return null;
  if (!/^\+?[0-9(][0-9\s()./-]*$/.test(input)) return null;
  const digits = input.replace(/[^\d+]/g, "");
  return /^\+?\d{4,40}$/.test(digits) ? `tel:${digits}` : null;
}

export function mailtoHref(value: unknown): string | null {
  const input = trimmed(value);
  if (!input || input.length > 254) return null;
  if (!/^[A-Za-z0-9._+'-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/.test(input)) return null;
  return `mailto:${input}`;
}

export type OpeningDay = { day: string; closed: boolean; open: string; close: string };
export function openingDays(hours: [string, string][]): OpeningDay[] {
  return WEEKDAYS.map((day, index) => {
    const match = hours[index]?.[1].match(/^(\d{2}:\d{2}) – (\d{2}:\d{2})$/);
    return { day, closed: !match, open: match?.[1] ?? "09:00", close: match?.[2] ?? "17:00" };
  });
}
export function imageValidation(file: Pick<File, "type" | "size">): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Vyberte fotografiu vo formáte JPG, PNG alebo WebP.";
  if (file.size <= 0 || file.size > MAX_RESTAURANT_IMAGE_SIZE) return "Fotografia musí mať najviac 5 MB a nesmie byť prázdna.";
  return null;
}
export function photoUploadError(error: { message: string; statusCode?: string | number }): string {
  const message = error.message.toLowerCase();
  if (message.includes("bucket") && message.includes("not found"))
    return "Úložisko fotografií restaurant-images neexistuje. V Supabase spustite supabase/restaurant_settings.sql a potom supabase/restaurant_delivery.sql.";
  if (message.includes("row-level security") || message.includes("unauthorized") || message.includes("permission") || message.includes("not allowed"))
    return "Úložisko nepovolilo nahratie fotografie pre túto reštauráciu. Skontrolujte pravidlá Storage zo súboru supabase/restaurant_settings.sql a priradenie účtu k reštaurácii.";
  if (message.includes("mime") || message.includes("content-type"))
    return "Úložisko nepovoľuje tento formát fotografie. Povolené majú byť JPG, PNG a WebP.";
  if (String(error.statusCode) === "413" || message.includes("size") || message.includes("too large"))
    return "Úložisko odmietlo veľkosť fotografie. Limit je 5 MB; skontrolujte aj limit bucketu restaurant-images v Supabase.";
  if (message.includes("jwt") || message.includes("token") || String(error.statusCode) === "401")
    return "Prihlásenie vypršalo. Prihláste sa znova a skúste fotografiu uložiť.";
  return `Fotografiu sa nepodarilo nahrať${error.statusCode ? ` (${error.statusCode})` : ""}. ${error.message.slice(0, 200) || "Skontrolujte pripojenie a skúste znova."}`;
}
export function websiteUrl(value: unknown): string | null {
  if (!trimmed(value)) return "";
  return safeHttpUrl(value, 300);
}
