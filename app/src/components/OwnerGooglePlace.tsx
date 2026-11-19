import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/supabase";
export default function OwnerGooglePlace({ restaurantId, initialPlaceId, disabled, onDirtyChange, onBusyChange, onSaved }: {
  restaurantId: string; initialPlaceId: string; disabled: boolean;
  onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void; onSaved: (id: string) => void;
}) {
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dirty = placeId.trim() !== initialPlaceId;
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange(false); onBusyChange(false); }, [onDirtyChange, onBusyChange]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (busy || disabled) return;
    const id = placeId.trim(); setError(null); setMessage(null);
    if (id && !/^[A-Za-z0-9_-]{10,255}$/.test(id)) return setError("Vložte Google Place ID (napríklad ChIJ…), nie GPS súradnice ani odkaz na mapu. Nájdete ho cez odkaz pod poľom.");
    setBusy(true);
    try {
      const { error } = await supabase.rpc("set_restaurant_google_place", { p_restaurant_id: restaurantId, p_place_id: id });
      if (error) throw error;
      setPlaceId(id); onSaved(id); setMessage(id ? "Google Maps boli prepojené. Hodnotenie sa načíta na verejnom profile." : "Prepojenie Google Maps bolo odstránené.");
    } catch { setError("Prepojenie sa nepodarilo uložiť. Skontrolujte Place ID a skúste znova."); }
    finally { setBusy(false); }
  };
  return <section className="owner-google-settings" aria-labelledby="owner-google-heading"><h4 id="owner-google-heading">Hodnotenie z Google Maps</h4>
    <p className="muted">Prepojte presnú pobočku vášho podniku. Hodnotenia sa načítajú priamo z Google pri otvorení profilu.</p>
    <form className="form" onSubmit={save}><fieldset className="owner-fields" disabled={busy || disabled}>
      <label>Google Place ID<input maxLength={255} value={placeId} onChange={(event) => { setPlaceId(event.target.value); setMessage(null); setError(null); }} placeholder="ChIJ…" autoComplete="off" spellCheck={false} /><small>Identifikátor podniku z Google, nie GPS súradnice ani odkaz na mapu. <a href="https://developers.google.com/maps/documentation/places/web-service/place-id#find-id" target="_blank" rel="noopener noreferrer">Nájsť Place ID vášho podniku ↗</a></small></label>
      <button className="btn-ghost" type="submit" disabled={!dirty}>{busy ? "Ukladáme…" : "Uložiť prepojenie Google Maps"}</button>
    </fieldset>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="success-note owner-menu-feedback" role="status">{message}</p>}</form>
  </section>;
}
