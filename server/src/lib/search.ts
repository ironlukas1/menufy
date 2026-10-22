/**
 * Diacritics-insensitive matching with typo tolerance (spec FR-02).
 * A request for "kolkovna" finds "Kolkovňa"; "pizz" finds "Pizza Napoli".
 */

export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/đ/g, "d")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function bigrams(value: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < value.length - 1; i += 1) out.add(value.slice(i, i + 2));
  return out;
}

/** Sørensen–Dice coefficient over character bigrams, 0..1. */
export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const left = bigrams(a);
  const right = bigrams(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const gram of left) if (right.has(gram)) shared += 1;
  return (2 * shared) / (left.size + right.size);
}

/** How well `query` matches `target` (names, dish names). */
export function matchScore(query: string, target: string): number {
  const q = normalizeText(query);
  const t = normalizeText(target);
  if (!q || !t) return 0;
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.95;
  if (t.includes(q)) return 0.9;

  let best = similarity(q, t);
  for (const word of t.split(" ")) {
    if (word.startsWith(q)) best = Math.max(best, 0.8);
    else best = Math.max(best, similarity(q, word));
  }
  return best;
}

export const MATCH_THRESHOLD = 0.55;

export function matches(query: string, target: string): boolean {
  if (!query.trim()) return true;
  return matchScore(query, target) >= MATCH_THRESHOLD;
}
