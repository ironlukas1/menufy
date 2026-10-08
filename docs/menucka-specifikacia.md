<div class="title-block" markdown="1">

# Menučka – denné menu v Bratislave

**Špecifikácia, dokumentácia a research** · verzia 1.0 · 17. 9. 2026 · autor: _doplniť_
<span class="note">„Menučka“ je pracovný názov. Pred spustením sa zmení, pozri riziko R4.</span>

</div>

## 1. Úvod a cieľ

**Problém.** Ľudia, ktorí chodia v práci na obed, hľadajú denné menu na viacerých portáloch a na Facebooku či Instagrame jednotlivých podnikov. Menu tam často visí iba ako fotka tabule alebo je neaktuálne. Reštaurácie zas musia to isté menu každé ráno prepisovať na niekoľko miest.

**Cieľ.** Mobilná webová aplikácia (PWA) pre Bratislavu s jedným jasným zdrojom denných menu:

- menu **zadávajú priamo reštaurácie**, bez zbierania dát z iných webov,
- návštevník nájde reštauráciu **iba podľa názvu alebo typu**,
- zadanie menu trvá reštaurácii do **2 minút**.

**Merateľné ciele po 6 mesiacoch:**

- ≥ **80** reštaurácií, ktoré aspoň 3 dni v týždni zverejnia menu,
- ≥ **80 %** menu zverejnených do 10:30 a medián času zadania menu **< 2 min**,
- **1 500** aktívnych používateľov denne v čase 11:00–13:30,
- ≥ **25 %** používateľov sa vráti aj po 30 dňoch.

## 2. Research

### 2.1 Konkurencia

| Služba | Čo ponúka | Vyhľadávanie | Appka | Model pre reštaurácie |
|---|---|---|---|---|
| **menucka.sk** | líder trhu, 16 000+ ľudí denne, 150 000+ návštev mesačne, magazín, widget na web | ulica, mesto, názov, vzdialenosť | Android, iOS | platený profil (od ~0,55 €/deň) |
| **obedvmeste.sk** | ~50+ podnikov v BA s menu (17. 9. 2026), alergény pri jedlách | mestská časť | Android, iOS, Huawei | vlastná administrácia |
| **restauracie.sme.sk** | 5 400+ podnikov, 2 100 denných menu (SR), hodnotenia | lokalita | – | profil reštaurácie |
| **menumenu.sk** | jednoduchý prehľad menu podľa dňa | mesto, mestská časť | – | neuvedené |
| **Wolt, Bolt Food** | donáška jedla, denné menu len okrajovo | adresa donášky | áno | provízia z objednávky |
| **FB/IG podnikov** | najrýchlejší kanál, menu často ako obrázok | – | – | zadarmo, ale bez štruktúry |

**Poučenie z histórie:** české Lunchtime.cz (obľúbené podniky, menu e-mailom) aj slovenské Obedovat.sk kúpil v roku 2014 Zomato. V rokoch 2023–2024 svoje dcérske firmy v SR aj ČR zlikvidoval. Globálna platforma teda nemusí lokálne denné menu udržať.

### 2.2 Fakty o trhu

- **Cena obeda:** priemerná platba za obed v SR dosiahla v auguste 2026 rekordných **9,53 €**. V Bratislavskom kraji bol priemer za január–august 2026 **9,27 €** (Edenred, index TRC). V centre Bratislavy stojí menu bežne ~11 €.
- **Stravné 2026:** stravovacia poukážka musí mať hodnotu aspoň **6,98 €**. Zamestnávateľ prispieva najmenej 55 % a daňovo uznaný príspevok je max. **5,12 €** (od 1. 12. 2025, § 152 Zákonníka práce). Zamestnanci teda majú každý deň „rozpočet“ na obed a hľadajú menu okolo 7–10 €.
- **Alergény:** podľa nariadenia EÚ 1169/2011 musí podnik informovať o 14 alergénoch. V SR sa bežne značia číslami 1–14.

### 2.3 Persony

<div class="cols" markdown="1">
<div markdown="1">

**Zuzana, 31 – analytička v kancelárii**
Na obed má 45 minút a platí stravovacou kartou. Chce za 30 sekúnd vidieť, čo dnes varia jej 3 obľúbené podniky. **Frustruje ju:** menu ako fotka na FB, neaktuálne weby a appky plné reklám.

</div>
<div markdown="1">

**Peter, 45 – majiteľ bistra v Starom Meste**
Menu píše o 8:30 na tabuľu a fotí ho na FB. Nemá čas ho prepisovať na 3 portály. **Chce:** viac hostí medzi 11:30 a 13:30 a čo najmenej administratívy.

</div>
</div>

**Záver researchu:** trh nie je prázdny, preto sa Menučka musí odlíšiť **jednoduchosťou** a **minimálnou prácou pre reštaurácie**:

- appka nepýta polohu, nemá mapu ani reklamy,
- menu sa dá zadať z fotky (AI import),
- pri každom menu je viditeľné, kedy bolo aktualizované.

<div class="page-break"></div>

## 3. Špecifikácia

### 3.1 Roly

| Rola | Čo môže |
|---|---|
| **Návštevník** (bez prihlásenia) | prezerať dnešné menu, hľadať podľa názvu a typu, otvoriť detail reštaurácie |
| **Používateľ** (prihlásený) | to isté + obľúbené reštaurácie a notifikácie |
| **Správca reštaurácie** | upravovať profil podniku, zadávať denné a týždenné menu, šablóny |
| **Administrátor** | schvaľovať reštaurácie, spravovať číselník typov, moderovať obsah |

### 3.2 Funkčné požiadavky

Priorita podľa MoSCoW: **M** = must, **S** = should, **C** = could.

| ID | Požiadavka | Priorita |
|---|---|---|
| FR-01 | **Dnešné menu:** úvodná obrazovka so zoznamom reštaurácií, ktoré majú menu na dnes. Pri každej je polievka, hlavné jedlá a ceny. | M |
| FR-02 | **Hľadanie podľa názvu:** výsledky sa zobrazujú počas písania. Ignoruje diakritiku a veľké písmená a toleruje preklep („kolkovna“ nájde „Kolkovňa“). | M |
| FR-03 | **Filter podľa typu:** výber jedného alebo viacerých typov z číselníka (napr. slovenská, talianska/pizza, ázijská, indická, vegetariánska/vegánska, burger/grill, bistro/kaviareň, jedáleň). Dá sa kombinovať s FR-02. | M |
| FR-04 | **Detail reštaurácie:** menu na dnes a na celý týždeň, ceny, alergény, adresa, otváracie hodiny, telefón a web. | M |
| FR-05 | **Registrácia reštaurácie:** podnik zadá IČO a kontakt, administrátor ho overí a až potom sa zverejní. | M |
| FR-06 | **Zadanie menu:** denné aj týždenné menu, kopírovanie minulého týždňa, šablóny stálych jedál, uloženie konceptu a zverejnenie. | M |
| FR-07 | **Administrácia:** schvaľovanie podnikov, správa typov, skrytie nevhodného obsahu, nahlásenie chyby v menu. | M |
| FR-08 | **Alergény 1–14** pri každom jedle a štítok vegetariánske/vegánske. | S |

**Mimo rozsahu (podľa zadania):**

- hľadanie podľa polohy, mapy alebo vzdialenosti,
- hľadanie podľa názvu jedla alebo podľa ceny,
- hodnotenia, objednávky, donáška a platby.

Adresa sa v detaile zobrazuje, ale nedá sa podľa nej vyhľadávať.

### 3.3 Nápady navyše

| ID | Nápad | Prečo | Priorita |
|---|---|---|---|
| X-01 | **AI import menu:** reštaurácia vloží fotku tabule, PDF alebo text z FB príspevku. Jazykový model z toho vytvorí jedlá, ceny a alergény a reštaurácia ich len skontroluje a zverejní. | odstraňuje hlavnú prekážku: prepisovanie menu | S |
| X-02 | **Obľúbené + notifikácie:** srdiečko pri reštaurácii. Keď podnik zverejní dnešné menu, používateľovi príde web push notifikácia. | Zuzana nemusí nič hľadať | S |
| X-03 | **Štítok aktuálnosti:** „aktualizované dnes 9:12“ alebo „menu na dnes ešte nie je“. Reštaurácia bez menu dostane o 9:00 pripomienku. | buduje dôveru v dáta | S |
| X-04 | **Widget a QR kód:** menu z Menučky sa zobrazí aj na webe reštaurácie a QR kód vedie na detail podniku. | menu stačí zadať raz | C |
| X-05 | **„Kam dnes?“:** náhodný výber z obľúbených reštaurácií, ktoré majú dnes menu. | rieši večnú otázku v kancelárii | C |

### 3.4 Nefunkčné požiadavky

- **Použiteľnosť:** navrhnuté najprv pre mobil, PWA sa dá nainštalovať na plochu, prístupnosť podľa WCAG 2.1 AA, rozhranie v slovenčine.
- **Výkon:** úvodná obrazovka sa načíta do 2,5 s na 4G (LCP) a hľadanie odpovie do 200 ms.
- **Dostupnosť:** 99,5 % v čase 10:00–14:00, keď je najväčšia návštevnosť.
- **Bezpečnosť a GDPR:** prihlásenie cez odkaz v e-maile (bez hesla), HTTPS, obmedzenie počtu požiadaviek (rate limit), minimum osobných údajov, dáta uložené v EÚ.

<div class="page-break"></div>

## 4. Technická dokumentácia

### 4.1 Architektúra

```text
 ┌──────────────────────┐   HTTPS/JSON   ┌───────────────────────┐     ┌─────────────────────────┐
 │  PWA (Next.js/React) │ ─────────────► │  REST API (Next.js,   │ ──► │ PostgreSQL              │
 │  návštevník · správca│ ◄───────────── │  TypeScript, Zod)     │     │ unaccent + pg_trgm      │
 │  Service Worker      │   Web Push     └──────────┬────────────┘     └─────────────────────────┘
 └──────────────────────┘                           │
                                     ┌──────────────┴───────────┬──────────────────────────┐
                                     ▼                          ▼                          ▼
                             LLM API (AI import)      Úložisko obrázkov (S3)      E-mail (magic link,
                             fotka → JSON menu        fotky menu, logá            pripomienky 9:00)
```

**Návrh stacku:**

- **Next.js** (frontend + API v jednom projekte) a **PostgreSQL** s ORM Drizzle,
- hosting v EÚ (napr. Hetzner alebo Vercel s databázou Neon vo Frankfurte),
- notifikácie cez Web Push (VAPID). Na iOS fungujú od verzie 16.4 pre PWA pridanú na plochu.

### 4.2 Dátový model

| Entita | Hlavné atribúty | Vzťahy |
|---|---|---|
| `Restaurant` | id, name, slug, name_search*, ico, address, phone, web, opening_hours (JSON), status (pending / active / hidden) | M:N `RestaurantType`, 1:N `Menu` |
| `RestaurantType` | id, name, slug, icon | M:N `Restaurant` (max. 3 typy na podnik) |
| `Menu` | id, restaurant_id, date, status (draft / published), published_at, note | 1:N `MenuItem`, unikátne (restaurant_id, date) |
| `MenuItem` | id, menu_id, course (polievka / hlavné / dezert), name, price_cents, allergens smallint[], is_vegetarian, is_vegan, position | N:1 `Menu` |
| `User` | id, email, role (user / manager / admin), push_subscription (JSON), created_at | 1:N `Favorite` |
| `RestaurantUser` | user_id, restaurant_id, role (owner / editor) | spája správcov s podnikmi |
| `Favorite` | user_id, restaurant_id, notify (bool) | – |

\* `name_search` je normalizovaný názov: malé písmená bez diakritiky, s trigramovým indexom GIN.

### 4.3 API (výber)

| Metóda a cesta | Popis | Prístup |
|---|---|---|
| `GET /api/restaurants?q=&type=` | hľadanie podľa názvu a/alebo typov + dnešné menu | verejné |
| `GET /api/restaurants/{slug}` | detail podniku a menu na týždeň | verejné |
| `GET /api/types` | číselník typov reštaurácií | verejné |
| `POST /api/restaurants/{id}/menus` · `PUT /api/menus/{id}` | vytvorenie, úprava a zverejnenie menu | správca |
| `POST /api/menus/import` | nahraná fotka/PDF/text → návrh menu (JSON) | správca |
| `POST` / `DELETE /api/favorites/{restaurantId}` | pridanie a odobratie obľúbeného podniku | používateľ |
| `PATCH /api/admin/restaurants/{id}` | schválenie alebo skrytie podniku | admin |

### 4.4 Vyhľadávanie (FR-02, FR-03)

1. Hľadaný text sa normalizuje (`lower` + `unaccent`): „Kolkovňa “ → „kolkovna“.
2. Databáza hľadá v `name_search` operátorom `ILIKE '%q%'` alebo trigramovou podobnosťou `similarity() > 0,3`. Vďaka tomu vydrží aj preklep.
3. Ak je vybraný typ, pridá sa **presný filter** `type.slug IN (…)`.
4. Poradie výsledkov: najprv podniky s dnešným menu, potom podľa podobnosti názvu, nakoniec abecedne. Počet výsledkov je obmedzený na 50.

### 4.5 Hlavné toky

- **Návštevník (3 kroky):** otvorí appku a vidí dnešné menu → napíše „pizz“ alebo klikne na typ „Talianska“ → otvorí detail podniku.
- **Reštaurácia (do 2 min):** prihlási sa cez odkaz v e-maile → klikne „Menu na dnes“ → odfotí tabuľu (AI import) alebo skopíruje včerajšie menu → skontroluje ceny a alergény → klikne **Zverejniť**. Používateľom, ktorí majú podnik v obľúbených, príde notifikácia.

<div class="page-break"></div>

## 5. Návrh obrazoviek (wireframy)

<div class="cols" markdown="1">
<div markdown="1">

```text
┌──────────────────────────────────┐
│ Menučka           štvrtok 17. 9. │
│ ┌──────────────────────────────┐ │
│ │ Hľadať reštauráciu...        │ │
│ └──────────────────────────────┘ │
│ [Všetky] [Slovenská] [Talianska] │
│ [Ázijská] [Vege] [Bistro]  ›     │
│──────────────────────────────────│
│ ♥ Bistro U Petra       slovenská │
│   ● aktualizované dnes 8:52      │
│   Polievka: Fazuľová      2,20 € │
│   1. Kurací rezeň, šalát  8,90 € │
│   2. Rizoto so špenátom   8,50 € │
│──────────────────────────────────│
│ ♡ Pizza Nápoli         talianska │
│   ○ menu na dnes ešte nie je     │
│──────────────────────────────────│
│ [ Kam dnes? ]                    │
└──────────────────────────────────┘
      Návštevník – úvodná obrazovka
```

</div>
<div markdown="1">

```text
┌──────────────────────────────────┐
│ ‹ Bistro U Petra – menu 17. 9.   │
│ ┌──────────────────────────────┐ │
│ │ Nahrať fotku menu (AI)       │ │
│ └──────────────────────────────┘ │
│ [Kopírovať včera] [Šablóna ▾]    │
│──────────────────────────────────│
│ Polievka                         │
│ [Fazuľová         ] [2,20] A:1   │
│ Hlavné jedlá                     │
│ [Kurací rezeň     ] [8,90] A:1,3 │
│ [Rizoto, špenát   ] [8,50] A:7   │
│ [+ Pridať jedlo]          ☑ vege │
│──────────────────────────────────│
│ Stav: koncept                    │
│ [Uložiť koncept]     [ZVEREJNIŤ] │
└──────────────────────────────────┘
    Správca reštaurácie – zadanie menu
```

</div>
</div>

## 6. Biznis model

- **Pre používateľov zadarmo**, bez reklám.
- **Reštaurácie – Základ (zadarmo):** profil, denné a týždenné menu, štítok aktuálnosti. Dôležité je rýchlo získať reštaurácie a menu.
- **Reštaurácie – Premium (návrh 9,90 €/mesiac):** AI import, widget a QR kód, štatistiky (zobrazenia, počet používateľov s podnikom v obľúbených), zvýraznenie vo výsledkoch. Pre porovnanie: platený profil na menucka.sk stojí od ~0,55 €/deň, teda ~16 €/mesiac.

## 7. Harmonogram

| Fáza | Čas | Obsah |
|---|---|---|
| **MVP** | týždeň 1 | UI návrh, dátový model, nastavenie projektu, CI |
| | týždne 2–3 | zoznam dnešných menu, hľadanie podľa názvu + typu, detail (FR-01 až FR-04) |
| | týždne 4–5 | registrácia a administrácia reštaurácie, zadanie menu, alergény (FR-05 až FR-08) |
| | týždeň 6 | test s 10 reštauráciami, opravy, spustenie |
| **v1.1** | +4 týždne | obľúbené + notifikácie (X-02), štítok aktuálnosti a pripomienky (X-03) |
| **v2** | +8 týždňov | AI import (X-01), widget a QR (X-04), Premium, anglická verzia |

## 8. Riziká

| # | Riziko | Opatrenie |
|---|---|---|
| R1 | **Málo obsahu na začiatku** | Bez reštaurácií nie sú používatelia a naopak. Osobne získať ~30 podnikov v 1–2 kancelárskych zónach (Mlynské nivy, Karadžičova), základ zadarmo. |
| R2 | **Neaktuálne menu** | Znižuje dôveru. Štítok aktuálnosti, pripomienka o 9:00, nahlásenie chyby, skrytie podniku bez menu 5 dní. |
| R3 | **Silná konkurencia** | menucka.sk a obedvmeste.sk už fungujú. Odlíšiť sa jednoduchosťou (bez polohy a reklám), AI importom a notifikáciami. |
| R4 | **Kolízia názvu** | Názov je zhodný s menucka.sk. Pred spustením vybrať nový a overiť doménu a ochrannú známku (ÚPV SR). |
| R5 | **Chyby AI importu** | Zlé ceny alebo alergény. Výsledok sa nikdy nezverejní automaticky, správca ho musí potvrdiť. |

<div class="sources" markdown="1">

**Zdroje** (overené 17. 9. 2026):

- menucka.sk – <https://menucka.sk/>
- Hotelier.sk, 7. 6. 2025 – <https://hotelier.sk/menucka-sk-oslavuje-10-rokov-digitalny-nastroj-pre-gastro-prevadzky-aj-hotelove-restauracie/>
- obedvmeste.sk – <https://obedvmeste.sk/denne-menu/bratislava> · menumenu.sk – <https://menumenu.sk/bratislava/dnes>
- restauracie.sme.sk – <https://restauracie.sme.sk/>
- SME Index, 14. 9. 2026 (Edenred TRC) – <https://www.sme.sk/index/c/priemerna-utrata-za-obed-v-auguste-dosiahla-rekordnych-9-53-eura>
- tnlive.sk, 21. 7. 2026 – <https://tnlive.sk/domace/clanok/1041845>
- Podnikajte.sk, stravné 2026 – <https://www.podnikajte.sk/stravne-a-pracovne-cesty/stravne-2026-tabulka>
- Nariadenie (EÚ) č. 1169/2011, príloha II – <https://eur-lex.europa.eu/eli/reg/2011/1169/oj>
- Inc42, likvidácia Zomato Slovakia – <https://inc42.com/buzz/now-zomato-dissolves-its-slovakian-subsidiary/>

</div>
