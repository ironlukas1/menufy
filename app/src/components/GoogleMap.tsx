import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/data/restaurants";
import { CITY_CENTER } from "@/lib";

type LatLng = { lat: number; lng: number };

type GMap = {
  panTo(p: LatLng): void;
  fitBounds(b: GBounds, opts?: { padding?: number; maxZoom?: number }): void;
};

type GBounds = { extend(p: LatLng): void };

type GMarker = {
  addListener(ev: string, cb: () => void): void;
  setZIndex(n: number): void;
  setMap(m: GMap | null): void;
};

type GoogleMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
    Marker: new (opts: Record<string, unknown>) => GMarker;
    Circle: new (opts: Record<string, unknown>) => { setMap(m: GMap | null): void };
    LatLngBounds: new () => GBounds;
    Size: new (w: number, h: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    SymbolPath: { CIRCLE: number };
  };
};

/** True when a Google Maps key is configured; otherwise the OSM map is used. */
export const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

let pending: Promise<GoogleMaps> | null = null;

function loadMaps(key: string) {
  if (pending) return pending;
  pending = new Promise<GoogleMaps>((resolve, reject) => {
    const w = window as unknown as { google?: GoogleMaps };
    if (w.google?.maps) {
      resolve(w.google);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&language=sk&region=SK`;
    script.async = true;
    script.onload = () =>
      w.google?.maps ? resolve(w.google) : reject(new Error("Google Maps sa nenačítali."));
    script.onerror = () => {
      pending = null;
      reject(new Error("Google Maps sa nenačítali. Skontrolujte kľúč a pripojenie."));
    };
    document.head.appendChild(script);
  });
  return pending;
}

const DARK = [
  { elementType: "geometry", stylers: [{ color: "#1d2a22" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#93a89a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#14201a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b3a30" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#12241b" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1b2f22" }] },
];

const pin = (g: GoogleMaps, label: string, active: boolean) => {
  const fill = active ? "#1f6b3f" : "#ffffff";
  const stroke = active ? "#1f6b3f" : "#cfe0d5";
  const text = active ? "#ffffff" : "#1f6b3f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52"><path d="M22 51C22 51 41 33 41 20A19 19 0 1 0 3 20c0 13 19 31 19 31Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/><text x="22" y="25" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="${text}">${label}</text></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(44, 52),
    anchor: new g.maps.Point(22, 51),
  };
};

export default function GoogleMap({
  items,
  selected,
  hovered,
  user,
  dark,
  onPick,
  onError,
}: {
  items: Restaurant[];
  selected: string | null;
  hovered: string | null;
  user: { lat: number; lng: number } | null;
  dark: boolean;
  onPick: (slug: string) => void;
  onError?: (message: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<GoogleMaps | null>(null);
  const map = useRef<GMap | null>(null);
  const markers = useRef<{ slug: string; marker: GMarker }[]>([]);
  const [ready, setReady] = useState(false);
  // Kept in a ref so a fresh callback from the parent does not rebuild pins.
  const pick = useRef(onPick);
  pick.current = onPick;

  // Create the map once; the key is baked in at build time.
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key || !host.current) return;
    let dead = false;

    loadMaps(key)
      .then((g) => {
        if (dead || !host.current) return;
        api.current = g;
        map.current = new g.maps.Map(host.current, {
          center: { lat: CITY_CENTER.lat, lng: CITY_CENTER.lng },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: dark ? DARK : undefined,
        });
        setReady(true);
      })
      .catch((e: Error) => {
        if (!dead) onError?.(e.message);
      });

    return () => {
      dead = true;
      markers.current.forEach((m) => m.marker.setMap(null));
      markers.current = [];
      map.current = null;
      setReady(false);
    };
    // The map instance outlives theme/prop changes; markers sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pins for every restaurant in the chosen area.
  useEffect(() => {
    const g = api.current;
    const m = map.current;
    if (!ready || !g || !m) return;

    markers.current.forEach((x) => x.marker.setMap(null));
    markers.current = items.map((r) => {
      const active = r.slug === selected || r.slug === hovered;
      const marker = new g.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map: m,
        title: r.name,
        icon: pin(g, r.rating.toFixed(1).replace(".", ","), active),
        zIndex: active ? 10 : 0,
      });
      marker.addListener("click", () => pick.current(r.slug));
      return { slug: r.slug, marker };
    });

    const bounds = new g.maps.LatLngBounds();
    items.forEach((r) => bounds.extend({ lat: r.lat, lng: r.lng }));
    const chosen = items.find((r) => r.slug === selected);
    if (chosen) m.panTo({ lat: chosen.lat, lng: chosen.lng });
    else if (user) m.panTo(user);
    else if (items.length) m.fitBounds(bounds, { padding: 48, maxZoom: 14 });
  }, [ready, items, selected, hovered, user]);

  // The user's own position, drawn once per fix.
  useEffect(() => {
    const g = api.current;
    const m = map.current;
    if (!ready || !g || !m || !user) return;
    const dot = new g.maps.Circle({
      map: m,
      center: user,
      radius: 90,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      fillColor: "#2f6fe4",
      fillOpacity: 1,
    });
    return () => dot.setMap(null);
  }, [ready, user]);

  return <div className="google-map" ref={host} />;
}
