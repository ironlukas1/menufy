export type Notice = {
  id: string;
  kind: "menu" | "offer" | "system";
  title: string;
  body: string;
  time: string;
  slug?: string;
};

export const notices: Notice[] = [
  { id: "n1", kind: "menu", title: "Bistro Mlyn zverejnil dnešné menu", body: "Tekvicový krém, kuracie supreme a hubové rizoto.", time: "Dnes 9:12", slug: "bistro-mlyn" },
  { id: "n2", kind: "offer", title: "Oliva Kitchen: -10 % na losos", body: "Zľava platí pri objednávke do 13:00.", time: "Dnes 8:40", slug: "oliva-kitchen" },
  { id: "n3", kind: "menu", title: "Pri jednom stole zverejnil dnešné menu", body: "Dnes varia hovädzie líčka a pečenú cviklu.", time: "Dnes 8:05", slug: "pri-jednom-stole" },
  { id: "n4", kind: "system", title: "Nové filtre alergénov", body: "Vylúčiť môžete všetkých 14 alergénov naraz.", time: "Včera 16:20" },
  { id: "n5", kind: "offer", title: "Burger Garage: Burger týždňa", body: "BBQ chicken burger so šalátom za 8,90 €.", time: "Pondelok 10:00", slug: "burger-garage" },
  { id: "n6", kind: "system", title: "Plánovaná údržba", body: "V nedeľu medzi 2:00 a 3:00 nebude služba dostupná.", time: "5. 10." },
];
