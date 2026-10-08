export type MenuItem = {
  name: string;
  desc: string;
  weight: string;
  allergens: number[];
  price: number;
  tag: string;
};

export type Review = { author: string; stars: number; date: string; text: string };

export type Restaurant = {
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  cuisines: string[];
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  web: string;
  rating: number;
  ratingCount: number;
  lat: number;
  lng: number;
  delivery: { available: boolean; eta: string };
  hours: [string, string][];
  todayHours: string;
  image: string;
  gallery: string[];
  daily: MenuItem[][];
  standard: MenuItem[];
  reviews: Review[];
};

export const DAYS = [
  { label: "Dnes, štvrtok 8. 10.", short: "Dnes" },
  { label: "Zajtra, piatok 9. 10.", short: "Piatok" },
  { label: "Pondelok 12. 10.", short: "Pondelok" },
  { label: "Utorok 13. 10.", short: "Utorok" },
];

const IMG = [
  "https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  "https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  "https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
];

const WEEK = (wd: string, sat = "Zatvorené", sun = "Zatvorené"): [string, string][] => [
  ["Pondelok", wd],
  ["Utorok", wd],
  ["Streda", wd],
  ["Štvrtok", wd],
  ["Piatok", wd],
  ["Sobota", sat],
  ["Nedeľa", sun],
];

const i = (name: string, desc: string, weight: string, allergens: number[], price: number, tag: string): MenuItem => ({
  name,
  desc,
  weight,
  allergens,
  price,
  tag,
});

const reviews = (...r: [string, number, string, string][]): Review[] =>
  r.map(([author, stars, date, text]) => ({ author, stars, date, text }));

export const restaurants: Restaurant[] = [
  {
    slug: "bistro-mlyn",
    name: "Bistro Mlyn",
    initials: "BM",
    tagline: "Moderná slovenská kuchyňa",
    cuisines: ["Slovenská"],
    city: "Bratislava",
    district: "Ružinov",
    address: "Mlynské nivy 12, Ružinov",
    phone: "+421 910 234 567",
    email: "obed@bistromlyn.sk",
    web: "bistromlyn.sk",
    rating: 4.8,
    ratingCount: 312,
    lat: 48.1465,
    lng: 17.126,
    delivery: { available: true, eta: "30 – 45 min" },
    hours: WEEK("11:00 – 15:00"),
    todayHours: "11:00 – 15:00",
    image: IMG[0],
    gallery: [IMG[0], IMG[1], IMG[2]],
    daily: [
      [
        i("Tekvicový krém, pražené semienka", "Hokkaido tekvica, smotana, tekvicový olej", "0,33 l", [7, 8], 3.2, "Polievka"),
        i("Kuracie supreme, zemiakové pyré, hrášok", "Kuracie prsia s kožou, maslové pyré, hrášok", "150 / 200 g", [7], 9.9, "Menu 1"),
        i("Hubové rizoto s parmezánom", "Šampiňóny, hliva, parmezán 24 mes.", "350 g", [7, 9], 8.9, "Vege"),
      ],
      [
        i("Hrachová polievka s údeným", "Žltý hrach, údené mäso, majorán", "0,33 l", [1, 9], 2.9, "Polievka"),
        i("Bravčová pečienka, knedľa, kapusta", "Pečená krkovička, domáca knedľa", "150 / 200 g", [1, 3], 9.5, "Menu 1"),
        i("Gnocchi so šalviou a tekvicou", "Zemiakové gnocchi, maslo, šalvia", "330 g", [1, 3, 7], 8.7, "Vege"),
      ],
    ],
    standard: [
      i("Hovädzí burger Mlyn", "Hovädzie 180 g, cheddar, lokálna žemľa", "320 g", [1, 3, 7, 10], 10.9, "Stále"),
      i("Caesar šalát s kuracím", "Rímsky šalát, parmezán, krutóny", "300 g", [1, 3, 4, 7], 8.5, "Stále"),
    ],
    reviews: reviews(
      ["Zuzana K.", 5, "pred 2 dňami", "Najlepšie denné menu na Nivách. Porcie sú poriadne a obsluha rýchla."],
      ["Peter M.", 4, "pred týždňom", "Dobré jedlo, v čase obeda je plno. Odporúčam prísť skôr."],
    ),
  },
  {
    slug: "oliva-kitchen",
    name: "Oliva Kitchen",
    initials: "OK",
    tagline: "Stredomorská kuchyňa",
    cuisines: ["Stredomorská", "Talianska"],
    city: "Bratislava",
    district: "Ružinov",
    address: "Prievozská 6, Ružinov",
    phone: "+421 948 112 390",
    email: "ahoj@olivakitchen.sk",
    web: "olivakitchen.sk",
    rating: 4.6,
    ratingCount: 187,
    lat: 48.15,
    lng: 17.1335,
    delivery: { available: true, eta: "25 – 40 min" },
    hours: WEEK("10:30 – 14:30", "12:00 – 20:00"),
    todayHours: "10:30 – 14:30",
    image: IMG[1],
    gallery: [IMG[1], IMG[2], IMG[0]],
    daily: [
      [
        i("Paradajková polievka s bazalkou", "Pečené paradajky, bazalka, olivový olej", "0,33 l", [7], 2.9, "Polievka"),
        i("Grilovaný losos, kuskus, jogurtový dip", "Filet z lososa, citrón, mäta", "150 / 180 g", [4, 7], 11.9, "Menu 1"),
        i("Cícerový šalát s fetou a olivami", "Cícer, feta, uhorka, červená cibuľa", "380 g", [7], 8.5, "Fit"),
      ],
      [
        i("Minestrone", "Sezónna zelenina, fazuľa, parmezán", "0,33 l", [7, 9], 2.9, "Polievka"),
        i("Penne arrabbiata s kuracím", "Pikantná paradajková omáčka", "350 g", [1], 9.2, "Menu 1"),
        i("Falafel tanier s hummusom", "Falafel, hummus, tahini, pita", "360 g", [1, 11], 8.8, "Vege"),
      ],
    ],
    standard: [
      i("Margherita", "Paradajky, mozzarella, bazalka", "450 g", [1, 7], 7.9, "Stále"),
      i("Tiramisu", "Mascarpone, espresso, kakao", "140 g", [1, 3, 7], 4.2, "Dezert"),
    ],
    reviews: reviews(
      ["Marek D.", 5, "pred 3 dňami", "Losos bol výborný, kuskus nie je suchý ako inde."],
      ["Jana S.", 4, "pred 2 týždňami", "Príjemné prostredie, menu mení každý deň."],
    ),
  },
  {
    slug: "pri-jednom-stole",
    name: "Pri jednom stole",
    initials: "PJ",
    tagline: "Poctivá domáca kuchyňa",
    cuisines: ["Slovenská"],
    city: "Bratislava",
    district: "Staré Mesto",
    address: "Záhradnícka 21, Staré Mesto",
    phone: "+421 903 875 221",
    email: "rezervacie@jednostol.sk",
    web: "jednostol.sk",
    rating: 4.9,
    ratingCount: 428,
    lat: 48.1492,
    lng: 17.1235,
    delivery: { available: false, eta: "" },
    hours: WEEK("11:00 – 15:30"),
    todayHours: "11:00 – 15:30",
    image: IMG[2],
    gallery: [IMG[2], IMG[0], IMG[1]],
    daily: [
      [
        i("Slepačí vývar s domácimi rezancami", "Vývar z domácej slepice, mrkva", "0,33 l", [1, 3, 9], 3.1, "Polievka"),
        i("Hovädzie líčka, tarhoňa, koreňová zelenina", "Pomaly dusené 6 hodín", "150 / 200 g", [1, 9], 12.5, "Menu 1"),
        i("Pečená cvikla, kozí syr, vlašské orechy", "Teplý šalát s medovou vinaigrette", "320 g", [7, 8], 8.9, "Vege"),
      ],
      [
        i("Kapustnica", "Tradičná sviatočná kapustnica", "0,33 l", [1], 3.0, "Polievka"),
        i("Hovädzia sviečková na smotane, knedľa", "Sviečková, brusnice, šľahačka", "120 / 200 g", [1, 3, 7, 9, 10], 11.9, "Menu 1"),
        i("Bryndzové halušky", "Bryndza, slanina, jarná cibuľka", "350 g", [1, 3, 7], 8.2, "Menu 2"),
      ],
    ],
    standard: [i("Domáci jablkový závin", "Orechy, škorica, vanilková poleva", "150 g", [1, 3, 7, 8], 3.5, "Dezert")],
    reviews: reviews(
      ["Eva H.", 5, "pred 4 dňami", "Sviečková ako od babičky. Rezervácie nutné."],
      ["Tomáš R.", 5, "pred týždňom", "Za tú cenu najlepšia domáca kuchyňa v centre."],
    ),
  },
  {
    slug: "wok-bar-nivy",
    name: "Wok Bar Nivy",
    initials: "WB",
    tagline: "Ázijská kuchyňa",
    cuisines: ["Ázijská"],
    city: "Bratislava",
    district: "Petržalka",
    address: "Einsteinova 24, Petržalka",
    phone: "+421 902 444 019",
    email: "info@wokbar.sk",
    web: "wokbar.sk",
    rating: 4.4,
    ratingCount: 256,
    lat: 48.1287,
    lng: 17.1096,
    delivery: { available: true, eta: "35 – 50 min" },
    hours: WEEK("11:00 – 21:00", "11:00 – 21:00", "12:00 – 20:00"),
    todayHours: "11:00 – 21:00",
    image: IMG[1],
    gallery: [IMG[1], IMG[0], IMG[2]],
    daily: [
      [
        i("Miso polievka s tofu", "Miso pasta, tofu, wakame", "0,3 l", [6], 3.2, "Polievka"),
        i("Kuracie pad thai", "Ryžové rezance, arašidy, limetka", "380 g", [3, 5, 6, 14], 9.4, "Menu 1"),
        i("Zeleninový wok so sójou", "Brokolica, paprika, sójové mäso", "350 g", [6, 11], 8.4, "Vege"),
      ],
      [
        i("Kokosová polievka", "Kokosové mlieko, citrónová tráva", "0,3 l", [], 3.2, "Polievka"),
        i("Teriyaki losos s ryžou", "Losos, teriyaki, sezam", "150 / 200 g", [4, 6, 11], 11.2, "Menu 1"),
        i("Tofu curry", "Červené curry, tofu, jazmínová ryža", "380 g", [6], 8.6, "Vege"),
      ],
    ],
    standard: [i("Vietnamské jarné závitky", "Krevety, mäta, arašidová omáčka", "4 ks", [2, 5, 6], 5.9, "Stále")],
    reviews: reviews(["Lucia B.", 4, "pred 5 dňami", "Rýchle, chutné, trochu bez fantázie. Pad thai je ale top."]),
  },
  {
    slug: "burger-garage",
    name: "Burger Garage",
    initials: "BG",
    tagline: "Burgre a grill",
    cuisines: ["Burger"],
    city: "Bratislava",
    district: "Nové Mesto",
    address: "Račianske mýto 2, Nové Mesto",
    phone: "+421 905 300 700",
    email: "garage@burgergarage.sk",
    web: "burgergarage.sk",
    rating: 4.5,
    ratingCount: 391,
    lat: 48.1578,
    lng: 17.1186,
    delivery: { available: true, eta: "30 – 40 min" },
    hours: WEEK("11:00 – 22:00", "11:00 – 23:00", "12:00 – 21:00"),
    todayHours: "11:00 – 22:00",
    image: IMG[0],
    gallery: [IMG[0], IMG[2], IMG[1]],
    daily: [
      [
        i("Cibuľová polievka", "Gratinovaná so syrom", "0,33 l", [1, 7], 3.0, "Polievka"),
        i("Classic burger + hranolky", "Hovädzie, cheddar, kyslá uhorka", "180 / 150 g", [1, 3, 7, 10], 9.9, "Menu 1"),
        i("Falafel burger", "Falafel, hummus, rukola", "330 g", [1, 11], 8.9, "Vege"),
      ],
      [
        i("Kuracia polievka", "S rezancami", "0,33 l", [1, 3, 9], 2.8, "Polievka"),
        i("BBQ chicken burger", "Kuracie stehno, BBQ, coleslaw", "300 g", [1, 3, 10], 9.7, "Menu 1"),
        i("Batátové hranolky s dipom", "Aioli dip, sea salt", "250 g", [3], 6.2, "Vege"),
      ],
    ],
    standard: [i("Milkshake vanilka", "Vanilkový zmrzlinový shake", "0,4 l", [7], 4.5, "Nápoj")],
    reviews: reviews(["Adam P.", 5, "pred 2 dňami", "Najlepší burger na obede. Ceny férové."]),
  },
  {
    slug: "zelena-lyzica",
    name: "Zelená lyžica",
    initials: "ZL",
    tagline: "Vegánska a vegetariánska kuchyňa",
    cuisines: ["Vegánska"],
    city: "Bratislava",
    district: "Staré Mesto",
    address: "Obchodná 40, Staré Mesto",
    phone: "+421 917 100 205",
    email: "ahoj@zelenalyzica.sk",
    web: "zelenalyzica.sk",
    rating: 4.7,
    ratingCount: 144,
    lat: 48.1496,
    lng: 17.1103,
    delivery: { available: false, eta: "" },
    hours: WEEK("11:00 – 16:00", "Zatvorené", "Zatvorené"),
    todayHours: "11:00 – 16:00",
    image: IMG[2],
    gallery: [IMG[2], IMG[1], IMG[0]],
    daily: [
      [
        i("Šošovicová polievka s kokosom", "Červená šošovica, kokos, kurkuma", "0,33 l", [9], 2.9, "Polievka"),
        i("Quinoa bowl s pečenou zeleninou", "Quinoa, batáty, avokádo", "380 g", [6, 11], 8.9, "Vegán"),
        i("Cuketové placky, cesnaková plnka", "Z cukety a ryžovej múky", "320 g", [3], 8.2, "Vege"),
      ],
      [
        i("Krémová brokolicová", "Bez smotany, s mandľami", "0,33 l", [8], 2.9, "Polievka"),
        i("Pestrý tempeh s ryžou", "Tempeh, teriyaki, zelenina", "350 g", [6, 11], 9.1, "Vegán"),
        i("Cícerové curry", "Kokosové mlieko, špenát", "380 g", [], 8.6, "Vegán"),
      ],
    ],
    standard: [i("Smoothie bowl", "Banán, bobule, granola", "320 g", [8], 6.5, "Stále")],
    reviews: reviews(["Katarína V.", 5, "pred 3 dňami", "Konečne vegánske menu, ktoré zasýti."]),
  },
  {
    slug: "trattoria-ponte",
    name: "Trattoria Ponte",
    initials: "TP",
    tagline: "Talianska kuchyňa",
    cuisines: ["Talianska"],
    city: "Bratislava",
    district: "Staré Mesto",
    address: "Hviezdoslavovo nám. 18, Staré Mesto",
    phone: "+421 911 223 344",
    email: "tavolo@trattoriaponte.sk",
    web: "trattoriaponte.sk",
    rating: 4.3,
    ratingCount: 520,
    lat: 48.1437,
    lng: 17.1066,
    delivery: { available: true, eta: "40 – 55 min" },
    hours: WEEK("11:30 – 22:00", "11:30 – 23:00", "11:30 – 21:00"),
    todayHours: "11:30 – 22:00",
    image: IMG[1],
    gallery: [IMG[1], IMG[0], IMG[2]],
    daily: [
      [
        i("Ribollita", "Toskánska zeleninová polievka", "0,33 l", [1, 9], 3.4, "Polievka"),
        i("Spaghetti carbonara", "Guanciale, pecorino, žĺtok", "350 g", [1, 3, 7], 10.5, "Menu 1"),
        i("Pizza funghi", "Hlivy, šampiňóny, mozzarella", "430 g", [1, 7], 9.4, "Vege"),
      ],
      [
        i("Krémová zo sladkej kukurice", "S pancettou", "0,33 l", [7], 3.2, "Polievka"),
        i("Lasagne bolognese", "Domáce lasagne", "380 g", [1, 3, 7, 9], 10.2, "Menu 1"),
        i("Caprese s focaccio", "Paradajky, mozzarella, bazalka", "300 g", [1, 7], 8.9, "Vege"),
      ],
    ],
    standard: [i("Panna cotta", "Vanilka, malinový coulis", "130 g", [7], 4.5, "Dezert")],
    reviews: reviews(["Martin Z.", 4, "pred týždňom", "Centrum, takže ceny vyššie, ale kvalita sedí."]),
  },
  {
    slug: "koliba-hrebenky",
    name: "Koliba Hrebienok",
    initials: "KH",
    tagline: "Slovenská kuchyňa",
    cuisines: ["Slovenská"],
    city: "Košice",
    district: "Staré Mesto",
    address: "Hlavná 52, Košice",
    phone: "+421 905 111 202",
    email: "obedy@kolibahrebienok.sk",
    web: "kolibahrebienok.sk",
    rating: 4.6,
    ratingCount: 98,
    lat: 48.7208,
    lng: 21.2581,
    delivery: { available: true, eta: "30 – 45 min" },
    hours: WEEK("10:30 – 21:00", "11:00 – 22:00", "11:00 – 20:00"),
    todayHours: "10:30 – 21:00",
    image: IMG[2],
    gallery: [IMG[2], IMG[1], IMG[0]],
    daily: [
      [
        i("Fazuľová na kyslo", "S údeným mäsom a klobásou", "0,33 l", [1, 9], 3.0, "Polievka"),
        i("Kapustové pirohy s bryndzou", "Pirohy, slanina, kyslá smotana", "350 g", [1, 3, 7], 8.4, "Menu 1"),
      ],
      [
        i("Gulášová polievka", "Hovädzí guláš, zemiaky", "0,33 l", [1, 9], 3.0, "Polievka"),
        i("Pečená kačica, červená kapusta", "Kačacie stehno, lokše", "150 / 250 g", [1, 3], 11.5, "Menu 1"),
      ],
    ],
    standard: [i("Bryndzové halušky", "Bryndza, slanina", "400 g", [1, 3, 7], 8.9, "Stále")],
    reviews: reviews(["Ján T.", 5, "pred 6 dňami", "Pirohy ako doma."]),
  },
];

export const bySlug = (slug: string | undefined) => restaurants.find((r) => r.slug === slug);

export const formatPrice = (n: number) => n.toFixed(2).replace(".", ",") + " €";

export const avgPrice = (r: Restaurant, day = 0) => {
  const m = r.daily[day === 0 ? 0 : 1];
  return m.reduce((s, x) => s + x.price, 0) / m.length;
};

export const dailyFor = (r: Restaurant, day: number) => r.daily[day === 0 ? 0 : 1];
