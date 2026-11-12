import { Link } from "react-router";
import Icon from "@/components/Icon";
import { useProto } from "@/proto/ProtoContext";

export default function Account() {
  const { loggedIn, email, displayName, setLoggedIn } = useProto();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("sk"))
    .join("");

  return (
    <div className="page narrow">
      <div className="page-head">
        <p className="section-kicker">Menufy</p>
        <h2>Účet</h2>
        <p className="muted">Váš profil a osobné predvoľby.</p>
      </div>

      <section className="panel account-card">
        <div className={`account-avatar ${loggedIn ? "" : "guest"}`}>
          {loggedIn && initials ? initials : <Icon name="user" size={26} />}
        </div>
        <div className="account-id">
          <strong>{loggedIn ? displayName : "Hosť"}</strong>
          <span>{loggedIn ? email : "Prihláste sa a spravujte svoj účet."}</span>
        </div>
        {!loggedIn && (
          <Link to="/login?next=/account" className="btn-primary">
            <Icon name="user" size={16} /> Prihlásiť sa
          </Link>
        )}
      </section>

      <section className="panel account-links" aria-label="Možnosti účtu">
        <Link to="/settings" className="account-link">
          <span className="account-link-icon"><Icon name="settings" size={19} /></span>
          <span><strong>Nastavenia</strong><small>Vzhľad, upozornenia a podpora</small></span>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/saved" className="account-link">
          <span className="account-link-icon"><Icon name="heart" size={19} /></span>
          <span><strong>Uložené reštaurácie</strong><small>Vaše obľúbené miesta</small></span>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/notifications" className="account-link">
          <span className="account-link-icon"><Icon name="bell" size={19} /></span>
          <span><strong>Upozornenia</strong><small>Novinky o obľúbených reštauráciách</small></span>
          <Icon name="arrow" size={18} />
        </Link>
      </section>

      {loggedIn && (
        <button className="btn-ghost account-actions" onClick={() => setLoggedIn(false)}>
          <Icon name="logout" size={16} /> Odhlásiť sa
        </button>
      )}
    </div>
  );
}
