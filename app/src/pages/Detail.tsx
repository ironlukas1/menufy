import { useState } from "react";
import { Link, useParams } from "react-router";
import Icon from "@/components/Icon";
import Lightbox from "@/components/Lightbox";
import { HeartButton, MenuRow } from "@/components/RestaurantCard";
import { DAYS, bySlug, dailyFor } from "@/data/restaurants";
import { openStatus } from "@/lib";
import RestaurantReviews from "@/components/RestaurantReviews";

export default function Detail() {
  const { slug } = useParams();
  const r = bySlug(slug);
  const [tab, setTab] = useState<"daily" | "standard">("daily");
  const [day, setDay] = useState(0);
  const [photo, setPhoto] = useState<number | null>(null);

  if (!r)
    return (
      <div className="empty-state">
        <h3>Reštaurácia sa nenašla</h3>
        <Link className="btn-primary" to="/">
          Späť na výsledky
        </Link>
      </div>
    );

  const status = openStatus(r);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        <Icon name="back" size={17} /> Späť na výsledky
      </Link>

      <div className="detail-head">
        <div className="detail-banner" style={{ backgroundImage: `url(${r.image})` }} />
        <div className="detail-id">
          <span className="detail-logo">{r.initials}</span>
          <div className="detail-title">
            <span className={`open-label ${status.open ? "" : "closed"}`}>{status.label}</span>
            <h2>{r.name}</h2>
            <p className="restaurant-type">{r.tagline}</p>
          </div>
          <div className="detail-fav">
            <HeartButton slug={r.slug} />
            <span>Obľúbené</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h3>Kontakt</h3>
          <ul className="contact-list">
            <li>
              <Icon name="location" size={16} /> {r.address}
            </li>
            {r.phone && (
              <li>
                <Icon name="phone" size={16} /> <a href={`tel:${r.phone.replace(/\s/g, "")}`}>{r.phone}</a>
              </li>
            )}
            {r.email && (
              <li>
                <Icon name="mail" size={16} /> <a href={`mailto:${r.email}`}>{r.email}</a>
              </li>
            )}
            {r.web && (
              <li>
                <Icon name="globe" size={16} /> <a href={`https://${r.web}`}>{r.web}</a>
              </li>
            )}
          </ul>
        </section>
        <section className="panel">
          <h3>Otváracie hodiny</h3>
          <table className="hours">
            <tbody>
              {r.hours.map(([d, h], i) => (
                <tr key={d} className={i === todayIdx ? "today" : ""}>
                  <th>{d}</th>
                  <td>{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h3>Donáška</h3>
          {r.delivery.available ? (
            <p className="delivery-info">
              <Icon name="truck" size={18} /> Donáška k dispozícii
              <strong>{r.delivery.eta}</strong>
            </p>
          ) : (
            <p className="muted">Reštaurácia donášku neposkytuje.</p>
          )}
          {r.delivery.links?.map((l) => (
            <a key={l.url} className="btn-ghost block" href={l.url} target="_blank" rel="noopener noreferrer">
              Objednať cez {l.name} <Icon name="arrow" size={16} />
            </a>
          ))}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Menu</h3>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "daily"} className={tab === "daily" ? "on" : ""} onClick={() => setTab("daily")}>
              Denné menu
            </button>
            <button role="tab" aria-selected={tab === "standard"} className={tab === "standard" ? "on" : ""} onClick={() => setTab("standard")}>
              Stále menu
            </button>
          </div>
        </div>
        {tab === "daily" && (
          <>
            <div className="chips day-chips">
              {DAYS.map((d, i) => (
                <button key={d.label} className={`chip ${day === i ? "on" : ""}`} aria-pressed={day === i} onClick={() => setDay(i)}>
                  {d.short}
                </button>
              ))}
            </div>
            <div className="menu-list flush">
              {dailyFor(r, day).map((it) => (
                <MenuRow key={it.name} item={it} />
              ))}
            </div>
            <p className="menu-note">Denné menu sa aktualizuje automaticky každé ráno.</p>
          </>
        )}
        {tab === "standard" && (
          <div className="menu-list flush">
            {r.standard.map((it) => (
              <MenuRow key={it.name} item={it} />
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>Fotogaléria</h3>
        <div className="gallery">
          {r.gallery.map((g, i) => (
            <button key={i} className="gallery-item" onClick={() => setPhoto(i)} aria-label={`Zväčšiť fotku ${i + 1}`}>
              <img src={g} alt={`${r.name} – fotka ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
        {photo !== null && (
          <Lightbox images={r.gallery} index={photo} alt={r.name} onClose={() => setPhoto(null)} onIndex={setPhoto} />
        )}
      </section>

      <RestaurantReviews key={r.slug} restaurant={r} />
    </article>
  );
}
