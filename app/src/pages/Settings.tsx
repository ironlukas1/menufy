import { supabase } from "@/supabase";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import { useProto } from "@/proto/ProtoContext";

function Toggle({ label, desc, on, set }: { label: string; desc?: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        {desc && <small>{desc}</small>}
      </div>
      <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? "on" : ""}`} onClick={() => set(!on)}>
        <span />
      </button>
    </div>
  );
}

function Section({ id, title, children, danger }: { id?: string; title: string; children: ReactNode; danger?: boolean }) {
  return (
    <section id={id} className={`panel settings-section ${danger ? "danger-zone" : ""}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

// Supabase error text is not localized; map known codes and keep a safe fallback.
const authUpdateError = (error: { code?: string }) => {
  switch (error.code) {
    case "weak_password": return "Heslo je príliš slabé. Použite min. 8 znakov, veľké písmeno a číslo.";
    case "same_password": return "Nové heslo sa musí líšiť od aktuálneho.";
    case "email_address_invalid": return "Zadajte platnú e-mailovú adresu.";
    case "email_address_not_authorized": return "Túto e-mailovú adresu nie je možné použiť.";
    case "email_address_exists": return "Túto e-mailovú adresu už používa iný účet.";
    case "over_email_send_rate_limit": return "Odosielanie overovacích e-mailov je dočasne obmedzené. Skúste to neskôr.";
    case "session_not_found": case "bad_jwt": return "Prihlásenie vypršalo. Prihláste sa znova.";
    default: return "Zmenu sa nepodarilo uložiť. Skúste znova.";
  }
};

export default function Settings() {
  const { loggedIn, signOut, theme, setTheme, dark, email, displayName, userId, notify: n, setNotify } = useProto();
  const nav = useNavigate();
  const { hash } = useLocation();
  const [modal, setModal] = useState<null | "email" | "delete">(null);
  const [faq, setFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [username, setUsername] = useState(displayName === "Člen menufy" ? "" : displayName);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    setUsername(displayName === "Člen menufy" ? "" : displayName);
    setNameError(null);
    setNameSaved(false);
  }, [displayName, userId]);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (nameBusy || !userId) return;
    setNameError(null);
    setNameSaved(false);
    const name = username.trim();
    if (name.length < 2 || name.length > 60)
      return setNameError("Používateľské meno musí mať 2 až 60 znakov.");
    setNameBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
      if (error) setNameError("Meno sa nepodarilo uložiť. Skúste znova.");
      else setNameSaved(true);
    } catch {
      setNameError("Meno sa nepodarilo uložiť. Skúste znova.");
    } finally {
      setNameBusy(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (pwBusy || !userId) return;
    setPwError(null);
    setPwSaved(false);
    if (pw !== pw2) return setPwError("Zadané heslá sa nezhodujú.");
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/\d/.test(pw))
      return setPwError("Heslo musí mať min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.");
    setPwBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) setPwError(authUpdateError(error));
      else {
        setPw(""); setPw2(""); setPwSaved(true);
      }
    } catch {
      setPwError("Heslo sa nepodarilo zmeniť. Skúste znova.");
    } finally {
      setPwBusy(false);
    }
  };

  const saveEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (emailBusy) return;
    const mail = newEmail.trim();
    setEmailError(null);
    setEmailSent(false);
    if (!/^[A-Za-z0-9._+'-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/.test(mail))
      return setEmailError("Zadajte platnú e-mailovú adresu.");
    setEmailBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: mail });
      if (error) setEmailError(authUpdateError(error));
      else setEmailSent(true);
    } catch {
      setEmailError("E-mail sa nepodarilo zmeniť. Skúste znova.");
    } finally {
      setEmailBusy(false);
    }
  };

  const deleteAccount = async () => {
    const { error } = await supabase.rpc("delete_user");
    if (error) return setDeleteError("Účet sa nepodarilo zmazať. Skúste to znova.");
    setModal(null);
    signOut();
    nav("/");
  };

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);

  const faqs = [
    ["Ako často sa menu aktualizuje?", "Reštaurácie zverejňujú denné menu každé ráno. Aktualizácie sa zobrazia okamžite."],
    ["Ako zistím alergény?", "Pri každom jedle nájdete zoznam alergénov podľa názvu. V Filtroch môžete vybrať tie, ktoré chcete vylúčiť."],
    ["Je menufy spoplatnené?", "Nie, pre používateľov aj reštaurácie je služba v úvodnej fáze zadarmo."],
  ];

  return (
    <div className="page narrow">
      <div className="page-head">
        <p className="section-kicker">Účet a predvoľby</p>
        <h2>Nastavenia</h2>
      </div>

      {loggedIn ? (
        <>
          <Section title="Účet">
            <form className="form" onSubmit={saveName}>
              <label>
                Používateľské meno
                <input type="text" autoComplete="nickname" required minLength={2} maxLength={60} value={username}
                  disabled={nameBusy} onChange={(e) => { setUsername(e.target.value); setNameSaved(false); }}
                  placeholder="Vaše meno alebo prezývka" />
                <small>Toto meno sa zobrazí pri nových recenziách.</small>
              </label>
              {nameError && <p className="form-error" role="alert">{nameError}</p>}
              {nameSaved && <p className="success-note" role="status">Používateľské meno bolo uložené.</p>}
              <button className="btn-primary" disabled={nameBusy || !userId}>{nameBusy ? "Ukladáme…" : "Uložiť meno"}</button>
            </form>
            <div className="kv">
              <span>Aktuálny e-mail</span>
              <strong>{email}</strong>
            </div>
            <button className="btn-ghost" onClick={() => { setNewEmail(""); setEmailError(null); setEmailSent(false); setModal("email"); }}>
              <Icon name="mail" size={16} /> Zmeniť e-mail
            </button>
          </Section>

          <Section title="Zabezpečenie">
            <form className="form" onSubmit={savePassword}>
              <label>
                Nové heslo
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={128}
                  disabled={pwBusy} value={pw} onChange={(e) => { setPw(e.target.value); setPwSaved(false); }}
                  placeholder="Min. 8 znakov, 1 veľké písmeno, 1 číslo" />
              </label>
              <label>
                Potvrdiť nové heslo
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={128}
                  disabled={pwBusy} value={pw2} onChange={(e) => { setPw2(e.target.value); setPwSaved(false); }}
                  placeholder="Zopakujte nové heslo" />
              </label>
              {pwError && <p className="form-error" role="alert">{pwError}</p>}
              {pwSaved && <p className="success-note" role="status">Heslo bolo zmenené.</p>}
              <button className="btn-primary" disabled={pwBusy || !userId}>{pwBusy ? "Ukladáme…" : "Zmeniť heslo"}</button>
            </form>
          </Section>
        </>
      ) : (
        <div className="guest-note">
          <Icon name="user" size={20} />
          <div>
            <strong>Nie ste prihlásený</strong>
            <span>Prihláste sa a nastavíte si e-mail, heslo a upozornenia.</span>
          </div>
          <Link to="/login?next=/settings" className="btn-primary">
            Prihlásiť sa
          </Link>
        </div>
      )}

      <Section id="notifications" title="Predvoľby">
        <Toggle
          label="Tmavý režim"
          desc={theme === "system" ? `Podľa systému (${dark ? "tmavý" : "svetlý"})` : undefined}
          on={dark}
          set={(v) => setTheme(v ? "dark" : "light")}
        />
        {theme !== "system" && (
          <button className="inline-link plain" onClick={() => setTheme("system")}>
            Použiť systémové nastavenie
          </button>
        )}
        <h4 className="subhead">Push a e-mailové upozornenia</h4>
        <Toggle label="Denné súhrny menu" desc="Každé ráno prehľad menu vašich obľúbených." on={n.daily} set={(v) => setNotify({ daily: v })} />
        <Toggle label="Upozornenia obľúbených reštaurácií" desc="Keď obľúbená reštaurácia zverejní menu." on={n.fav} set={(v) => setNotify({ fav: v })} />
        <Toggle label="Promo a marketingové novinky" on={n.promo} set={(v) => setNotify({ promo: v })} />
      </Section>

      <Section title="Podpora a právne informácie">
        <h4 className="subhead">Časté otázky</h4>
        <div className="faq">
          {faqs.map(([q, a], i) => (
            <div key={q} className={faq === i ? "open" : ""}>
              <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                {q} <Icon name="chevron" size={16} />
              </button>
              {faq === i && <p>{a}</p>}
            </div>
          ))}
        </div>
        <h4 className="subhead">Napíšte nám</h4>
        {sent ? (
          <p className="success-note">Ďakujeme, správu sme prijali. Ozveme sa do 2 pracovných dní.</p>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label>
              Správa
              <textarea rows={3} placeholder="Čo vám chýba, alebo čo nefunguje?" />
            </label>
            <button className="btn-ghost">Odoslať</button>
          </form>
        )}
        <div className="legal-links">
          <Link to="/terms">Podmienky používania</Link>
          <Link to="/privacy">Ochrana osobných údajov</Link>
        </div>
      </Section>

      {loggedIn && (
        <Section title="Akcie s účtom" danger>
          <div className="action-row">
            <button
              className="btn-ghost"
              onClick={() => {
                signOut();
                nav("/");
              }}
            >
              <Icon name="logout" size={16} /> Odhlásiť sa
            </button>
            <button className="btn-danger" onClick={() => { setDeleteError(null); setModal("delete"); }}>
              <Icon name="trash" size={16} /> Zmazať účet
            </button>
          </div>
        </Section>
      )}

      {modal === "email" && (
        <Modal title="Zmeniť e-mail" onClose={() => setModal(null)}>
          <form className="form" onSubmit={saveEmail}>
            <label>
              Nový e-mail
              <input type="email" required maxLength={254} autoComplete="email" placeholder="novy@email.sk"
                disabled={emailBusy} value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setEmailSent(false); }} />
              <small>Na novú adresu pošleme overovací odkaz.</small>
            </label>
            {emailError && <p className="form-error" role="alert">{emailError}</p>}
            {emailSent && <p className="success-note" role="status">Ak je nová adresa dostupná, poslali sme na ňu overovací odkaz. Skontrolujte schránku.</p>}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>
                Zrušiť
              </button>
              <button className="btn-primary" disabled={emailBusy}>{emailBusy ? "Ukladáme…" : "Uložiť"}</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "delete" && (
        <Modal title="Zmazať účet?" onClose={() => setModal(null)}>
          <p className="muted">Tento krok je nevratný. Zmažeme váš účet, obľúbené reštaurácie aj hodnotenia.</p>
          {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Zrušiť
            </button>
            <button className="btn-danger" onClick={deleteAccount}>
              Áno, zmazať účet
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
