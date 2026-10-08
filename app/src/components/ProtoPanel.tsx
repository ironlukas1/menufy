import { useState } from "react";
import { useNavigate } from "react-router";
import { useProto } from "@/proto/ProtoContext";

const states = [
  { label: "Login – chyba hesla", to: "/login?state=error" },
  { label: "Registrácia – duplicitný e-mail", to: "/login?mode=signup&state=duplicate" },
  { label: "Registrácia – heslá sa líšia", to: "/login?mode=signup&state=mismatch" },
  { label: "Zabudnuté heslo – úspech", to: "/forgot-password?state=found" },
  { label: "Zabudnuté heslo – e-mail nenájdený", to: "/forgot-password?state=missing" },
  { label: "Nové heslo", to: "/reset-password" },
];

export default function ProtoPanel() {
  const { loggedIn, setLoggedIn, geo, setGeo } = useProto();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  return (
    <div className="proto">
      {open && (
        <div className="proto-body">
          <strong>Prototyp</strong>
          <div className="proto-row">
            <button className={!loggedIn ? "on" : ""} onClick={() => setLoggedIn(false)}>
              Hosť
            </button>
            <button className={loggedIn ? "on" : ""} onClick={() => setLoggedIn(true)}>
              Prihlásený
            </button>
          </div>
          <span className="proto-label">Poloha</span>
          <div className="proto-row">
            <button className={geo === "granted" ? "on" : ""} onClick={() => setGeo("granted")}>
              Povolená
            </button>
            <button className={geo === "denied" ? "on" : ""} onClick={() => setGeo("denied")}>
              Zamietnutá
            </button>
          </div>
          <span className="proto-label">Stavy obrazoviek</span>
          {states.map((s) => (
            <button key={s.to} className="proto-link" onClick={() => nav(s.to)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      <button className="proto-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Prototyp {loggedIn ? "· prihlásený" : "· hosť"}
      </button>
    </div>
  );
}
