export const RESTAURANT_IMAGE_BUCKET = "restaurant-images";
export const MAX_RESTAURANT_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const WEEKDAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
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
export function websiteUrl(value: string): string | null {
  if (!value.trim()) return "";
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname) return null;
    return url.href;
  } catch { return null; }
}
