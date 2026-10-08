import { useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import Icon from "@/components/Icon";
import SelectField from "@/components/SelectField";
import MapPanel from "@/components/MapPanel";
import { ALLERGENS, CUISINES, LOCATIONS } from "@/data/allergens";
import { DAYS, dailyFor, restaurants, type Restaurant } from "@/data/restaurants";
import { CITY_CENTER, USER_POS, distanceKm } from "@/lib";
import { useProto } from "@/proto/ProtoContext";

export type Filters = {
  day: number;
  city: string;
  district: string;
  cuisines: string[];
  excluded: string[];
  maxPrice: number;
  delivery: boolean;
  minRating: number;
  sort: "rating" | "price" | "distance";
};

export const MAX_PRICE = 15;

const initial: Filters = {
  day: 0,
  city: "Bratislava",
  district: "Všetky časti",
  cuisines: [],
  excluded: [],
  maxPrice: MAX_PRICE,
  delivery: false,
  minRating: 0,
  sort: "rating",
};

export type BrowseCtx = {
  f: Filters;
  set: (p: Partial<Filters>) => void;
  query: string;
  setQuery: (q: string) => void;
  results: { r: Restaurant; distance: number }[];
  pinned: string | null;
  setPinned: (s: string | null) => void;
  reset: () => void;
  activeCount: number;
};

function Search({
  query,
  setQuery,
  onOpen,
}: {
  query: string;
  setQuery: (q: string) => void;
  onOpen: (slug: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  const q = query.trim().toLocaleLowerCase("sk");
  const places = q ? restaurants.filter((r) => r.name.toLocaleLowerCase("sk").includes(q)).slice(0, 4) : [];
  const dishes = useMemo(() => {
    if (!q) return [];
    const seen = new Map<string, { name: string; place: string }>();
    restaurants.forEach((r) =>
      [...r.daily.flat(), ...r.standard].forEach((it) => {
        if (it.name.toLocaleLowerCase("sk").includes(q) && !seen.has(it.name)) seen.set(it.name, { name: it.name, place: r.name });
      }),
    );
    return [...seen.values()].slice(0, 5);
  }, [q]);
  const show = focus && q && (places.length > 0 || dishes.length > 0);

  return (
    <div className="search-box">
      <Icon name="search" size={22} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 120)}
        placeholder="Hľadať jedlo (napr. sviečková) alebo reštauráciu…"
        aria-label="Hľadať jedlo alebo reštauráciu"
        role="combobox"
        aria-expanded={!!show}
      />
      {query && (
        <button className="clear-search" onClick={() => setQuery("")} aria-label="Vymazať vyhľadávanie">
          <Icon name="close" size={17} />
        </button>
      )}
      <button className="search-action">Hľadať</button>
      {show && (
        <div className="search-menu" role="listbox">
          {places.length > 0 && (
            <>
              <span className="search-group">Reštaurácie</span>
              {places.map((r) => (
                <button key={r.slug} onMouseDown={() => onOpen(r.slug)} role="option">
                  <span className="mini-logo">{r.initials}</span>
                  <span>
                    {r.name}
                    <small>{r.address}</small>
                  </span>
                </button>
              ))}
            </>
          )}
          {dishes.length > 0 && (
            <>
              <span className="search-group">Jedlá</span>
              {dishes.map((d) => (
                <button key={d.name} onMouseDown={() => setQuery(d.name)} role="option">
                  <span className="mini-logo dish">
                    <Icon name="search" size={14} />
                  </span>
                  <span>
                    {d.name}
                    <small>napr. {d.place}</small>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Browse() {
  const { slug } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { geo } = useProto();
  const [f, setF] = useState<Filters>(initial);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [pinned, setPinned] = useState<string | null>(null);
  const [bannerOff, setBannerOff] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const isIndex = loc.pathname === "/";

  const set = (p: Partial<Filters>) => setF((c) => ({ ...c, ...p }));
  const origin = geo === "granted" ? USER_POS : CITY_CENTER;

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("sk");
    return restaurants
      .filter((r) => r.city === f.city)
      .filter((r) => f.district === "Všetky časti" || r.district === f.district)
      .filter((r) => !f.cuisines.length || r.cuisines.some((c) => f.cuisines.includes(c)))
      .filter((r) => !f.delivery || r.delivery.available)
      .filter((r) => r.rating >= f.minRating)
      .filter((r) => !pinned || r.slug === pinned)
      .filter((r) => {
        const items = dailyFor(r, f.day).filter(
          (it) => it.price <= f.maxPrice && !it.allergens.some((a) => f.excluded.includes(String(a))),
        );
        if (!items.length) return false;
        if (!q) return true;
        return r.name.toLocaleLowerCase("sk").includes(q) || items.some((it) => it.name.toLocaleLowerCase("sk").includes(q));
      })
      .map((r) => ({ r, distance: distanceKm(origin, r) }))
      .sort((a, b) => {
        if (f.sort === "distance") return a.distance - b.distance;
        if (f.sort === "price") {
          const avg = (x: Restaurant) => dailyFor(x, f.day).reduce((s, i) => s + i.price, 0) / dailyFor(x, f.day).length;
          return avg(a.r) - avg(b.r);
        }
        return b.r.rating - a.r.rating;
      });
  }, [f, query, pinned, origin]);

  const activeCount = [
    f.delivery,
    f.maxPrice < MAX_PRICE,
    f.minRating > 0,
    f.excluded.length > 0,
    f.cuisines.length > 0,
    !!pinned,
  ].filter(Boolean).length;

  const reset = () => {
    setF({ ...initial, city: f.city });
    setQuery("");
    setPinned(null);
  };

  const mapItems = useMemo(() => restaurants.filter((r) => r.city === f.city), [f.city]);

  const pick = (s: string) => {
    setPinned(s);
    setMapExpanded(false);
    if (!isIndex) nav("/");
    setTimeout(() => feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const ctx: BrowseCtx = { f, set, query, setQuery, results, pinned, setPinned, reset, activeCount };

  return (
    <>
      {isIndex && (
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-orb hero-orb-one" />
            <div className="hero-orb hero-orb-two" />
          </div>
          <div className="hero-inner">
            <p className="eyebrow">Dobrý obed je bližšie, než si myslíte</p>
            <h1>Čo si dáte dnes?</h1>
            <p className="hero-copy">Objavte najlepšie denné menu vo vašom okolí. Čerstvé, prehľadné a bez zdĺhavého hľadania.</p>
            <div className="search-controls">
              <Search query={query} setQuery={setQuery} onOpen={(s) => nav(`/restaurant/${s}`)} />
              <button
                className={`hero-filter-button ${filtersOpen ? "active" : ""}`}
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
              >
                <Icon name="filter" size={19} />
                <span>Filtre</span>
                {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
              </button>
            </div>
          </div>
        </section>
      )}

      {isIndex && filtersOpen && (
        <section className="filters-wrap open" aria-label="Filtre">
          <div className="filters-heading">
            <div>
              <strong>Filtrovať ponuku</strong>
              <span>Prispôsobte si výsledky podľa vašich preferencií</span>
            </div>
            <button onClick={() => setFiltersOpen(false)} aria-label="Zavrieť filtre">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="primary-filters">
            <SelectField icon="calendar" label="Deň" value={String(f.day)} onChange={(v) => set({ day: Number(v) })}>
              {DAYS.map((d, i) => (
                <option key={d.label} value={i}>
                  {d.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              icon="location"
              label="Mesto"
              value={f.city}
              onChange={(v) => set({ city: v, district: "Všetky časti" })}
            >
              {Object.keys(LOCATIONS).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectField>
            <SelectField label="Mestská časť" value={f.district} onChange={(v) => set({ district: v })}>
              {LOCATIONS[f.city].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </SelectField>
          </div>
          <div className="filter-block">
            <span className="filter-title">Kuchyňa</span>
            <div className="chips">
              {CUISINES.map((c) => (
                <button
                  key={c}
                  className={`chip ${f.cuisines.includes(c) ? "on" : ""}`}
                  aria-pressed={f.cuisines.includes(c)}
                  onClick={() =>
                    set({ cuisines: f.cuisines.includes(c) ? f.cuisines.filter((x) => x !== c) : [...f.cuisines, c] })
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <span className="filter-title">
              Bez alergénov <small>(vylúčiť jedlá obsahujúce)</small>
            </span>
            <div className="chips allergen-grid">
              {ALLERGENS.map((a) => (
                <button
                  key={a.code}
                  className={`chip ${f.excluded.includes(a.code) ? "on danger" : ""}`}
                  aria-pressed={f.excluded.includes(a.code)}
                  onClick={() =>
                    set({
                      excluded: f.excluded.includes(a.code)
                        ? f.excluded.filter((x) => x !== a.code)
                        : [...f.excluded, a.code],
                    })
                  }
                >
                  <b>{a.code}</b> {a.name}
                </button>
              ))}
            </div>
          </div>
          <div className="advanced-filters">
            <label className="range-field">
              <span>
                Max. cena: <strong>{f.maxPrice >= MAX_PRICE ? "bez limitu" : `${f.maxPrice} €`}</strong>
              </span>
              <input
                type="range"
                min={6}
                max={MAX_PRICE}
                step={1}
                value={f.maxPrice}
                onChange={(e) => set({ maxPrice: Number(e.target.value) })}
                aria-label="Maximálna cena"
              />
            </label>
            <SelectField label="Hodnotenie" value={String(f.minRating)} onChange={(v) => set({ minRating: Number(v) })}>
              <option value="0">Akékoľvek hodnotenie</option>
              <option value="4.5">4,5 a viac</option>
              <option value="4.8">4,8 a viac</option>
            </SelectField>
            <label className="check-field">
              <input type="checkbox" checked={f.delivery} onChange={(e) => set({ delivery: e.target.checked })} />
              <span className="custom-check">{f.delivery && <Icon name="check" size={14} />}</span>
              <Icon name="truck" size={19} /> Len s donáškou
            </label>
            <button className="reset-button" onClick={reset}>
              Zrušiť filtre
            </button>
          </div>
        </section>
      )}

      <section className={`content-wrap ${mapExpanded ? "map-open" : ""}`}>
        <div className="results-column" ref={feedRef}>
          {geo === "denied" && isIndex && !bannerOff && (
            <div className="geo-banner" role="status">
              <Icon name="location" size={18} />
              <div>
                <strong>Polohu nemáme k dispozícii</strong>
                <span>Zobrazujeme okolie centra mesta. Vyberte mesto a mestskú časť v Filtroch.</span>
              </div>
              <button
                onClick={() => {
                  setFiltersOpen(true);
                  setBannerOff(true);
                }}
              >
                Vybrať
              </button>
            </div>
          )}
          <Outlet context={ctx} />
        </div>
        <MapPanel
          items={mapItems}
          selected={slug ?? pinned}
          expanded={mapExpanded}
          setExpanded={setMapExpanded}
          onPick={pick}
        />
      </section>
    </>
  );
}
