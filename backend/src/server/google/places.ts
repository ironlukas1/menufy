// Pure request/response logic. API credentials are supplied only by the server route.
export type GoogleRating = {
  placeId: string; name: string; rating: number | null; ratingCount: number; mapsUrl: string;
  attributions: { name: string; url: string | null }[];
};
export class PlacesRequestError extends Error {
  code: "GOOGLE_UNAVAILABLE" | "PLACE_NOT_FOUND" | "INVALID_RESPONSE";
  constructor(code: "GOOGLE_UNAVAILABLE" | "PLACE_NOT_FOUND" | "INVALID_RESPONSE") { super(code); this.code = code; }
}
export const validPlaceId = (value: string) => /^[A-Za-z0-9_-]{10,255}$/.test(value);
const httpsUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; }
  catch { return null; }
};
export async function fetchGoogleRating(placeId: string, key: string, fetcher: typeof fetch = fetch): Promise<GoogleRating> {
  if (!validPlaceId(placeId)) throw new PlacesRequestError("PLACE_NOT_FOUND");
  let response: Response;
  try {
    response = await fetcher(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=sk`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,attributions" },
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
  } catch { throw new PlacesRequestError("GOOGLE_UNAVAILABLE"); }
  if (!response.ok) throw new PlacesRequestError(response.status === 404 ? "PLACE_NOT_FOUND" : "GOOGLE_UNAVAILABLE");
  let data;
  try { data = await response.json(); } catch { throw new PlacesRequestError("INVALID_RESPONSE"); }
  if (data?.id !== placeId || typeof data?.displayName?.text !== "string") throw new PlacesRequestError("INVALID_RESPONSE");
  const count = data.userRatingCount ?? 0;
  if (!Number.isSafeInteger(count) || count < 0 || (data.rating !== undefined && (typeof data.rating !== "number" || !Number.isFinite(data.rating) || data.rating < 1 || data.rating > 5)))
    throw new PlacesRequestError("INVALID_RESPONSE");
  const mapsUrl = httpsUrl(data.googleMapsUri);
  const mapsHost = mapsUrl ? new URL(mapsUrl).hostname : "";
  const canonical = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.displayName.text)}&query_place_id=${encodeURIComponent(placeId)}`;
  return {
    placeId, name: data.displayName.text, rating: count > 0 ? data.rating ?? null : null, ratingCount: count,
    mapsUrl: mapsHost === "google.com" || mapsHost.endsWith(".google.com") || mapsHost === "maps.app.goo.gl" ? mapsUrl! : canonical,
    attributions: Array.isArray(data.attributions) ? data.attributions.flatMap((entry: { provider?: unknown; providerUri?: unknown }) =>
      typeof entry?.provider === "string" ? [{ name: entry.provider, url: httpsUrl(entry.providerUri) }] : []) : [],
  };
}
export function createRequestBudget(limit = 30, windowMs = 60000) {
  let start = 0; let used = 0;
  return (now = Date.now()) => {
    if (now - start >= windowMs) { start = now; used = 0; }
    if (used >= limit) return false;
    used += 1; return true;
  };
}
