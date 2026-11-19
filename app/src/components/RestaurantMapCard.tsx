import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "./Icon";
import type { Restaurant } from "@/data/restaurants";
import { useProto } from "@/proto/ProtoContext";

const pin = (label: string) =>
  L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin selected"><b>${label}</b></span>`,
    iconSize: [44, 36],
    iconAnchor: [22, 18],
  });

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
  const position: [number, number] = [restaurant.lat, restaurant.lng];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address}`)}`;

  return (
    <section className="panel detail-map" id="location" aria-labelledby="location-heading">
      <div className="panel-head">
        <h3 id="location-heading">Poloha</h3>
        <a className="inline-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Otvoriť v mapách <Icon name="arrow" size={14} />
        </a>
      </div>
      <p className="detail-map-address">
        <Icon name="location" size={16} /> {restaurant.address}
      </p>
      <div className={`detail-map-canvas ${dark ? "dark-tiles" : ""}`}>
        <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-tiles"
          />
          <Marker position={position} icon={pin(restaurant.rating.toFixed(1).replace(".", ","))} title={restaurant.name} />
          <ZoomControl position="topright" />
          <Center lat={restaurant.lat} lng={restaurant.lng} />
        </MapContainer>
      </div>
    </section>
  );
}
