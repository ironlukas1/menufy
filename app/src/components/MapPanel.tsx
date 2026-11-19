import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Pane, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "./Icon";
import type { Restaurant } from "@/data/restaurants";
import { useProto } from "@/proto/ProtoContext";
import { CITY_CENTER } from "@/lib";

const escapeHtml = (value: string | null | undefined) =>
  String(value ?? "").replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );

const pin = (name: string | null | undefined, rating: number | null | undefined, selected: boolean, highlighted: boolean, dimmed: boolean) => {
  const safeRating = Number.isFinite(rating) ? (rating as number) : 0;
  const ratingLabel = safeRating.toFixed(1).replace(".", ",");
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin-shell ${selected ? "selected" : ""} ${highlighted ? "highlighted" : ""} ${dimmed ? "dimmed" : ""}"><span class="pin"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v5a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 6-5 10h5"/></svg><span class="pin-rating">${escapeHtml(ratingLabel)}</span></span><span class="pin-name">${escapeHtml(name)}</span></span>`,
    iconSize: [54, 36],
    iconAnchor: [22, 18],
  });
};

const boundsOf = (items: Restaurant[]) =>
  L.latLngBounds(items.map((r) => [r.lat, r.lng] as [number, number])).pad(0.3);

function Fit({ items, selected, expanded, user }: { items: Restaurant[]; selected: string | null; expanded: boolean; user: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      if (!(map as unknown as { _loaded?: boolean })._loaded) return;
      map.invalidateSize();
      const sel = items.find((r) => r.slug === selected);
      if (sel) map.flyTo([sel.lat, sel.lng], 15, { duration: 0.5 });
      else if (expanded && user) map.flyTo([user.lat, user.lng], 14, { duration: 0.5 });
      else if (items.length) map.fitBounds(boundsOf(items), { maxZoom: 14 });
    }, 60);
    return () => {
      clearTimeout(t);
      try {
        map.stop();
      } catch {
        /* map already removed */
      }
    };
  }, [map, items, selected, expanded, user]);
  return null;
}

function Interactive({ on }: { on: boolean }) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  useEffect(() => {
    const handlers = [map.dragging, map.touchZoom, map.scrollWheelZoom, map.doubleClickZoom, map.boxZoom, map.keyboard];
    handlers.forEach((h) => (on ? h.enable() : h.disable()));
  }, [map, on]);
  return null;
}

export default function MapPanel({
  items,
  selected,
  hovered,
  minRating,
  expanded,
  setExpanded,
  onPick,
}: {
  items: Restaurant[];
  selected: string | null;
  hovered: string | null;
  minRating: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onPick: (slug: string) => void;
}) {
  const { dark, geo, userPosition, locationError, requestLocation } = useProto();
  const user = geo === "granted" ? userPosition : null;
  const ratingFilterOn = minRating > 0;
  const matchesRating = (r: Restaurant) => Math.round(r.rating) >= minRating;

  // Hover is handled on the real DOM marker element. Rebuilding the Leaflet icon
  // on hover would replace that element and make nearby markers flicker.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMarkerEl = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    activeMarkerEl.current?.classList.remove("hovered");
  }, []);

  const activateMarker = (element: HTMLElement) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (activeMarkerEl.current && activeMarkerEl.current !== element) {
      activeMarkerEl.current.classList.remove("hovered");
    }
    element.classList.add("hovered");
    activeMarkerEl.current = element;
  };

  const deactivateMarker = (element: HTMLElement) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      element.classList.remove("hovered");
      if (activeMarkerEl.current === element) activeMarkerEl.current = null;
    }, 120);
  };

  const openMap = () => {
    setExpanded(true);
    requestLocation();
  };

  return (
    <aside className={`map-card ${expanded ? "expanded" : ""}`} aria-label="Mapa reštaurácií">
      <div className="map-header">
        <div>
          <span>Mapa reštaurácií</span>
          <small>{items.length} miest</small>
        </div>
        {expanded ? (
          <button className="map-close" onClick={() => setExpanded(false)} aria-label="Zavrieť mapu">
            <Icon name="close" size={18} />
          </button>
        ) : (
          <button className="map-open-btn" onClick={openMap}>
            <Icon name="map" size={16} /> Otvoriť mapu
          </button>
        )}
      </div>
      <div
        className={`map-canvas ${expanded ? "is-open" : ""} ${dark ? "dark-tiles" : ""}`}
      >
        <MapContainer
          center={[CITY_CENTER.lat, CITY_CENTER.lng]}
          zoom={13}
          bounds={items.length ? boundsOf(items) : undefined}
          boundsOptions={{ maxZoom: 14 }}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-tiles"
          />
          {user && (
            <Pane name="user-location" style={{ zIndex: 625 }}>
              <CircleMarker center={[user.lat, user.lng]} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2f6fe4", fillOpacity: 1 }} />
            </Pane>
          )}
          {items.map((r) => (
            <Marker
              key={r.slug + (r.slug === selected)}
              position={[r.lat, r.lng]}
              icon={pin(
                r.name,
                r.rating,
                r.slug === selected || r.slug === hovered,
                ratingFilterOn && matchesRating(r),
                ratingFilterOn && !matchesRating(r),
              )}
              zIndexOffset={r.slug === hovered ? 1000 : ratingFilterOn && matchesRating(r) ? 500 : 0}
              eventHandlers={{
                click: () => onPick(r.slug),
                mouseover: (event) => {
                  const element = (event.target as L.Marker).getElement();
                  if (element) activateMarker(element);
                },
                mouseout: (event) => {
                  const element = (event.target as L.Marker).getElement();
                  if (element) deactivateMarker(element);
                },
              }}
              title={r.name}
            />
          ))}
          <Interactive on={expanded} />
          {expanded && <ZoomControl position="topright" />}
          <Fit items={items} selected={selected} expanded={expanded} user={user} />
        </MapContainer>
        {!expanded && <div className="map-cover" onClick={openMap} aria-hidden="true" />}
      </div>
      {expanded && <p className="map-tip" role="status">
        {geo === "requesting"
          ? "Zisťujeme vašu polohu. Povoľte prístup v prehliadači."
          : locationError ??
            `${ratingFilterOn ? `Žlté markery zodpovedajú zvolenému hodnoteniu (${minRating}+). ` : ""}Nájazdom na marker zobrazíte celý názov, kliknutím reštauráciu vyfiltrujete.`}
        {locationError && <> <button className="inline-link plain" onClick={requestLocation}>Skúsiť znova</button></>}
      </p>}
    </aside>
  );
}
