import { useEffect, useState, type ReactNode } from "react";
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

export default function Settings() {
  const { loggedIn, setLoggedIn, theme, setTheme, dark, email } = useProto();
  const nav = useNavigate();
  const { hash } = useLocation();
  const [modal, setModal] = useState<null | "email" | "delete">(null);
  const [n, setN] = useState({ daily: true, fav: true, promo: false });
  const [faq, setFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);

  const faqs = [
    ["Ako často sa menu aktualizuje?", "Reštaurácie zverejňujú denné menu každé ráno. Aktualizácie sa zobrazia okamžite."],
    ["Ako zistím alergény?", "Pri každom jedle sú uvedené čísla alergénov podľa EÚ (1–14). V Filtroch ich môžete vylúčiť."],
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
            <div className="kv">
              <span>Aktuálny e-mail</span>
              <strong>{email}</strong>
            </div>
            <button className="btn-ghost" onClick={() => setModal("email")}>
              <Icon name="mail" size={16} /> Zmeniť e-mail
            </button>
          </Section>

          <Section title="Zabezpečenie">
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <label>
                Aktuálne heslo
                <input type="password" autoComplete="current-password" placeholder="••••••••" />
              </label>
              <label>
                Nové heslo
                <input type="password" autoComplete="new-password" placeholder="Min. 8 znakov, 1 veľké písmeno, 1 číslo" />
              </label>
              <label>
                Potvrdiť nové heslo
                <input type="password" autoComplete="new-password" placeholder="Zopakujte nové heslo" />
              </label>
              <button className="btn-primary">Zmeniť heslo</button>
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
        <Toggle label="Denné súhrny menu" desc="Každé ráno prehľad menu vašich obľúbených." on={n.daily} set={(v) => setN({ ...n, daily: v })} />
        <Toggle label="Upozornenia obľúbených reštaurácií" desc="Keď obľúbená reštaurácia zverejní menu." on={n.fav} set={(v) => setN({ ...n, fav: v })} />
        <Toggle label="Promo a marketingové novinky" on={n.promo} set={(v) => setN({ ...n, promo: v })} />
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
          <a href="#terms">Podmienky používania</a>
          <a href="#privacy">Ochrana osobných údajov</a>
        </div>
      </Section>

      {loggedIn && (
        <Section title="Akcie s účtom" danger>
          <div className="action-row">
            <button
              className="btn-ghost"
              onClick={() => {
                setLoggedIn(false);
                nav("/");
              }}
            >
              <Icon name="logout" size={16} /> Odhlásiť sa
            </button>
            <button className="btn-danger" onClick={() => setModal("delete")}>
              <Icon name="trash" size={16} /> Zmazať účet
            </button>
          </div>
        </Section>
      )}

      {modal === "email" && (
        <Modal title="Zmeniť e-mail" onClose={() => setModal(null)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setModal(null);
            }}
          >
            <label>
              Nový e-mail
              <input type="email" placeholder="novy@email.sk" />
            </label>
            <label>
              Heslo pre potvrdenie
              <input type="password" placeholder="••••••••" />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>
                Zrušiť
              </button>
              <button className="btn-primary">Uložiť</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "delete" && (
        <Modal title="Zmazať účet?" onClose={() => setModal(null)}>
          <p className="muted">Tento krok je nevratný. Zmažeme váš účet, obľúbené reštaurácie aj hodnotenia.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Zrušiť
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                setModal(null);
                setLoggedIn(false);
                nav("/");
              }}
            >
              Áno, zmazať účet
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
