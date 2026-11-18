import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { useRestaurants } from "@/proto/RestaurantContext";

/**
 * Search field with restaurant/dish suggestions. `applied` is the query that
 * actually filters the results; typing only fills `draft` until the user
 * submits or picks a suggestion.
 */
export default function SearchBox({
  applied,
  onApply,
  onSubmit,
  onOpen,
}: {
  applied: string;
  onApply: (q: string) => void;
  onSubmit: () => void;
  onOpen: (slug: string) => void;
}) {
  const { restaurants } = useRestaurants();
  const [draft, setDraft] = useState(applied);
  const [focus, setFocus] = useState(false);

  useEffect(() => setDraft(applied), [applied]);

  const q = draft.trim().toLocaleLowerCase("sk");
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
  }, [q, restaurants]);
  const show = focus && q && (places.length > 0 || dishes.length > 0);

  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        setFocus(false);
        onApply(draft);
        onSubmit();
      }}
    >
      <Icon name="search" size={20} />
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 120)}
        placeholder="Hľadať jedlo (napr. sviečková) alebo reštauráciu…"
        aria-label="Hľadať jedlo alebo reštauráciu"
        role="combobox"
        aria-expanded={!!show}
      />
      {draft && (
        <button
          type="button"
          className="clear-search"
          onClick={() => {
            setDraft("");
            onApply("");
          }}
          aria-label="Vymazať vyhľadávanie"
        >
          <Icon name="close" size={16} />
        </button>
      )}
      <button type="submit" className="search-action">Hľadať</button>
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
                <button
                  key={d.name}
                  onMouseDown={() => {
                    setDraft(d.name);
                    onApply(d.name);
                  }}
                  role="option"
                >
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
    </form>
  );
}
