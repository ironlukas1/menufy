import { useEffect, useRef, useState, type FormEvent } from "react";
import Icon from "@/components/Icon";
import OwnerGooglePlace from "@/components/OwnerGooglePlace";
import OwnerLocationPicker from "@/components/OwnerLocationPicker";
import { CUISINES, LOCATIONS } from "@/data/allergens";
import type { OwnedRestaurant } from "@/data/owner";
import { DELIVERY_PROVIDERS, deliveryLinkUrl, type DeliveryLink, IMAGE_EXTENSIONS, RESTAURANT_IMAGE_BUCKET, imageValidation, photoUploadError, openingDays, websiteUrl, type OpeningDay } from "@/data/restaurantSettings";
import { prepareRestaurantPhoto } from "@/data/restaurantPhoto";
import { restaurantImageUrl, supabase } from "@/supabase";

type RestaurantProfile = OwnedRestaurant & {
  google_place_id?: string | null; tagline: string; web: string; lat: number; lng: number; image: string; hours: [string, string][];
  delivery_available: boolean; delivery_eta: string; delivery_links?: DeliveryLink[];
  restaurant_type_links: { restaurant_types: { name: string } }[];
};
type ProfileForm = {
  name: string; tagline: string; city: string; district: string; address: string;
  email: string; phone: string; web: string; cuisine: string; lat: string; lng: string;
  image: string; showHours: boolean; hours: OpeningDay[]; delivery: boolean; deliveryLinks: DeliveryLink[];
};
function toForm(profile: RestaurantProfile): ProfileForm {
  return { name: profile.name, tagline: profile.tagline, city: profile.city, district: profile.district,
    address: profile.address, email: profile.email, phone: profile.phone, web: profile.web,
    cuisine: profile.restaurant_type_links[0]?.restaurant_types.name ?? CUISINES[0],
    lat: String(profile.lat), lng: String(profile.lng), image: profile.image,
    showHours: profile.hours.length > 0, hours: openingDays(profile.hours),
    delivery: profile.delivery_available,
    deliveryLinks: DELIVERY_PROVIDERS.map(({ name }) => ({ name, url: profile.delivery_links?.find((link) => link.name === name)?.url ?? "" })) };
}
export default function OwnerRestaurantSettings({ restaurant, onSaved, onDirtyChange, onBusyChange }: {
  restaurant: OwnedRestaurant; onSaved: (profile: OwnedRestaurant) => void;
  onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void;
}) {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoVersion = useRef(0);
  const preview = localPreview ?? (form?.image ? restaurantImageUrl(form.image) : "");
  const [imageFailed, setImageFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleDirty, setGoogleDirty] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const saving = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    setLoading(true); setLoadError(false);
    void (async () => {
      try {
        const { data, error } = await supabase.from("restaurants")
          .select("*, restaurant_type_links(restaurant_types(name))")
          .eq("id", restaurant.id).single();
        if (error) throw error;
        if (live) { const loaded = data as unknown as RestaurantProfile; setProfile(loaded); setForm(toForm(loaded)); }
      } catch { if (live) setLoadError(true); }
      finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [restaurant.id, retry]);
  useEffect(() => { onDirtyChange(dirty || googleDirty); }, [dirty, googleDirty, onDirtyChange]);
  useEffect(() => { onBusyChange(busy || preparingPhoto || googleBusy); }, [busy, preparingPhoto, googleBusy, onBusyChange]);
  useEffect(() => () => { photoVersion.current += 1; onDirtyChange(false); onBusyChange(false); }, [onDirtyChange, onBusyChange]);
  useEffect(() => {
    if (!dirty && !googleDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, googleDirty]);
  useEffect(() => { setImageFailed(false); }, [preview]);

  const choosePhoto = async (selected: File) => {
    const version = ++photoVersion.current;
    setPreparingPhoto(true); setPhotoError(null); setError(null); setMessage(null);
    try {
      const prepared = await prepareRestaurantPhoto(selected);
      if (version !== photoVersion.current) return;
      setFile(prepared.file); setLocalPreview(prepared.preview); setDirty(true);
    } catch (failure) {
      if (version !== photoVersion.current) return;
      setPhotoError(failure instanceof Error ? failure.message : "Fotografiu sa nepodarilo načítať. Vyberte ju znova.");
      if (fileInput.current) fileInput.current.value = "";
    } finally { if (version === photoVersion.current) setPreparingPhoto(false); }
  };

  const patch = (changes: Partial<ProfileForm>) => {
    setForm((current) => current && { ...current, ...changes }); setDirty(true); setMessage(null); setError(null);
  };
  const reset = () => {
    if (!profile || (dirty && !window.confirm("Chcete zahodiť neuložené nastavenia reštaurácie?"))) return;
    setForm(toForm(profile)); setFile(null); setLocalPreview(null); setPhotoError(null); setDirty(false); setError(null); setMessage(null);
    if (fileInput.current) fileInput.current.value = "";
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !profile || saving.current || preparingPhoto || googleBusy) return;
    setError(null); setMessage(null);
    const web = websiteUrl(form.web);
    const lat = Number(form.lat); const lng = Number(form.lng);
    if (web === null || web.length > 300) return setError("Zadajte platnú webovú adresu, napr. https://vasarestauracia.sk.");
    if (form.name.trim().length < 2 || form.address.trim().length < 5 || form.phone.trim().length < 5)
      return setError("Skontrolujte názov, adresu a telefón reštaurácie.");
    if (!form.lat.trim() || !form.lng.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
      return setError("Označte polohu reštaurácie na mape alebo zadajte platné súradnice.");
    if (file) { const validation = imageValidation(file); if (validation) return setError(validation); }
    const deliveryLinks: DeliveryLink[] = [];
    for (const link of form.deliveryLinks) {
      const url = deliveryLinkUrl(link.name, link.url);
      if (url === null) return setError(`Skontrolujte odkaz na ${link.name}. Vložte HTTPS odkaz na konkrétny podnik na stránke tejto služby.`);
      if (url) deliveryLinks.push({ name: link.name, url });
    }
    if (!Array.isArray(profile.delivery_links)) return setError("Pre uloženie odkazov najprv spustite v Supabase súbor supabase/restaurant_delivery.sql. Potom obnovte stránku.");
    saving.current = true; setBusy(true);
    let uploaded: string | null = null;
    let uploadError: string | null = null;
    try {
      let image = form.image;
      if (file) {
        const path = `${restaurant.id}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
        const result = await supabase.storage.from(RESTAURANT_IMAGE_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
        if (result.error) { uploadError = photoUploadError(result.error); throw new Error("photo-upload"); }
        uploaded = path; image = `${RESTAURANT_IMAGE_BUCKET}/${path}`;
      }
      const payload = {
        name: form.name.trim(), tagline: form.tagline.trim(), city: form.city, district: form.district,
        address: form.address.trim(), email: form.email.trim(), phone: form.phone.trim(), web,
        cuisine: form.cuisine, lat, lng, image,
        hours: form.showHours ? form.hours.map((day) => [day.day, day.closed ? "Zatvorené" : `${day.open} – ${day.close}`]) : [],
        delivery_available: form.delivery,
        delivery_eta: "",
        delivery_links: deliveryLinks,
      };
      const result = await supabase.rpc("update_owned_restaurant", { p_restaurant_id: restaurant.id, p_restaurant: payload });
      if (result.error) throw result.error;

      const saved = { ...result.data, restaurant_type_links: [{ restaurant_types: { name: form.cuisine } }] } as RestaurantProfile;
      setProfile(saved); setForm(toForm(saved)); setFile(null); setLocalPreview(null); setPhotoError(null); setDirty(false);
      if (fileInput.current) fileInput.current.value = "";
      setMessage(saved.status === "active" ? "Nastavenia boli uložené. Zmeny sú viditeľné aj na verejnom profile." : "Nastavenia boli uložené. Reštaurácia bude verejná po schválení.");
      onSaved(saved);
      const prefix = `${RESTAURANT_IMAGE_BUCKET}/`;
      if (profile.image.startsWith(prefix) && profile.image !== image) {
        try { await supabase.storage.from(RESTAURANT_IMAGE_BUCKET).remove([profile.image.slice(prefix.length)]); } catch { /* Profile save succeeded; unused photo cleanup may be retried later. */ }
      }
    } catch (failure) {
      if (uploaded) {
        // Storage refuses deletion if a save succeeded despite a lost response.
        try { await supabase.storage.from(RESTAURANT_IMAGE_BUCKET).remove([uploaded]); } catch { /* Keep the original form for retry. */ }
      }
      setError(failure instanceof Error && failure.message === "photo-upload" ? uploadError
        : "Nastavenia sa nepodarilo uložiť. Vaše zmeny zostali vo formulári. Skúste znova.");
    } finally { saving.current = false; setBusy(false); }
  };

  return <section className="panel owner-settings" aria-labelledby="restaurant-settings-heading">
    <div className="owner-menu-heading"><div><p className="section-kicker">{restaurant.name}</p><h3 id="restaurant-settings-heading">Nastavenia reštaurácie</h3><p className="muted">Upravte údaje, ktoré návštevníci uvidia pri vašom podniku.</p></div>{dirty && <span className="owner-status">Neuložené zmeny</span>}</div>
    {loading ? <p role="status">Načítavame nastavenia…</p> : loadError ? <div className="form-error" role="alert"><p>Nastavenia sa nepodarilo načítať.</p><button className="btn-ghost" onClick={() => setRetry((value) => value + 1)}>Skúsiť znova</button></div> : form && profile && <><form className="form" onSubmit={submit}>
      <fieldset className="owner-fields" disabled={busy || preparingPhoto || googleBusy}>
        <div className="owner-settings-section"><div className="owner-settings-section-heading"><Icon name="store" size={20} /><div><h4>Fotografia reštaurácie</h4><p>Úvodná fotografia pre váš profil a zoznam reštaurácií.</p></div></div>
          <div className="owner-photo-preview">{preview && !imageFailed ? <img src={preview} alt={`Fotografia reštaurácie ${form.name}`} onError={() => setImageFailed(true)} /> : <div><Icon name="store" size={34} /><span>{imageFailed ? "Náhľad fotografie nie je dostupný" : "Pridajte fotografiu svojho podniku"}</span></div>}</div>
          <div className="owner-photo-controls"><label className="btn-ghost owner-photo-picker"><Icon name="arrow" size={16} />{preview ? "Vybrať inú fotografiu" : "Vybrať fotografiu"}<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            const selected = event.target.files?.[0]; if (selected) void choosePhoto(selected);
          }} /></label>{(preview || form.image) && <button className="inline-link plain" type="button" onClick={() => { setFile(null); setLocalPreview(null); setPhotoError(null); patch({ image: "" }); if (fileInput.current) fileInput.current.value = ""; }}>Odstrániť fotografiu</button>}</div>
          <small>JPG, PNG alebo WebP, najviac 5 MB. Fotografia bude verejne dostupná. Zmena sa použije po uložení nastavení.</small>
          {preparingPhoto && <p role="status" className="muted">Načítavame fotografiu…</p>}
          {photoError && <p className="form-error" role="alert">{photoError}</p>}
          {file && <p className="owner-photo-filename">Vybraná fotografia: {file.name}</p>}
        </div>
        <div className="owner-settings-section"><div className="owner-settings-section-heading"><Icon name="info" size={20} /><div><h4>Základné údaje</h4><p>IČO: {profile.ico} · {profile.status === "active" ? "Schválená reštaurácia" : "Reštaurácia zatiaľ nie je verejná"}</p></div></div>
          <label>Názov reštaurácie<input required minLength={2} maxLength={120} value={form.name} onChange={(e) => patch({ name: e.target.value })} autoComplete="organization" /></label>
          <label>Krátky popis<textarea rows={2} maxLength={200} value={form.tagline} onChange={(e) => patch({ tagline: e.target.value })} placeholder="Čím je vaša kuchyňa výnimočná?" /></label>
          <label>Kuchyňa<select value={form.cuisine} onChange={(e) => patch({ cuisine: e.target.value })}>{CUISINES.map((cuisine) => <option key={cuisine}>{cuisine}</option>)}</select></label>
        </div>
        <div className="owner-settings-section"><div className="owner-settings-section-heading"><Icon name="phone" size={20} /><div><h4>Kontakt</h4><p>Kontaktné údaje pre vašich hostí.</p></div></div><div className="owner-form-grid">
          <label>E-mail<input required type="email" maxLength={254} value={form.email} onChange={(e) => patch({ email: e.target.value })} autoComplete="email" /></label>
          <label>Telefón<input required minLength={5} maxLength={40} type="tel" value={form.phone} onChange={(e) => patch({ phone: e.target.value })} autoComplete="tel" /></label>
        </div><label>Webová stránka<input type="text" inputMode="url" maxLength={300} value={form.web} onChange={(e) => patch({ web: e.target.value })} placeholder="https://vasarestauracia.sk" /></label></div>
        <div className="owner-settings-section"><div className="owner-settings-section-heading"><Icon name="location" size={20} /><div><h4>Adresa a poloha</h4><p>Kliknutím na mapu upravíte polohu podniku.</p></div></div><div className="owner-form-grid">
          <label>Mesto<select value={form.city} onChange={(e) => patch({ city: e.target.value, district: LOCATIONS[e.target.value][1], lat: "", lng: "" })}>{Object.keys(LOCATIONS).map((city) => <option key={city}>{city}</option>)}</select></label>
          <label>Mestská časť<select value={form.district} onChange={(e) => patch({ district: e.target.value })}>{!LOCATIONS[form.city]?.includes(form.district) && <option>{form.district}</option>}{LOCATIONS[form.city]?.slice(1).map((district) => <option key={district}>{district}</option>)}</select></label>
        </div><label>Adresa<input required minLength={5} maxLength={200} value={form.address} onChange={(e) => patch({ address: e.target.value })} autoComplete="street-address" /></label>
          <OwnerLocationPicker city={form.city} lat={form.lat} lng={form.lng} disabled={busy} onPick={(lat, lng) => patch({ lat, lng })} />
          <div className="owner-form-grid"><label>Zemepisná šírka<input required type="number" min={-90} max={90} step="any" value={form.lat} onChange={(e) => patch({ lat: e.target.value })} /></label><label>Zemepisná dĺžka<input required type="number" min={-180} max={180} step="any" value={form.lng} onChange={(e) => patch({ lng: e.target.value })} /></label></div>
        </div>
        <div className="owner-settings-section"><div className="owner-settings-section-heading"><Icon name="clock" size={20} /><div><h4>Otváracie hodiny</h4><p>Uveďte čas otvorenia pre každý deň.</p></div></div>
          <label className="owner-settings-check"><input type="checkbox" checked={form.showHours} onChange={(e) => patch({ showHours: e.target.checked })} />Zobraziť otváracie hodiny</label>
          {form.showHours && <div className="owner-opening-hours">{form.hours.map((day, index) => <div className="owner-opening-day" key={day.day}><strong>{day.day}</strong><label className="owner-settings-check"><input type="checkbox" checked={day.closed} onChange={(e) => patch({ hours: form.hours.map((entry, i) => i === index ? { ...entry, closed: e.target.checked } : entry) })} />Zatvorené</label>{!day.closed && <div><label><span className="review-sr-only">{day.day} – otvorené od</span><input required aria-label={`${day.day} – otvorené od`} inputMode="numeric" maxLength={5} pattern="([01][0-9]|2[0-3]):[0-5][0-9]" value={day.open} onChange={(e) => patch({ hours: form.hours.map((entry, i) => i === index ? { ...entry, open: e.target.value } : entry) })} /></label><span>–</span><label><span className="review-sr-only">{day.day} – otvorené do</span><input required aria-label={`${day.day} – otvorené do`} inputMode="numeric" maxLength={5} pattern="(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)" value={day.close} onChange={(e) => patch({ hours: form.hours.map((entry, i) => i === index ? { ...entry, close: e.target.value } : entry) })} /></label></div>}</div>)}</div>}
        </div>
        <div className="owner-settings-section">
          <div className="owner-settings-section-heading"><Icon name="truck" size={20} /><div><h4>Donáška</h4><p>Pridajte odkazy, cez ktoré si hostia môžu objednať jedlo.</p></div></div>
          <label className="owner-settings-check"><input type="checkbox" checked={form.delivery} onChange={(e) => patch({ delivery: e.target.checked })} />Reštaurácia poskytuje donášku</label>
          {form.delivery && <>
            {DELIVERY_PROVIDERS.map((provider) => <label key={provider.name}>Odkaz na {provider.name}
              <input type="text" inputMode="url" maxLength={1000} value={form.deliveryLinks.find((link) => link.name === provider.name)?.url ?? ""}
                onChange={(e) => patch({ deliveryLinks: form.deliveryLinks.map((link) => link.name === provider.name ? { ...link, url: e.target.value } : link) })}
                placeholder={provider.placeholder} autoComplete="off" spellCheck={false} />
              <small>Nepovinné · odkaz na váš podnik</small>
            </label>)}

          </>}
        </div>
        <div className="owner-settings-save"><span>{busy ? "Ukladáme údaje a fotografiu…" : dirty ? "Máte neuložené zmeny" : "Všetky nastavenia sú uložené"}</span><div className="owner-actions"><button className="btn-ghost" type="button" disabled={!dirty} onClick={reset}>Zahodiť zmeny</button><button className="btn-primary" type="submit" disabled={!dirty}>{busy ? "Ukladáme…" : "Uložiť nastavenia"}</button></div></div>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="success-note owner-menu-feedback" role="status">{message}</p>}
    </form><OwnerGooglePlace restaurantId={restaurant.id} initialPlaceId={profile.google_place_id ?? ""} disabled={busy || preparingPhoto}
      onDirtyChange={setGoogleDirty} onBusyChange={setGoogleBusy} onSaved={(id) => { setProfile((current) => current && { ...current, google_place_id: id || null }); onSaved(restaurant); }} /></>}
  </section>;
}
