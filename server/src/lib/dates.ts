/**
 * Calendar helpers.
 *
 * The prototype UI works with four day slots (0 = today, 1 = tomorrow,
 * 2 = next Monday, 3 = next Tuesday). The database stores real dates, so both
 * worlds are bridged here instead of scattering `new Date()` logic around.
 */

export const DAY_SLOTS = [0, 1, 2, 3] as const;
export type DaySlot = (typeof DAY_SLOTS)[number];

const TIME_ZONE = "Europe/Bratislava";

/** `YYYY-MM-DD` for the given instant in the app's time zone. */
export function dateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(key: string, days: number): string {
  const date = parseKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = Monday ... 6 = Sunday. */
export function weekdayIndex(key: string): number {
  return (parseKey(key).getUTCDay() + 6) % 7;
}

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseKey(value).getTime());
}

/**
 * The date behind a UI day slot. Monday/Tuesday slots intentionally point to
 * the *next* occurrence, so a Monday UI never renders the same date twice.
 */
export function slotDate(slot: DaySlot, now: Date = new Date()): string {
  const today = dateKey(now);
  if (slot === 0) return today;
  if (slot === 1) return addDays(today, 1);
  const target = slot === 2 ? 0 : 1;
  let offset = (target - weekdayIndex(today) + 7) % 7;
  if (offset === 0) offset = 7;
  return addDays(today, offset);
}

export function slotDates(now: Date = new Date()): Record<DaySlot, string> {
  return {
    0: slotDate(0, now),
    1: slotDate(1, now),
    2: slotDate(2, now),
    3: slotDate(3, now),
  };
}

export function slotForDate(date: string, now: Date = new Date()): DaySlot | null {
  for (const slot of DAY_SLOTS) {
    if (slotDate(slot, now) === date) return slot;
  }
  return null;
}

/** Opening hours for today from the `hours` array (Monday-first). */
export function hoursForToday(hours: [string, string][], now: Date = new Date()): string {
  const index = weekdayIndex(dateKey(now));
  return hours[index]?.[1] ?? "Zatvorené";
}
