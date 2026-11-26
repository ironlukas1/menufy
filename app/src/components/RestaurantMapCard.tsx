import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "./Icon";
import type { Restaurant } from "@/data/restaurants";
import { googleMapsUrl } from "@/data/restaurantSettings";
import { CITY_CENTER } from "@/lib";
import { useProto } from "@/proto/ProtoContext";

const escapeHtml = (value: string | null | undefined) =>
  String(value ?? "").replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );

const pin = (label: string | null | undefined, name: string | null | undefined) => {
  const safeName = name ?? "";
  const safeLabel = label || safeName.slice(0, 2) || "?";
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin-shell selected"><span class="pin"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v5a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 6-5 10h5"/></svg><span class="pin-rating">${escapeHtml(safeLabel)}</span></span><span class="pin-name">${escapeHtml(safeName)}</span></span>`,
    iconSize: [54, 36],
    iconAnchor: [22, 18],
  });
};

function Center({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], 16);
    }, 60);
    return () => clearTimeout(t);
  }, [map, lat, lng]);
  return null;
}

export default function RestaurantMapCard({ restaurant }: { restaurant: Restaurant }) {
  const { dark } = useProto();
  const validCoords = Number.isFinite(restaurant.lat) && Number.isFinite(restaurant.lng);
  const lat = validCoords ? restaurant.lat : CITY_CENTER.lat;
  const lng = validCoords ? restaurant.lng : CITY_CENTER.lng;
  const position: [number, number] = [lat, lng];
  const mapsUrl = googleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address}`)}`);
  const ratingLabel = Number.isFinite(restaurant.rating) ? restaurant.rating.toFixed(1).replace(".", ",") : "—";

  return (
    <section className="panel detail-map" id="location" aria-labelledby="location-heading">
      <div className="panel-head">
        <h3 id="location-heading">Poloha</h3>
        {mapsUrl && (
          <a className="inline-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Otvoriť v mapách <Icon name="arrow" size={14} />
          </a>
        )}
      </div>
      <p className="detail-map-address">
        <Icon name="location" size={16} /> {restaurant.address}
      </p>
      {!validCoords && <p className="muted">Poloha reštaurácie nie je k dispozícii.</p>}
      <div className={`detail-map-canvas ${dark ? "dark-tiles" : ""}`}>
        <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-tiles"
          />
          {validCoords && <Marker position={position} icon={pin(ratingLabel, restaurant.name)} title={restaurant.name} />}
          <ZoomControl position="topright" />
          <Center lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </section>
  );
}
