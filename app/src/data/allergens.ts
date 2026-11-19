type Allergen = { code: string; name: string };

export const ALLERGEN_GROUPS: { name: string; allergens: Allergen[] }[] = [
  {
    name: "Obiloviny a strukoviny",
    allergens: [
      { code: "1", name: "Obilniny s lepkom" },
      { code: "6", name: "Sója" },
      { code: "13", name: "Vlčí bôb" },
    ],
  },
  {
    name: "Živočíšne produkty",
    allergens: [
      { code: "2", name: "Kôrovce" },
      { code: "3", name: "Vajcia" },
      { code: "4", name: "Ryby" },
      { code: "7", name: "Mlieko" },
      { code: "14", name: "Mäkkýše" },
    ],
  },
  {
    name: "Orechy a semienka",
    allergens: [
      { code: "5", name: "Arašidy" },
      { code: "8", name: "Orechy" },
      { code: "11", name: "Sezam" },
    ],
  },
  {
    name: "Zelenina a korenie",
    allergens: [
      { code: "9", name: "Zeler" },
      { code: "10", name: "Horčica" },
    ],
  },
  {
    name: "Prísady",
    allergens: [{ code: "12", name: "Oxid siričitý" }],
  },
];

export const ALLERGENS: Allergen[] = ALLERGEN_GROUPS.flatMap((group) => group.allergens).sort(
  (a, b) => Number(a.code) - Number(b.code),
);

export const CUISINES = ["Slovenská", "Talianska", "Ázijská", "Vegánska", "Burger", "Stredomorská"] as const;

export const LOCATIONS: Record<string, string[]> = {
  Bratislava: ["Všetky časti", "Staré Mesto", "Ružinov", "Nové Mesto", "Petržalka"],
  Košice: ["Všetky časti", "Staré Mesto", "Sever", "Juh"],
};
