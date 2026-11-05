import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import Icon from "@/components/Icon";
import OwnerLocationPicker from "@/components/OwnerLocationPicker";
import OwnerMenuEditor from "@/components/OwnerMenuEditor";
import { CUISINES, LOCATIONS } from "@/data/allergens";
import type { OwnedRestaurant } from "@/data/owner";
import { useProto } from "@/proto/ProtoContext";
import { useRestaurants } from "@/proto/RestaurantContext";
import { supabase } from "@/supabase";

const fields = { name: "", ico: "", city: "Bratislava", district: "Staré Mesto", address: "", email: "", phone: "", tagline: "", cuisine: "Slovenská", lat: "", lng: "" };
const statusLabel = { pending: "Čaká na schválenie", active: "Schválená", hidden: "Nezverejnená" };

export default function Owners() {
  const { userId } = useProto();
  const { refresh: refreshPublic } = useRestaurants();
  const [restaurants, setRestaurants] = useState<OwnedRestaurant[]>([]);
  const [applications, setApplications] = useState<OwnedRestaurant[]>([]);
  const [admin, setAdmin] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(fields);
  const [busy, setBusy] = useState(false);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [menuDirty, setMenuDirty] = useState(false);
  const [menuBusy, setMenuBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const submitting = useRef(false);
  const currentUser = useRef(userId);
  currentUser.current = userId;
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setLoadError(false);
    try {
      const [links, profile] = await Promise.all([
        supabase.from("restaurant_users").select("restaurants(id, slug, name, ico, city, district, address, email, phone, status)").eq("user_id", userId),
        supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
      ]);
      if (links.error || profile.error) throw links.error ?? profile.error;
      const isAdmin = profile.data?.role === "admin";
      const queue = isAdmin ? await supabase.from("restaurants").select("id, slug, name, ico, city, district, address, email, phone, status")
        .eq("status", "pending").eq("owner_submitted", true).order("created_at") : null;
      if (queue?.error) throw queue.error;
      if (currentUser.current !== userId) return;
      const owned = (links.data as unknown as { restaurants: OwnedRestaurant | null }[]).flatMap((link) => link.restaurants ? [link.restaurants] : []);
      setRestaurants(owned); setAdmin(isAdmin); setApplications(queue?.data as OwnedRestaurant[] ?? []);
      setSelectedId((current) => owned.some((place) => place.id === current) ? current : owned[0]?.id ?? "");
    } catch { if (currentUser.current === userId) setLoadError(true); }
    finally { if (currentUser.current === userId) setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load, retry]);
  const mayDiscard = () => !menuDirty || window.confirm("Máte neuložené menu. Chcete zahodiť zmeny?");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || !userId || menuBusy || !mayDiscard()) return;
    setError(null); setMessage(null);
    if (!/^\d{8}$/.test(form.ico) || form.name.trim().length < 2 || form.address.trim().length < 5 || form.phone.trim().length < 5)
      return setError("Skontrolujte názov, adresu, telefón a osemmiestne IČO.");
    const lat = Number(form.lat); const lng = Number(form.lng);
    if (!form.lat.trim() || !form.lng.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)
      return setError("Označte polohu reštaurácie na mape alebo zadajte platné súradnice.");
    submitting.current = true; setBusy(true);
    const member = userId;
    try {
      const { data, error } = await supabase.rpc("submit_owned_restaurant", { p_restaurant: { ...form, name: form.name.trim(), lat, lng } });
      if (error) throw error;
      if (currentUser.current !== member) return;
      setSelectedId(data as string); setAdding(false); setForm(fields);
      setMessage("Žiadosť bola odoslaná. Po overení reštauráciu zverejníme. Zatiaľ si môžete pripraviť menu.");
      await load();
    } catch { if (currentUser.current === member) setError("Žiadosť sa nepodarilo odoslať. Skontrolujte údaje a pripojenie a skúste znova."); }
    finally { submitting.current = false; setBusy(false); }
  };
  const decide = async (restaurant: OwnedRestaurant, approve: boolean) => {
    if (decisionBusy || menuBusy || !mayDiscard()) return;
    setDecisionBusy(true); setError(null); setMessage(null);
    try {
      const { error } = await supabase.rpc("review_restaurant_application", { p_restaurant_id: restaurant.id, p_approve: approve });
      if (error) throw error;
      setMessage(`${restaurant.name}: ${approve ? "reštaurácia bola schválená" : "žiadosť bola zamietnutá"}.`);
      refreshPublic(); await load();
    } catch { setError("Rozhodnutie sa nepodarilo uložiť. Obnovte zoznam a skúste znova."); }
    finally { setDecisionBusy(false); }
  };
  const selected = restaurants.find((place) => place.id === selectedId);
  const patch = (key: keyof typeof fields, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="page owner-page">
      <div className="owner-hero">
        <span className="owner-hero-icon"><Icon name="store" size={34} /></span>
        <p className="section-kicker">Menufy pre reštaurácie</p>
        <h2>Vlastníš reštauráciu?</h2>
        <p>Pridajte svoj podnik a dostaňte svoje menu k ľuďom vo vašom okolí.</p>
        {!userId && <div className="owner-actions"><Link className="btn-primary" to="/login?mode=signup&owner=1&next=%2Fowners">Vytvoriť účet majiteľa</Link><Link className="btn-ghost" to="/login?owner=1&next=%2Fowners">Už mám účet</Link></div>}
      </div>
      <div className="owner-steps">
        {[ ["1", "Zaregistrujte svoj podnik", "Vyplňte údaje o reštaurácii, IČO a kontakt."], ["2", "Overíme vašu žiadosť", "Reštaurácia sa zobrazí návštevníkom až po schválení."], ["3", "Spravujte svoje menu", "Pridávajte jedlá, ceny a alergény. Koncepty si pripravíte vopred."] ].map(([number, title, body]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></div>)}
      </div>
      {userId && <>
        {message && <p className="success-note" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="page-head-row owner-dashboard-head"><h3>Moje reštaurácie</h3><div className="owner-actions"><button className="btn-ghost" disabled={loading || busy || decisionBusy || menuBusy} onClick={() => { if (mayDiscard()) setRetry((n) => n + 1); }}>Obnoviť stav</button>{(restaurants.length > 0 || admin) && <button className="btn-primary" onClick={() => setAdding(!adding)}>{adding ? "Zavrieť formulár" : "+ Pridať reštauráciu"}</button>}</div></div>
        {loading ? <p role="status">Načítavame vaše reštaurácie…</p> : loadError ? <p className="form-error" role="alert">Portál sa nepodarilo načítať. Skúste obnoviť stav.</p> : <>
          {(adding || (restaurants.length === 0 && !admin)) && <section className="panel">
            <h3>Pridať reštauráciu</h3><p className="muted">Žiadosť skontroluje administrátor. Kontaktné údaje sa po schválení zobrazia pri reštaurácii.</p>
            <form className="form" onSubmit={submit}><fieldset className="owner-fields" disabled={busy}>
              <div className="owner-form-grid">
                <label>Názov reštaurácie<input required minLength={2} maxLength={120} value={form.name} onChange={(e) => patch("name", e.target.value)} autoComplete="organization" /></label>
                <label>IČO<input required pattern="[0-9]{8}" maxLength={8} inputMode="numeric" value={form.ico} onChange={(e) => patch("ico", e.target.value)} placeholder="8 číslic" /></label>
                <label>Mesto<select value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value, district: LOCATIONS[e.target.value][1], lat: "", lng: "" }))}>{Object.keys(LOCATIONS).map((city) => <option key={city}>{city}</option>)}</select></label>
                <label>Mestská časť<select value={form.district} onChange={(e) => patch("district", e.target.value)}>{LOCATIONS[form.city].slice(1).map((district) => <option key={district}>{district}</option>)}</select></label>
              </div>
              <label>Adresa<input required minLength={5} maxLength={200} value={form.address} onChange={(e) => patch("address", e.target.value)} autoComplete="street-address" placeholder="Ulica a číslo" /></label>
              <div className="owner-form-grid">
                <label>Kontaktný e-mail<input required type="email" maxLength={254} value={form.email} onChange={(e) => patch("email", e.target.value)} autoComplete="email" /></label>
                <label>Telefón<input required type="tel" minLength={5} maxLength={40} value={form.phone} onChange={(e) => patch("phone", e.target.value)} autoComplete="tel" /></label>
                <label>Kuchyňa<select value={form.cuisine} onChange={(e) => patch("cuisine", e.target.value)}>{CUISINES.map((cuisine) => <option key={cuisine}>{cuisine}</option>)}</select></label>
                <label>Krátky popis<input maxLength={200} value={form.tagline} onChange={(e) => patch("tagline", e.target.value)} placeholder="Čím je vaša kuchyňa výnimočná?" /></label>
              </div>
              <fieldset className="owner-fields"><legend>Poloha reštaurácie na mape</legend><p className="muted">Kliknite na mapu a označte presnú polohu podniku. Súradnice môžete zadať aj ručne.</p><OwnerLocationPicker city={form.city} lat={form.lat} lng={form.lng} disabled={busy} onPick={(lat, lng) => setForm((current) => ({ ...current, lat, lng }))} /><div className="owner-form-grid">
                <label>Zemepisná šírka<input type="number" step="any" min={-90} max={90} value={form.lat} onChange={(e) => patch("lat", e.target.value)} placeholder="48.1486" /></label>
                <label>Zemepisná dĺžka<input type="number" step="any" min={-180} max={180} value={form.lng} onChange={(e) => patch("lng", e.target.value)} placeholder="17.1077" /></label>
              </div></fieldset>
              <button className="btn-primary" type="submit">{busy ? "Odosielame…" : "Odoslať na schválenie"}</button>
            </fieldset></form>
          </section>}
          {restaurants.length > 0 && <div className="owner-restaurants">{restaurants.map((place) => <button key={place.id} className={`owner-place ${place.id === selectedId ? "selected" : ""}`} disabled={menuBusy} onClick={() => { if (place.id !== selectedId && mayDiscard()) setSelectedId(place.id); }}><Icon name="store" size={23} /><span><strong>{place.name}</strong><small>{place.city} · {place.address}</small></span><span className={`owner-status ${place.status}`}>{statusLabel[place.status]}</span></button>)}</div>}
          {selected && <><div className="owner-selection-note">{selected.status === "active" ? <Link className="inline-link" to={`/restaurant/${selected.slug}`}>Zobraziť verejný profil →</Link> : <p className="muted">{selected.status === "pending" ? "Vaša reštaurácia zatiaľ nie je verejná. Čakáme na overenie administrátorom." : "Reštaurácia nebola zverejnená. Ak potrebujete preveriť žiadosť, obráťte sa na administrátora Menufy."}</p>}</div><OwnerMenuEditor key={selected.id} restaurant={selected} onPublished={refreshPublic} onDirtyChange={setMenuDirty} onBusyChange={setMenuBusy} /></>}
          {admin && <section className="panel owner-approvals"><p className="section-kicker">Administrácia</p><h3>Žiadosti na schválenie</h3>{applications.length === 0 ? <p className="muted">Žiadne čakajúce žiadosti.</p> : applications.map((place) => <div className="owner-application" key={place.id}><h4>{place.name}</h4><p>IČO: {place.ico} · {place.city}, {place.address}</p><p><a href={`mailto:${place.email}`}>{place.email}</a> · {place.phone}</p><div className="owner-actions"><button className="btn-primary" disabled={decisionBusy || menuBusy} onClick={() => void decide(place, true)}>Schváliť reštauráciu</button><button className="btn-ghost" disabled={decisionBusy || menuBusy} onClick={() => void decide(place, false)}>Zamietnuť žiadosť</button></div></div>)}</section>}
        </>}
      </>}
    </div>
  );
}
