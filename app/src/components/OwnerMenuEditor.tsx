import { useEffect, useRef, useState } from "react";
import { ALLERGENS } from "@/data/allergens";
import { emptyMenuItem, localDate, priceToCents, type MenuItemDraft, type OwnedRestaurant, type StoredMenu } from "@/data/owner";
import { supabase } from "@/supabase";

export default function OwnerMenuEditor({ restaurant, onPublished, onDirtyChange, onBusyChange }: { restaurant: OwnedRestaurant; onPublished: () => void; onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void }) {
  const [menus, setMenus] = useState<StoredMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [kind, setKind] = useState<"daily" | "standard">("daily");
  const [date, setDate] = useState(localDate());
  const [items, setItems] = useState<MenuItemDraft[]>([emptyMenuItem()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const saving = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError(false);
    void (async () => {
      try {
        const { data, error } = await supabase.from("menus")
          .select("id, kind, date, status, menu_items(name, description, weight, price_cents, allergens, tag, position)")
          .eq("restaurant_id", restaurant.id).order("date", { ascending: false });
        if (error) throw error;
        if (live) setMenus(data as StoredMenu[]);
      } catch {
        if (live) setLoadError(true);
      } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [restaurant.id, retry]);

  const selectedMenu = menus.find((menu) => menu.kind === kind && (kind === "standard" || menu.date === date));
  useEffect(() => {
    const menu = menus.find((entry) => entry.kind === kind && (kind === "standard" || entry.date === date));
    setItems(menu?.menu_items.length ? [...menu.menu_items].sort((a, b) => a.position - b.position).map((item) => ({
      name: item.name, description: item.description, weight: item.weight,
      price: (item.price_cents / 100).toFixed(2), allergens: item.allergens, tag: item.tag,
    })) : [emptyMenuItem()]);
    setDirty(false);
    setError(null);
  }, [kind, date, menus]);

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange(false); onBusyChange(false); }, [onDirtyChange, onBusyChange]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const changeItem = (index: number, patch: Partial<MenuItemDraft>) => {
    setItems((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
    setDirty(true);
    setMessage(null);
  };
  const switchMenu = (nextKind: typeof kind, nextDate: string) => {
    if (dirty && !window.confirm("Máte neuložené zmeny. Chcete ich zahodiť a otvoriť iné menu?")) return;
    setMessage(null); setKind(nextKind); setDate(nextDate);
  };
  const save = async (status: "draft" | "published") => {
    if (saving.current || !formRef.current?.reportValidity()) return;
    setError(null); setMessage(null);
    if (items.some((item) => item.name.trim().length < 2 || item.name.trim().length > 120 || priceToCents(item.price) === null))
      return setError("Každé jedlo potrebuje názov (2–120 znakov) a cenu od 0 do 1 000 € s najviac dvoma desatinnými miestami.");
    saving.current = true; setBusy(true);
    try {
      const payload = items.map((item) => ({ ...item, name: item.name.trim(), price_cents: priceToCents(item.price) }));
      const { data, error } = await supabase.rpc("save_owned_menu", {
        p_restaurant_id: restaurant.id, p_kind: kind, p_date: kind === "daily" ? date : null, p_status: status, p_items: payload,
      });
      if (error) throw error;
      const saved: StoredMenu = { id: data as string, kind, date: kind === "daily" ? date : null, status,
        menu_items: payload.map((item, position) => ({ ...item, price_cents: item.price_cents!, position })) };
      setMenus((current) => [...current.filter((menu) => menu.id !== saved.id), saved]);
      setDirty(false);
      setMessage(status === "published" ? "Menu bolo zverejnené." : "Koncept menu bol uložený.");
      onPublished();
    } catch {
      setError("Menu sa nepodarilo uložiť. Skontrolujte pripojenie a stav schválenia reštaurácie a skúste znova.");
    } finally { saving.current = false; setBusy(false); }
  };

  return (
    <section className="panel owner-menu" aria-labelledby="menu-editor-heading">
      <div className="panel-head"><div><p className="section-kicker">Správa menu</p><h3 id="menu-editor-heading">{restaurant.name}</h3></div>
        <span className="owner-status">{selectedMenu?.status === "published" ? "Zverejnené menu" : "Koncept menu"}{dirty ? " · neuložené zmeny" : ""}</span>
      </div>
      {restaurant.status !== "active" && <p className="owner-notice">Menu si môžete pripraviť a uložiť ako koncept. Zverejniť ho môžete po schválení reštaurácie.</p>}
      {loading ? <p role="status">Načítavame menu…</p> : loadError ? <div className="form-error" role="alert"><p>Menu sa nepodarilo načítať.</p><button className="btn-ghost" onClick={() => setRetry((n) => n + 1)}>Skúsiť znova</button></div> : (
        <form className="form" ref={formRef} onSubmit={(event) => { event.preventDefault(); void save("draft"); }}>
          <fieldset className="owner-fields" disabled={busy}>
            <div className="owner-form-grid">
              <label>Typ menu<select value={kind} onChange={(event) => switchMenu(event.target.value as typeof kind, date)}><option value="daily">Denné menu</option><option value="standard">Stále menu</option></select></label>
              {kind === "daily" && <label>Dátum menu<input required type="date" value={date} onChange={(event) => switchMenu(kind, event.target.value)} /></label>}
            </div>
            {menus.length > 0 && <label>Otvoriť uložené menu<select value={selectedMenu?.id ?? ""} onChange={(event) => { const menu = menus.find((entry) => entry.id === event.target.value); if (menu) switchMenu(menu.kind, menu.date ?? date); }}>
              <option value="">Vyberte uložené menu</option>{menus.map((menu) => <option key={menu.id} value={menu.id}>{menu.kind === "standard" ? "Stále menu" : menu.date} · {menu.status === "published" ? "Zverejnené" : "Koncept"}</option>)}
            </select></label>}
            {items.map((item, index) => (
              <div className="owner-dish" key={index}>
                <div className="panel-head"><h4>Jedlo {index + 1}</h4><button type="button" className="inline-link plain" disabled={items.length === 1} onClick={() => { setItems((current) => current.filter((_, i) => i !== index)); setDirty(true); }}>Odstrániť jedlo</button></div>
                <label>Názov jedla<input required minLength={2} maxLength={120} value={item.name} onChange={(event) => changeItem(index, { name: event.target.value })} placeholder="Napr. Kurací rezeň so zemiakovou kašou" /></label>
                <div className="owner-form-grid">
                  <label>Cena (€)<input required inputMode="decimal" value={item.price} onChange={(event) => changeItem(index, { price: event.target.value })} placeholder="8,90" /></label>
                  <label>Hmotnosť / objem<input maxLength={40} value={item.weight} onChange={(event) => changeItem(index, { weight: event.target.value })} placeholder="150 / 200 g" /></label>
                </div>
                <label>Popis<textarea rows={2} maxLength={500} value={item.description} onChange={(event) => changeItem(index, { description: event.target.value })} /></label>
                <label>Kategória<input maxLength={40} value={item.tag} onChange={(event) => changeItem(index, { tag: event.target.value })} placeholder="Polievka, Menu 1, Vege…" /></label>
                <fieldset className="owner-allergens"><legend>Alergény</legend><div>{ALLERGENS.map((allergen) => {
                  const code = Number(allergen.code);
                  return <label key={code} title={allergen.name}><input type="checkbox" checked={item.allergens.includes(code)} onChange={(event) => changeItem(index, { allergens: event.target.checked ? [...item.allergens, code] : item.allergens.filter((value) => value !== code) })} /><span>{code}. {allergen.name}</span></label>;
                })}</div></fieldset>
              </div>
            ))}
            <button type="button" className="btn-ghost" disabled={items.length >= 50} onClick={() => { setItems((current) => [...current, emptyMenuItem()]); setDirty(true); }}>+ Pridať jedlo</button>
            <div className="owner-actions"><button className="btn-ghost" type="submit">{busy ? "Ukladáme…" : "Uložiť koncept"}</button>
              <button className="btn-primary" type="button" disabled={restaurant.status !== "active"} onClick={() => void save("published")}>{busy ? "Ukladáme…" : "Zverejniť menu"}</button></div>
          </fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="success-note" role="status">{message}</p>}
        </form>
      )}
    </section>
  );
}
