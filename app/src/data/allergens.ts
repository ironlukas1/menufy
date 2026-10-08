export const ALLERGENS: { code: string; name: string }[] = [
  { code: "1", name: "Obilniny s lepkom" },
  { code: "2", name: "Kôrovce" },
  { code: "3", name: "Vajcia" },
  { code: "4", name: "Ryby" },
  { code: "5", name: "Arašidy" },
  { code: "6", name: "Sója" },
  { code: "7", name: "Mlieko" },
  { code: "8", name: "Orechy" },
  { code: "9", name: "Zeler" },
  { code: "10", name: "Horčica" },
  { code: "11", name: "Sezam" },
  { code: "12", name: "Oxid siričitý" },
  { code: "13", name: "Vlčí bôb" },
  { code: "14", name: "Mäkkýše" },
];

export const CUISINES = ["Slovenská", "Talianska", "Ázijská", "Vegánska", "Burger", "Stredomorská"] as const;

export const LOCATIONS: Record<string, string[]> = {
  Bratislava: ["Všetky časti", "Staré Mesto", "Ružinov", "Nové Mesto", "Petržalka"],
  Košice: ["Všetky časti", "Staré Mesto"],
};
