import { useState } from "react";
import { Link } from "react-router";
import Icon, { type IconName } from "@/components/Icon";
import { notices } from "@/data/notifications";

const kinds: Record<string, { icon: IconName; label: string }> = {
  menu: { icon: "calendar", label: "Denné menu" },
  offer: { icon: "star", label: "Ponuka" },
  system: { icon: "bell", label: "Systém" },
};

export default function Notifications() {
  const [items, setItems] = useState(notices);
  return (
    <div className="page">
      <div className="page-head page-head-row">
        <div>
          <p className="section-kicker">Centrum upozornení</p>
          <h2>Upozornenia</h2>
        </div>
        <Link to="/settings#notifications" className="btn-ghost">
          <Icon name="settings" size={16} /> Nastaviť upozornenia
        </Link>
      </div>
      <ul className="notice-list">
        {items.map((n) => (
          <li key={n.id} className={`notice ${n.kind}`}>
            <span className="notice-icon">
              <Icon name={kinds[n.kind].icon} size={18} />
            </span>
            <div>
              <div className="notice-meta">
                <span className="menu-tag">{kinds[n.kind].label}</span>
                <small>{n.time}</small>
              </div>
              <strong>{n.title}</strong>
              <p>{n.body}</p>
              {n.slug && (
                <Link to={`/restaurant/${n.slug}`} className="inline-link">
                  Zobraziť menu <Icon name="arrow" size={14} />
                </Link>
              )}
            </div>
            <button
              className="notice-delete"
              onClick={() => setItems((l) => l.filter((x) => x.id !== n.id))}
              aria-label={`Odstrániť upozornenie: ${n.title}`}
            >
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <div className="empty-state">
          <span>
            <Icon name="bell" size={26} />
          </span>
          <h3>Žiadne upozornenia</h3>
          <p>Keď bude niečo nové, uvidíte to tu.</p>
        </div>
      )}
    </div>
  );
}
