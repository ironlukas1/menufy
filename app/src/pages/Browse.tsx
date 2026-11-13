import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import Icon from "@/components/Icon";
import SelectField from "@/components/SelectField";
import MapPanel from "@/components/MapPanel";
import { ALLERGENS, CUISINES, LOCATIONS } from "@/data/allergens";
import { DAYS, dailyFor, type Restaurant } from "@/data/restaurants";
import { CITY_CENTER, distanceKm, nextAt, openStatus } from "@/lib";
import { useRestaurants } from "@/proto/RestaurantContext";
import { useProto } from "@/proto/ProtoContext";
import { useUi } from "@/proto/UiContext";

export type Filters = {
  day: number;
  city: string;
  district: string;
  cuisines: string[];
  excluded: string[];
  maxPrice: number;
  delivery: boolean;
  minRating: number;
  openAt: string;
  sort: "rating" | "price" | "distance" | "favorites";
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
  openAt: "",
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
  setHovered: (s: string | null) => void;
};

export default function Browse() {
  const { restaurants } = useRestaurants();
  const { slug } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { geo, favorites, userPosition, requestLocation } = useProto();
  const { query, setQuery, filtersOpen, setFiltersOpen, mapOpen, setMapOpen, setActiveFilters } = useUi();
  const [f, setF] = useState<Filters>(initial);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [bannerOff, setBannerOff] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const isIndex = loc.pathname === "/";

  const set = (p: Partial<Filters>) => setF((c) => ({ ...c, ...p }));
  const origin = geo === "granted" && userPosition ? userPosition : CITY_CENTER;

  useEffect(() => {
    if (geo === "unknown") requestLocation();
  }, []);

  useEffect(() => {
    if (!userPosition) return;
    const near = restaurants.reduce((a, b) => (distanceKm(userPosition, a) <= distanceKm(userPosition, b) ? a : b));
    set({ city: near.city, district: "Všetky časti", sort: "distance" });
  }, [userPosition, restaurants]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("sk");
    return restaurants
      .filter((r) => r.city === f.city)
      .filter((r) => f.district === "Všetky časti" || r.district === f.district)
      .filter((r) => !f.cuisines.length || r.cuisines.some((c) => f.cuisines.includes(c)))
      .filter((r) => !f.delivery || r.delivery.available)
      .filter((r) => !f.openAt || openStatus(r, nextAt(f.openAt)).open)
      .filter((r) => Math.round(r.rating) >= f.minRating)
      .filter((r) => !pinned || r.slug === pinned)
      .filter((r) => f.sort !== "favorites" || favorites.includes(r.slug))
      .filter((r) => {
        const dayMenu = dailyFor(r, f.day);
        const items = (r.live && !dayMenu.length ? r.standard : dayMenu).filter(
          (it) => it.price <= f.maxPrice && !it.allergens.some((a) => f.excluded.includes(String(a))),
        );
        const publishesMenu = r.daily.some((d) => d.length) || r.standard.length > 0;
        if (!items.length && publishesMenu) return false;
        if (!q) return true;
        return r.name.toLocaleLowerCase("sk").includes(q) || items.some((it) => it.name.toLocaleLowerCase("sk").includes(q));
      })
      .map((r) => ({ r, distance: distanceKm(origin, r) }))
      .sort((a, b) => {
        if (f.sort === "distance") return a.distance - b.distance;
        if (f.sort === "price") {
          const avg = (x: Restaurant) => {
            const m = dailyFor(x, f.day);
            return m.length ? m.reduce((s, i) => s + i.price, 0) / m.length : Infinity;
          };
          return avg(a.r) - avg(b.r);
        }
        return b.r.rating - a.r.rating;
      });
  }, [f, query, pinned, origin, favorites, restaurants]);

  const activeCount =
    [f.delivery, f.maxPrice < MAX_PRICE, f.minRating > 0, !!f.openAt, !!pinned].filter(Boolean).length +
    f.excluded.length +
    f.cuisines.length;

  useEffect(() => setActiveFilters(activeCount), [activeCount, setActiveFilters]);

  const reset = () => {
    setF({ ...initial, city: f.city });
    setQuery("");
    setPinned(null);
  };

  const mapItems = useMemo(() => restaurants.filter((r) => r.city === f.city), [f.city, restaurants]);

  const pick = (s: string) => {
    setPinned(null);
    setMapOpen(false);
    nav(`/restaurant/${s}`);
  };

  const ctx: BrowseCtx = { f, set, query, setQuery, results, pinned, setPinned, reset, activeCount, setHovered };

  return (
    <>
      {isIndex && filtersOpen && (
        <>
        <button className="panel-backdrop filters-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Zavrieť filtre" />
        <section className="filters-wrap filters-sheet open" aria-label="Filtre" role="dialog" aria-modal="true">
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
            <SelectField icon="clock" label="Otvorené o" value={f.openAt} onChange={(v) => set({ openAt: v })}>
              <option value="">Kedykoľvek</option>
              <option value="now">Teraz</option>
              {Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectField>
            <SelectField label="Hodnotenie" value={String(f.minRating)} onChange={(v) => set({ minRating: Number(v) })}>
              <option value="0">Akékoľvek hodnotenie</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} label={n === 5 ? "5 hviezdičiek" : `${n} ${n === 1 ? "hviezdička" : "hviezdičky"} a viac`}>
                  <span className="star-row" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Icon key={i} name="star" size={14} filled={i <= n} />
                    ))}
                  </span>
                  {n === 5 ? "5" : `${n} a viac`}
                </option>
              ))}
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
        </>
      )}

      <section className={`content-wrap ${slug ? "restaurant-view" : "browse-results"}`}>
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
      </section>
      {isIndex && mapOpen && (
        <div className="map-overlay" role="dialog" aria-modal="true" aria-label="Mapa reštaurácií">
          <button className="panel-backdrop map-backdrop" onClick={() => setMapOpen(false)} aria-label="Zavrieť mapu" />
          <MapPanel
            items={mapItems}
            selected={slug ?? pinned}
            hovered={hovered}
            expanded
            setExpanded={(expanded) => {
              setMapOpen(expanded);
              if (!expanded) setPinned(null);
            }}
            onPick={pick}
          />
        </div>
      )}
    </>
  );
}
