import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useProto } from "@/proto/ProtoContext";

function Pick({ onPick, disabled }: { onPick: (lat: string, lng: string) => void; disabled: boolean }) {
  useMapEvents({ click(event) { if (!disabled) onPick(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6)); } });
  return null;
}
function Center({ city }: { city: string }) {
  const map = useMap();
  useEffect(() => { map.setView(city === "Košice" ? [48.7209, 21.2578] : [48.1486, 17.1077], 14); }, [city, map]);
  return null;
}
export default function OwnerLocationPicker({ city, lat, lng, onPick, disabled }: {
  city: string; lat: string; lng: string; onPick: (lat: string, lng: string) => void; disabled: boolean;
}) {
  const { dark } = useProto();
  const selected = lat !== "" && lng !== "" && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
  return <div className={`owner-location-map ${dark ? "dark-tiles" : ""}`} aria-label="Kliknutím označte polohu reštaurácie">
    <MapContainer center={[48.1486, 17.1077]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="osm-tiles" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <Center city={city} /><Pick disabled={disabled} onPick={onPick} />
      {selected && <CircleMarker center={[Number(lat), Number(lng)]} radius={10} pathOptions={{ color: "#fff", weight: 3, fillColor: "#176b43", fillOpacity: 1 }} />}
    </MapContainer>
  </div>;
}
