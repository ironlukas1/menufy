import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { LOCATIONS } from "@/data/allergens";
import { useProto } from "@/proto/ProtoContext";
import { useUi } from "@/proto/UiContext";

/** Area (city) picker for the left side of the top bar. */
export default function AreaPicker() {
  const { city, setCity } = useUi();
  const { geo, requestLocation } = useProto();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="area-picker" ref={ref}>
      <button
        className={`area-btn${open ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Oblasť: ${city}`}
      >
        <Icon name="location" size={16} />
        <span className="area-btn-label">{city}</span>
        <Icon name="chevron" size={14} />
      </button>

      {open && (
        <div className="area-menu" role="listbox" aria-label="Vyberte oblasť">
          <span className="area-menu-title">Oblasť</span>
          <div className="city-list">
            {Object.keys(LOCATIONS).map((c) => (
              <button
                key={c}
                role="option"
                aria-selected={c === city}
                className={c === city ? "on" : ""}
                onClick={() => {
                  setCity(c);
                  setOpen(false);
                }}
              >
                <Icon name="location" size={15} />
                {c}
                {c === city && (
                  <span className="city-check">
                    <Icon name="check" size={15} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            className="area-locate"
            onClick={() => {
              requestLocation();
              setOpen(false);
            }}
          >
            <Icon name="map" size={15} />
            {geo === "granted" ? "Aktualizovať moju polohu" : "Použiť moju polohu"}
          </button>
        </div>
      )}
    </div>
  );
}
