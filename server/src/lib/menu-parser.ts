/**
 * Offline stand-in for the AI menu import (spec X-01).
 *
 * It turns pasted text into draft items and never publishes anything; a manager
 * reviews the result first. When an LLM is wired up, keep this function as the
 * fallback and return the same shape.
 */
import type { MenuItemInput } from "./data/types";

export type MenuImportResult = {
  items: MenuItemInput[];
  skipped: string[];
};

/** "A: 1,7" / "alergény: 1 3" – only valid EU allergen numbers 1..14. */
const ALLERGENS = /(?:\bA|\balergény?)\s*:\s*((?:[1-9]|1[0-4])(?:\s*[,/]\s*(?:[1-9]|1[0-4]))*)/i;
const WEIGHT = /(\d+(?:\s*\/\s*\d+)?\s*(?:g|kg|l|ml|dl|ks))\b/i;
const TRAILING_PRICE = /(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:€|eur)?\s*$/i;

function guessTag(name: string): string {
  const value = name.toLowerCase();
  if (/polievk|krém|vyvár|kapustnic|gulášov/.test(value)) return "Polievka";
  if (/dezert|závin|tiramisu|panna cotta|palacink|koláč|zmrzlin/.test(value)) return "Dezert";
  if (/shake|limonáda|nápoj|káva|čaj|voda/.test(value)) return "Nápoj";
  if (/vege|vegán|tofu|tempeh|falafel|halušk|rizoto|šalát/.test(value)) return "Vege";
  return "Menu 1";
}

export function parseMenuText(text: string): MenuImportResult {
  const items: MenuItemInput[] = [];
  const skipped: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.replace(/\s+/g, " ").trim();
    if (!line) continue;

    const allergens: number[] = [];
    const allergenMatch = line.match(ALLERGENS);
    if (allergenMatch) {
      for (const code of allergenMatch[1].split(/[\s,/]+/)) {
        const parsed = Number(code);
        if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 14) allergens.push(parsed);
      }
      line = line.replace(ALLERGENS, " ").replace(/\s+/g, " ").trim();
    }

    let weight = "";
    const weightMatch = line.match(WEIGHT);
    if (weightMatch) {
      weight = weightMatch[1].replace(/\s+/g, " ");
      line = line.replace(WEIGHT, " ").replace(/\s+/g, " ").trim();
    }

    const priceMatch = line.match(TRAILING_PRICE);
    const price = priceMatch ? Number(priceMatch[1].replace(",", ".")) : NaN;
    if (!priceMatch || !Number.isFinite(price) || price <= 0) {
      skipped.push(rawLine.trim());
      continue;
    }

    let name = line.slice(0, priceMatch.index).replace(/[\s,;:–—-]+$/, "").trim();

    // "dish, description" -> name + description
    let desc = "";
    const comma = name.indexOf(",");
    if (comma > 2) {
      desc = name.slice(comma + 1).trim();
      name = name.slice(0, comma).trim();
    }

    if (!name) {
      skipped.push(rawLine.trim());
      continue;
    }

    items.push({
      name,
      desc,
      weight,
      price: Math.round(price * 100) / 100,
      allergens: [...new Set(allergens)].sort((a, b) => a - b),
      tag: guessTag(name),
    });
  }

  return { items, skipped };
}
