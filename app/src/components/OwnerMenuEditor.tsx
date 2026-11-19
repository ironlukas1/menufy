import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { ALLERGENS } from "@/data/allergens";
import { emptyMenuItem, localDate, priceToCents, type MenuItemDraft, type OwnedRestaurant, type StoredMenu } from "@/data/owner";
import { supabase } from "@/supabase";

type EditingMenu = { id?: string; kind: "daily" | "standard"; date: string };
const money = (cents: number) => new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(cents / 100);
const dateLabel = (date: string) => new Intl.DateTimeFormat("sk-SK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const menuTitle = (menu: { kind: string; date: string | null }) => menu.kind === "standard" ? "Stále menu" : `Denné menu · ${menu.date ? dateLabel(menu.date) : ""}`;

export default function OwnerMenuEditor({ restaurant, onPublished, onDirtyChange, onBusyChange }: { restaurant: OwnedRestaurant; onPublished: () => void; onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void }) {
  const [menus, setMenus] = useState<StoredMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<"list" | "new" | "edit">("list");
  const [filter, setFilter] = useState<"all" | "daily" | "standard">("all");
  const [newKind, setNewKind] = useState<"daily" | "standard">("daily");
  const [newDate, setNewDate] = useState(localDate());
  const [editing, setEditing] = useState<EditingMenu | null>(null);
  const [items, setItems] = useState<MenuItemDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const saving = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const previousView = useRef(view);

  useEffect(() => {
    let live = true;
    setLoading(true); setLoadError(false);
    void (async () => {
      try {
        const { data, error } = await supabase.from("menus")
          .select("id, kind, date, status, menu_items(name, description, weight, price_cents, allergens, tag, position)")
          .eq("restaurant_id", restaurant.id).order("date", { ascending: false });
        if (error) throw error;
        if (live) setMenus(data as StoredMenu[]);
      } catch { if (live) setLoadError(true); }
      finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [restaurant.id, retry]);

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange(false); onBusyChange(false); }, [onDirtyChange, onBusyChange]);
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    sectionRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    sectionRef.current?.querySelector<HTMLElement>("[data-menu-heading]")?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const openMenu = (menu: StoredMenu) => {
    setEditing({ id: menu.id, kind: menu.kind, date: menu.date ?? localDate() });
    setItems([...menu.menu_items].sort((a, b) => a.position - b.position).map((item) => ({
      name: item.name, description: item.description, weight: item.weight,
      price: (item.price_cents / 100).toFixed(2), allergens: item.allergens, tag: item.tag,
    })));
    setDirty(false); setError(null); setMessage(null); setView("edit");
  };
  const beginNew = () => {
    const available = new Date();
    while (menus.some((menu) => menu.kind === "daily" && menu.date === localDate(available))) available.setDate(available.getDate() + 1);
    setNewKind("daily"); setNewDate(localDate(available)); setError(null); setMessage(null); setView("new");
  };
  const backToList = () => {
    if (busy || (dirty && !window.confirm("Máte neuložené zmeny. Chcete ich zahodiť a vrátiť sa na zoznam menu?"))) return;
    setDirty(false); setEditing(null); setError(null); setView("list");
  };
  const existingMenu = menus.find((menu) => menu.kind === newKind && (newKind === "standard" || menu.date === newDate));
  const createMenu = () => {
    if (existingMenu) return openMenu(existingMenu);
    setEditing({ kind: newKind, date: newDate }); setItems([emptyMenuItem()]);
    setDirty(false); setError(null); setMessage(null); setView("edit");
  };
  const changeItem = (index: number, patch: Partial<MenuItemDraft>) => {
    setItems((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
    setDirty(true); setMessage(null); setError(null);
  };
  const save = async (status: "draft" | "published") => {
    if (saving.current || !editing || !formRef.current?.reportValidity()) return;
    setError(null); setMessage(null);
    if (!items.length || items.some((item) => item.name.trim().length < 2 || item.name.trim().length > 120 || priceToCents(item.price) === null))
      return setError("Každé jedlo potrebuje názov (2–120 znakov) a cenu od 0 do 1 000 € s najviac dvoma desatinnými miestami.");
    saving.current = true; setBusy(true);
    try {
      const payload = items.map((item) => ({ ...item, name: item.name.trim(), price_cents: priceToCents(item.price) }));
      const { data, error } = await supabase.rpc("save_owned_menu", {
        p_restaurant_id: restaurant.id, p_kind: editing.kind, p_date: editing.kind === "daily" ? editing.date : null, p_status: status, p_items: payload,
      });
      if (error) throw error;
      const saved: StoredMenu = { id: data as string, kind: editing.kind, date: editing.kind === "daily" ? editing.date : null, status,
        menu_items: payload.map((item, position) => ({ ...item, price_cents: item.price_cents!, position })) };
      setMenus((current) => [...current.filter((menu) => menu.id !== saved.id), saved]);
      setDirty(false); setEditing(null); setFilter("all"); setView("list");
      setMessage(status === "published" ? "Menu bolo uložené a zverejnené." : "Koncept menu bol uložený.");
      onPublished();
    } catch {
      setError("Menu sa nepodarilo uložiť. Skontrolujte pripojenie a stav schválenia reštaurácie a skúste znova.");
    } finally { saving.current = false; setBusy(false); }
  };

  const today = localDate();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const visibleMenus = menus.filter((menu) => filter === "all" || menu.kind === filter).sort((a, b) => {
    const rank = (menu: StoredMenu) => menu.kind === "standard" ? 2 : menu.date! >= today ? 0 : 1;
    const difference = rank(a) - rank(b);
    if (difference) return difference;
    return rank(a) === 0 ? (a.date ?? "").localeCompare(b.date ?? "") : (b.date ?? "").localeCompare(a.date ?? "");
  });
  const original = menus.find((menu) => menu.id === editing?.id);

  return (
    <section ref={sectionRef} className="panel owner-menu" aria-labelledby="menu-editor-heading">
      {view === "list" ? <>
        <div className="owner-menu-heading">
          <div><p className="section-kicker">{restaurant.name}</p><h3 id="menu-editor-heading" data-menu-heading tabIndex={-1}>Vaše menu</h3><p className="muted">Vyberte menu, ktoré chcete upraviť, alebo vytvorte nové.</p></div>
          <button className="btn-primary" disabled={loading || loadError} onClick={beginNew}><Icon name="calendar" size={17} /> Vytvoriť nové menu</button>
        </div>
        {message && <p className="success-note owner-menu-feedback" role="status">{message}</p>}
        {restaurant.status !== "active" && <p className="owner-notice">Zatiaľ môžete pripravovať koncepty. Menu zverejníte po schválení reštaurácie.</p>}
        {loading ? <p role="status">Načítavame menu…</p> : loadError ? <div className="form-error" role="alert"><p>Menu sa nepodarilo načítať.</p><button className="btn-ghost" onClick={() => setRetry((n) => n + 1)}>Skúsiť znova</button></div> : <>
          {menus.length > 0 && <div className="owner-menu-toolbar"><div className="owner-menu-filters" role="group" aria-label="Typ menu">
            {([ ["all", "Všetky"], ["daily", "Denné"], ["standard", "Stále"] ] as const).map(([value, label]) => <button key={value} className={filter === value ? "on" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{value === "all" ? menus.length : menus.filter((menu) => menu.kind === value).length}</span></button>)}
          </div><span className="muted">Kliknite na menu a upravte ho</span></div>}
          {visibleMenus.length ? <div className="owner-menu-grid">{visibleMenus.map((menu) => {
            const dishes = [...menu.menu_items].sort((a, b) => a.position - b.position);
            const isToday = menu.kind === "daily" && menu.date === today;
            return <button className={`owner-menu-card ${isToday ? "is-today" : ""}`} key={menu.id} aria-label={`Upraviť ${menuTitle(menu)}`} onClick={() => openMenu(menu)}>
              <span className="owner-menu-card-top"><span className="owner-menu-type"><Icon name={menu.kind === "daily" ? "calendar" : "menu"} size={18} />{menu.kind === "daily" ? "Denné menu" : "Stále menu"}</span><span className={`owner-status ${menu.status === "published" ? "active" : ""}`}>{menu.status === "published" ? "Zverejnené" : "Koncept"}</span></span>
              <span className="owner-menu-card-title">{menu.kind === "standard" ? "Vaša stála ponuka" : dateLabel(menu.date!)}</span>
              {isToday && <span className="owner-menu-day">Dnes</span>}{menu.kind === "daily" && menu.date === localDate(tomorrow) && <span className="owner-menu-day">Zajtra</span>}
              <span className="owner-menu-preview">{dishes.slice(0, 4).map((item, index) => <span className="owner-menu-preview-row" key={index}><span>{item.name}</span><strong>{money(item.price_cents)}</strong></span>)}{dishes.length === 0 && <span className="muted">Zatiaľ bez jedál</span>}{dishes.length > 4 && <span className="owner-menu-more">+ ďalších {dishes.length - 4} jedál</span>}</span>
              <span className="owner-menu-card-bottom"><span>{dishes.length} {dishes.length === 1 ? "jedlo" : dishes.length < 5 && dishes.length > 1 ? "jedlá" : "jedál"}</span><span>Upraviť menu <Icon name="arrow" size={16} /></span></span>
            </button>;
          })}</div> : <div className="owner-menu-empty"><Icon name="menu" size={32} /><h4>{menus.length ? "Zatiaľ tu nie je žiadne menu tohto typu" : "Vaše prvé menu začína tu"}</h4><p className="muted">Pridajte jedlá, ceny a alergény. Menu si môžete najprv uložiť ako koncept.</p><button className="btn-primary" onClick={beginNew}>Vytvoriť nové menu</button></div>}
        </>}
      </> : <>
        <button type="button" className="owner-menu-back" disabled={busy} onClick={backToList}><Icon name="back" size={16} /> Späť na vaše menu</button>
        {view === "new" ? <div className="owner-menu-create">
          <p className="section-kicker">{restaurant.name}</p><h3 id="menu-editor-heading" data-menu-heading tabIndex={-1}>Vytvoriť nové menu</h3><p className="muted">Vyberte typ menu a deň, pre ktorý ho pripravujete.</p>
          <form className="form" onSubmit={(event) => { event.preventDefault(); createMenu(); }}>
            <fieldset className="owner-menu-kind"><legend>Aké menu chcete vytvoriť?</legend><div>
              {([ ["daily", "Denné menu", "Ponuka na konkrétny deň", "calendar"], ["standard", "Stále menu", "Vaša ponuka bez dátumu", "menu"] ] as const).map(([value, label, description, icon]) => <label key={value} className={newKind === value ? "selected" : ""}><input type="radio" name="new-menu-kind" value={value} checked={newKind === value} onChange={() => setNewKind(value)} /><Icon name={icon} size={24} /><strong>{label}</strong><span>{description}</span></label>)}
            </div></fieldset>
            {newKind === "daily" && <label>Dátum menu<input required type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} /></label>}
            {existingMenu && <p className="owner-notice">{newKind === "standard" ? "Stále menu už máte vytvorené." : "Na tento deň už máte vytvorené menu."} Môžete ho otvoriť a upraviť.</p>}
            <button className="btn-primary" type="submit">{existingMenu ? "Otvoriť existujúce menu" : "Pokračovať a pridať jedlá"}<Icon name="arrow" size={16} /></button>
          </form>
        </div> : editing && <>
          <div className="owner-menu-heading"><div><p className="section-kicker">{restaurant.name}</p><h3 id="menu-editor-heading" data-menu-heading tabIndex={-1}>{editing.id ? "Upraviť menu" : "Nové menu"}</h3><p className="muted">{menuTitle(editing)}</p></div><span className={`owner-status ${original?.status === "published" ? "active" : ""}`}>{dirty ? "Neuložené zmeny" : original?.status === "published" ? "Zverejnené" : "Koncept"}</span></div>
          {restaurant.status !== "active" && <p className="owner-notice">Menu si môžete uložiť ako koncept. Zverejníte ho po schválení reštaurácie.</p>}
          <form className="form" ref={formRef} onSubmit={(event) => { event.preventDefault(); void save("draft"); }}>
            <fieldset className="owner-fields" disabled={busy}>
              {items.map((item, index) => <div className="owner-dish" key={index}>
                <div className="panel-head"><h4>Jedlo {index + 1}</h4><button type="button" className="inline-link plain" disabled={items.length === 1} onClick={() => { setItems((current) => current.filter((_, i) => i !== index)); setDirty(true); setError(null); }}>Odstrániť jedlo</button></div>
                <label>Názov jedla<input required minLength={2} maxLength={120} value={item.name} onChange={(event) => changeItem(index, { name: event.target.value })} placeholder="Napr. Kurací rezeň so zemiakovou kašou" /></label>
                <div className="owner-form-grid"><label>Cena (€)<input required inputMode="decimal" value={item.price} onChange={(event) => changeItem(index, { price: event.target.value })} placeholder="8,90" /></label><label>Hmotnosť / objem<input maxLength={40} value={item.weight} onChange={(event) => changeItem(index, { weight: event.target.value })} placeholder="150 / 200 g" /></label></div>
                <label>Popis<textarea rows={2} maxLength={500} value={item.description} onChange={(event) => changeItem(index, { description: event.target.value })} /></label>
                <label>Kategória<input maxLength={40} value={item.tag} onChange={(event) => changeItem(index, { tag: event.target.value })} placeholder="Polievka, Menu 1, Vege…" /></label>
                <fieldset className="owner-allergens"><legend>Alergény</legend><div>{ALLERGENS.map((allergen) => {
                  const code = Number(allergen.code);
                  return <label key={code} title={allergen.name}><input type="checkbox" checked={item.allergens.includes(code)} onChange={(event) => changeItem(index, { allergens: event.target.checked ? [...item.allergens, code] : item.allergens.filter((value) => value !== code) })} /><span>{code}. {allergen.name}</span></label>;
                })}</div></fieldset>
              </div>)}
              <button type="button" className="btn-ghost owner-add-dish" disabled={items.length >= 50} onClick={() => { setItems((current) => [...current, emptyMenuItem()]); setDirty(true); }}>+ Pridať ďalšie jedlo</button>
              <div className="owner-menu-save"><div><strong>{items.length} {items.length === 1 ? "jedlo v menu" : items.length < 5 ? "jedlá v menu" : "jedál v menu"}</strong><small>{original?.status === "published" ? "Uložením konceptu sa menu stiahne z verejnej ponuky." : "Koncept vidíte iba vy. Zverejnené menu uvidia návštevníci."}</small></div><div className="owner-actions"><button className="btn-ghost" type="button" onClick={backToList}>Zrušiť</button><button className="btn-ghost" type="submit">{busy ? "Ukladáme…" : "Uložiť koncept"}</button><button className="btn-primary" type="button" disabled={restaurant.status !== "active"} onClick={() => void save("published")}>{busy ? "Ukladáme…" : "Uložiť a zverejniť"}</button></div></div>
            </fieldset>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
        </>}
      </>}
    </section>
  );
}
