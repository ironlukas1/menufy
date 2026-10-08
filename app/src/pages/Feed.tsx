import { useOutletContext } from "react-router";
import Icon from "@/components/Icon";
import SelectField from "@/components/SelectField";
import RestaurantCard from "@/components/RestaurantCard";
import { DAYS, bySlug } from "@/data/restaurants";
import type { BrowseCtx } from "./Browse";
import { useProto } from "@/proto/ProtoContext";

export default function Feed() {
  const { f, set, results, query, pinned, setPinned, reset } = useOutletContext<BrowseCtx>();
  const { geo } = useProto();
  const n = results.length;
  const noun = n === 1 ? "reštaurácia" : n >= 2 && n <= 4 ? "reštaurácie" : "reštaurácií";

  return (
    <>
      <div className="results-header">
        <div>
          <p className="section-kicker">
            {f.city}
            {f.district !== "Všetky časti" ? ` – ${f.district}` : ""}
          </p>
          <h2>Menu vo vašom okolí</h2>
          <p>
            {n} {noun} · {DAYS[f.day].short === "Dnes" ? "dnešné menu" : DAYS[f.day].label}
          </p>
        </div>
        <SelectField label="Zoradiť výsledky" value={f.sort} onChange={(v) => set({ sort: v as typeof f.sort })}>
          <option value="rating">Najlepšie hodnotené</option>
          <option value="price">Najnižšia cena</option>
          <option value="distance">{geo === "granted" ? "Najbližšie" : "Najbližšie k centru"}</option>
        </SelectField>
      </div>

      {pinned && (
        <div className="active-filter">
          <span>
            Reštaurácia: <strong>{bySlug(pinned)?.name}</strong>
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
    </>
  );
}
