export function mergeRestaurants<T extends { slug: string }>(fallback: T[], live: T[]): T[] {
  return [...new Map([...fallback, ...live].map((restaurant) => [restaurant.slug, restaurant])).values()];
}
