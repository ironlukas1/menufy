import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Pane, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "@/components/Icon";
import type { Restaurant } from "@/data/restaurants";
import { useProto } from "@/proto/ProtoContext";
import { CITY_CENTER } from "@/lib";

type NativeMapWindow = Window & {
  webkit?: { messageHandlers?: { menufyNativeChrome?: { postMessage: (message: unknown) => void } } };
};

const pin = (label: string, selected: boolean) =>
  L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin ${selected ? "selected" : ""}"><b>${label}</b></span>`,
    iconSize: [44, 36],
    iconAnchor: [22, 18],
  });

const boundsOf = (items: Restaurant[]) =>
  L.latLngBounds(items.map((r) => [r.lat, r.lng] as [number, number])).pad(0.3);

function Fit({ items, selected, user }: { items: Restaurant[]; selected: string | null; user: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      if (!(map as unknown as { _loaded?: boolean })._loaded) return;
      map.invalidateSize();
      const sel = items.find((r) => r.slug === selected);
      if (sel) map.flyTo([sel.lat, sel.lng], 15, { duration: 0.5 });
      else if (user) map.flyTo([user.lat, user.lng], 14, { duration: 0.5 });
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
  }, [map, items, selected, user]);
  return null;
}

function Interactive() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

/**
 * Full interactive map, shown in a floating glass overlay from the top-bar
 * map button. Clicking a marker pins that restaurant to the results.
 */
export default function MapPanel({
  items,
  selected,
  hovered,
  onPick,
  onClose,
}: {
  items: Restaurant[];
  selected: string | null;
  hovered: string | null;
  onPick: (slug: string) => void;
  onClose: () => void;
}) {
  const { dark, geo, userPosition, locationError, requestLocation } = useProto();
  const user = geo === "granted" ? userPosition : null;

  useEffect(() => {
    const canvas = document.querySelector<HTMLElement>(".map-canvas");
    if (!canvas) return;
    const report = () => {
      const rect = canvas.getBoundingClientRect();
      (window as NativeMapWindow).webkit?.messageHandlers?.menufyNativeChrome?.postMessage({
        type: "menufy:native-map",
        rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
        selected,
        user,
        restaurants: items.map(({ slug, name, lat, lng, rating }) => ({ slug, name, lat, lng, rating })),
      });
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(canvas);
    window.addEventListener("resize", report);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", report);
    };
  }, [items, selected, user]);

  useEffect(() => {
    const pick = (event: Event) => {
      const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
      if (slug) onPick(slug);
    };
    window.addEventListener("menufy:native-map-pick", pick);
    return () => window.removeEventListener("menufy:native-map-pick", pick);
  }, [onPick]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);

  return (
    <div className="map-panel" aria-label="Mapa reštaurácií">
      <div className="map-header">
        <div>
          <span>Mapa reštaurácií</span>
          <small>{items.length} miest</small>
        </div>
        <button className="map-close-btn" data-chrome="map-close" type="button" onClick={onClose} aria-label="Zavrieť mapu">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className={`map-canvas ${dark ? "dark-tiles" : ""}`}>
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
              icon={pin(r.rating.toFixed(1).replace(".", ","), r.slug === selected || r.slug === hovered)}
              zIndexOffset={r.slug === hovered ? 1000 : 0}
              eventHandlers={{ click: () => onPick(r.slug) }}
              title={r.name}
            />
          ))}
          <Interactive />
          <ZoomControl position="topright" />
          <Fit items={items} selected={selected} user={user} />
        </MapContainer>
      </div>
      <p className="map-tip" role="status">
        {geo === "requesting" ? "Zisťujeme vašu polohu. Povoľte prístup v prehliadači." : locationError ?? "Kliknutím na marker vyfiltrujete vybranú reštauráciu."}
        {locationError && <> <button className="inline-link plain" onClick={requestLocation}>Skúsiť znova</button></>}
      </p>
    </div>
  );
}
