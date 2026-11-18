import { Link, useNavigate } from "react-router";
import Icon from "@/components/Icon";
import { useProto } from "@/proto/ProtoContext";

const initials = (name: string, email: string) => {
  const source = name && name !== "Člen menufy" ? name : email.split("@")[0] || "M";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toLocaleUpperCase("sk");
};

export default function Account() {
  const { loggedIn, setLoggedIn, email, displayName } = useProto();
  const nav = useNavigate();

  return (
    <div className="page narrow">
      <div className="page-head">
        <p className="section-kicker">Môj profil</p>
        <h2>Účet</h2>
      </div>

      {loggedIn ? (
        <section className="panel account-card">
          <span className="account-avatar" aria-hidden="true">
            {initials(displayName, email)}
          </span>
          <div className="account-id">
            <strong>{displayName}</strong>
            <span>{email}</span>
          </div>
        </section>
      ) : (
        <section className="panel account-card">
          <span className="account-avatar guest" aria-hidden="true">
            <Icon name="user" size={24} />
          </span>
          <div className="account-id">
            <strong>Nie ste prihlásený</strong>
            <span>Prihláste sa a majte obľúbené, upozornenia aj nastavenia na jednom mieste.</span>
          </div>
          <Link to="/login?next=/account" className="btn-primary">
            Prihlásiť sa
          </Link>
        </section>
      )}

      <section className="panel account-links">
        <Link to="/settings" className="account-link">
          <span className="account-link-icon">
            <Icon name="settings" size={19} />
          </span>
          <span>
            <strong>Nastavenia</strong>
            <small>Meno, e-mail, heslo, vzhľad a upozornenia</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/saved" className="account-link">
          <span className="account-link-icon">
            <Icon name="heart" size={19} />
          </span>
          <span>
            <strong>Obľúbené</strong>
            <small>Reštaurácie, ktoré ste si uložili</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/notifications" className="account-link">
          <span className="account-link-icon">
            <Icon name="bell" size={19} />
          </span>
          <span>
            <strong>Upozornenia</strong>
            <small>Novinky a denné súhrny menu</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/owners" className="account-link">
          <span className="account-link-icon">
            <Icon name="store" size={19} />
          </span>
          <span>
            <strong>Vlastníš reštauráciu?</strong>
            <small>Spravujte menu a profil podniku</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
      </section>

      {loggedIn && (
        <div className="account-actions">
          <button
            className="btn-ghost"
            onClick={() => {
              setLoggedIn(false);
              nav("/");
            }}
          >
            <Icon name="logout" size={16} /> Odhlásiť sa
          </button>
        </div>
      )}
    </div>
  );
}
