import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "./Icon";
import type { Restaurant } from "@/data/restaurants";
import { useProto } from "@/proto/ProtoContext";
import { CITY_CENTER, USER_POS } from "@/lib";

const pin = (label: string, selected: boolean) =>
  L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin ${selected ? "selected" : ""}"><b>${label}</b></span>`,
    iconSize: [44, 36],
    iconAnchor: [22, 18],
  });

const boundsOf = (items: Restaurant[]) =>
  L.latLngBounds(items.map((r) => [r.lat, r.lng] as [number, number])).pad(0.3);

function Fit({ items, selected, expanded }: { items: Restaurant[]; selected: string | null; expanded: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      const sel = items.find((r) => r.slug === selected);
      if (sel) map.flyTo([sel.lat, sel.lng], 15, { duration: 0.5 });
      else if (items.length) map.fitBounds(boundsOf(items), { maxZoom: 14 });
    }, 60);
    return () => clearTimeout(t);
  }, [map, items, selected, expanded]);
  return null;
}

export default function MapPanel({
  items,
  selected,
  expanded,
  setExpanded,
  onPick,
}: {
  items: Restaurant[];
  selected: string | null;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onPick: (slug: string) => void;
}) {
  const { dark, geo } = useProto();
  const user = geo === "granted" ? USER_POS : null;

  return (
    <aside className={`map-card ${expanded ? "expanded" : ""}`} aria-label="Mapa reštaurácií">
      <div className="map-header">
        <div>
          <span>Mapa reštaurácií</span>
          <small>{items.length} miest</small>
        </div>
        {expanded && (
          <button onClick={() => setExpanded(false)} aria-label="Zavrieť mapu">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>
      <div className={`map-canvas ${expanded ? "is-open" : ""} ${dark ? "dark-tiles" : ""}`}>
        <MapContainer
          center={[CITY_CENTER.lat, CITY_CENTER.lng]}
          zoom={13}
          bounds={items.length ? boundsOf(items) : undefined}
          boundsOptions={{ maxZoom: 14 }}
          scrollWheelZoom={expanded}
          dragging={expanded}
          zoomControl={expanded}
          doubleClickZoom={expanded}
          touchZoom={expanded}
          keyboard={expanded}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-tiles"
          />
          {user && (
            <CircleMarker center={[user.lat, user.lng]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2f6fe4", fillOpacity: 1 }} />
          )}
          {items.map((r) => (
            <Marker
              key={r.slug + (r.slug === selected)}
              position={[r.lat, r.lng]}
              icon={pin(r.rating.toFixed(1).replace(".", ","), r.slug === selected)}
              eventHandlers={{ click: () => onPick(r.slug) }}
              keyboard={expanded}
              title={r.name}
            />
          ))}
          <Fit items={items} selected={selected} expanded={expanded} />
        </MapContainer>
        {!expanded && (
          <button className="map-overlay" onClick={() => setExpanded(true)}>
            <span>
              <Icon name="map" size={22} />
            </span>
            <strong>Otvoriť mapu</strong>
            <small>Pozrite si reštaurácie vo svojom okolí</small>
          </button>
        )}
      </div>
      {expanded && <p className="map-tip">Kliknutím na marker vyfiltrujete vybranú reštauráciu.</p>}
    </aside>
  );
}
