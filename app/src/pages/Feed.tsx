import { useState } from "react";
import { useOutletContext } from "react-router";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import SelectField from "@/components/SelectField";
import RestaurantCard from "@/components/RestaurantCard";
import { LOCATIONS } from "@/data/allergens";
import { DAYS } from "@/data/restaurants";
import { useRestaurants } from "@/proto/RestaurantContext";
import type { BrowseCtx } from "./Browse";
import { useProto } from "@/proto/ProtoContext";

export default function Feed() {
  const { f, set, results, query, pinned, setPinned, reset, setHovered } = useOutletContext<BrowseCtx>();
  const { restaurants } = useRestaurants();
  const { geo, loggedIn } = useProto();
  const [allOpen, setAllOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const n = results.length;
  const noun = n === 1 ? "reštaurácia" : n >= 2 && n <= 4 ? "reštaurácie" : "reštaurácií";

  return (
    <>
      <div className="results-header">
        <div>
          <button
            className="section-kicker city-kicker"
            onClick={() => setCityOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={cityOpen}
          >
            <Icon name="location" size={13} />
            {f.city}
            {f.district !== "Všetky časti" ? ` – ${f.district}` : ""}
            <Icon name="chevron" size={13} />
          </button>
          <h2>Menu vo vašom okolí</h2>
          <p>
            {n} {noun} · {DAYS[f.day].short === "Dnes" ? "dnešné menu" : DAYS[f.day].label} ·{" "}
            <button className="inline-link plain" onClick={() => setAllOpen(!allOpen)} aria-pressed={allOpen}>
              {allOpen ? "Skryť všetky menu" : "Zobraziť všetky menu"}
            </button>
          </p>
        </div>
        <SelectField label="Zoradiť výsledky" value={f.sort} onChange={(v) => set({ sort: v as typeof f.sort })}>
          <option value="rating">Najlepšie hodnotené</option>
          <option value="price">Najnižšia cena</option>
          {loggedIn && <option value="favorites">Len obľúbené</option>}
          <option value="distance">{geo === "granted" ? "Najbližšie" : "Najbližšie k centru"}</option>
        </SelectField>
      </div>

      {pinned && (
        <div className="active-filter">
          <span>
            Reštaurácia: <strong>{restaurants.find((place) => place.slug === pinned)?.name}</strong>
          </span>
          <button onClick={() => setPinned(null)}>
            <Icon name="close" size={16} /> Zrušiť
          </button>
        </div>
      )}

      <div className="restaurant-list">
        {results.map(({ r, distance }) => (
          <RestaurantCard
            key={r.slug}
            r={r}
            day={f.day}
            excluded={f.excluded}
            maxPrice={f.maxPrice}
            query={query}
            distance={distance}
            selected={pinned === r.slug}
            menuOpen={allOpen}
            onHover={setHovered}
          />
        ))}
        {n === 0 && (
          <div className="empty-state">
            <span>
              <Icon name="search" size={26} />
            </span>
            <h3>Nenašli sme vhodné menu</h3>
            <p>Skúste upraviť vyhľadávanie alebo zrušiť niektoré filtre.</p>
            <button onClick={reset}>Zobraziť všetky menu</button>
          </div>
        )}
      </div>

      {cityOpen && (
        <Modal title="Zmeniť mesto" onClose={() => setCityOpen(false)} className="glass">
          <div className="city-list">
            {Object.keys(LOCATIONS).map((c) => (
              <button
                key={c}
                className={c === f.city ? "on" : ""}
                onClick={() => {
                  set({ city: c, district: "Všetky časti" });
                  setCityOpen(false);
                }}
              >
                <Icon name="location" size={17} />
                {c}
                {c === f.city && (
                  <span className="city-check">
                    <Icon name="check" size={17} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="muted city-hint">Mestskú časť viete doladiť vo Filtroch.</p>
        </Modal>
      )}
    </>
  );
}
