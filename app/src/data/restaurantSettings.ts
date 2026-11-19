export const RESTAURANT_IMAGE_BUCKET = "restaurant-images";
export const MAX_RESTAURANT_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const WEEKDAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
export const DELIVERY_PROVIDERS = [
  { name: "Wolt", host: "wolt.com", placeholder: "https://wolt.com/sk/svk/bratislava/restaurant/…" },
  { name: "Bolt Food", host: "food.bolt.eu", placeholder: "https://food.bolt.eu/…" },
  { name: "Bistro.sk", host: "bistro.sk", placeholder: "https://www.bistro.sk/…" },
] as const;
export type DeliveryLink = { name: string; url: string };
export function deliveryLinkUrl(name: string, value: string): string | null {
  if (!value.trim()) return "";
  const provider = DELIVERY_PROVIDERS.find((entry) => entry.name === name);
  const normalized = websiteUrl(value);
  if (!provider || !normalized || normalized.length > 1000) return null;
  const url = new URL(normalized);
  if (url.protocol !== "https:" || url.port || ![provider.host, `www.${provider.host}`].includes(url.hostname) || url.pathname === "/") return null;
  return url.href;
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
export function websiteUrl(value: string): string | null {
  if (!value.trim()) return "";
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname) return null;
    return url.href;
  } catch { return null; }
}
