import type { Catalog } from "./types";

/** EU 14 allergens, numbered as used on Slovak menus. */
export const ALLERGENS: { code: number; name: string }[] = [
  { code: 1, name: "Obilniny s lepkom" },
  { code: 2, name: "Kôrovce" },
  { code: 3, name: "Vajcia" },
  { code: 4, name: "Ryby" },
  { code: 5, name: "Arašidy" },
  { code: 6, name: "Sója" },
  { code: 7, name: "Mlieko" },
  { code: 8, name: "Orechy" },
  { code: 9, name: "Zeler" },
  { code: 10, name: "Horčica" },
  { code: 11, name: "Sezam" },
  { code: 12, name: "Oxid siričitý" },
  { code: 13, name: "Vlčí bôb" },
  { code: 14, name: "Mäkkýše" },
];

/** Base filter chips; restaurants may add their own cuisines over time. */
export const DEFAULT_CUISINES = ["Slovenská", "Talianska", "Ázijská", "Vegánska", "Burger", "Stredomorská"];

export type { Catalog };
