import { useMemo, useState } from "react";
import Icon from "./Icon";
import Modal from "./Modal";
import { LOCATIONS } from "@/data/allergens";
import { useRestaurants } from "@/proto/RestaurantContext";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sk");

const countLabel = (n: number) => `${n} ${n === 1 ? "reštaurácia" : n >= 2 && n <= 4 ? "reštaurácie" : "reštaurácií"}`;

export default function CityPicker({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (city: string) => void;
  onClose: () => void;
}) {
  const { restaurants } = useRestaurants();
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const cities = useMemo(() => Object.keys(LOCATIONS).sort((a, b) => a.localeCompare(b, "sk")), []);
  const counts = useMemo(
    () =>
      restaurants.reduce<Record<string, number>>((acc, r) => {
        acc[r.city] = (acc[r.city] ?? 0) + 1;
        return acc;
      }, {}),
    [restaurants],
  );
  const available = useMemo(() => new Set(cities.map((c) => normalize(c)[0]?.toUpperCase())), [cities]);
  const filtered = cities.filter(
    (city) => (!letter || normalize(city).startsWith(letter.toLocaleLowerCase("sk"))) && normalize(city).includes(normalize(query.trim())),
  );

  return (
    <Modal title="Vyberte mesto" onClose={onClose}>
      <div className="city-picker">
        <label className="city-search">
          <Icon name="search" size={18} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLetter(null);
            }}
            placeholder="Hľadať mesto…"
            aria-label="Hľadať mesto"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Vymazať hľadanie">
              <Icon name="close" size={15} />
            </button>
          )}
        </label>

        <div className="city-letters" role="group" aria-label="Vybrať mesto podľa písmena">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              disabled={!available.has(l)}
              className={letter === l ? "on" : ""}
              aria-pressed={letter === l}
              onClick={() => setLetter(letter === l ? null : l)}
            >
              {l}
            </button>
          ))}
        </div>

        <ul className="city-list">
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                className={city === value ? "selected" : ""}
                onClick={() => {
                  onPick(city);
                  onClose();
                }}
              >
                <Icon name="location" size={16} />
                <span>
                  {city}
                  <small>{countLabel(counts[city] ?? 0)}</small>
                </span>
                {city === value && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="city-empty">Žiadne mesto neodpovedá hľadaniu.</li>}
        </ul>
      </div>
    </Modal>
  );
}
