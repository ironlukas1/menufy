export type Position = { lat: number; lng: number };
export type StoredLocation = { position: Position | null; denied: boolean };

export const LOCATION_KEY = "menufy-location";

const empty: StoredLocation = { position: null, denied: false };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function parseLocation(raw: string | null): StoredLocation {
  if (!raw) return empty;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return empty;
  }
  if (!isRecord(value)) return empty;

  let position: Position | null = null;
  if (isRecord(value.position)) {
    const { lat, lng } = value.position;
    if (
      typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
      typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180
    ) {
      position = { lat, lng };
    }
  }
  return { position, denied: value.denied === true };
}

export function loadLocation(): StoredLocation {
  try {
    return parseLocation(localStorage.getItem(LOCATION_KEY));
  } catch {
    return empty;
  }
}

export function saveLocation(location: StoredLocation): void {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
}
