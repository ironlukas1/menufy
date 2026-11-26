import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import Icon from "@/components/Icon";
import Lightbox from "@/components/Lightbox";
import { HeartButton, MenuRow } from "@/components/RestaurantCard";
import RestaurantMapCard from "@/components/RestaurantMapCard";
import { DAYS, dailyFor } from "@/data/restaurants";
import { deliveryLinkUrl, mailtoHref, safeImageUrl, telHref, websiteUrl } from "@/data/restaurantSettings";
import { openStatus } from "@/lib";
import { useRestaurants } from "@/proto/RestaurantContext";
import RestaurantReviews from "@/components/RestaurantReviews";

export default function Detail() {
  const { slug } = useParams();
  const { restaurants, loading } = useRestaurants();
  const r = restaurants.find((place) => place.slug === slug);
  const { hash } = useLocation();
  const [tab, setTab] = useState<"daily" | "standard">("daily");
  const [day, setDay] = useState(0);
  const [photo, setPhoto] = useState<number | null>(null);
  const hasRestaurant = !!r;

  useEffect(() => {
    if (!hash || !hasRestaurant) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash, slug, hasRestaurant]);

  if (!r && loading) return <p className="page" role="status">Načítavame reštauráciu…</p>;

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
  const website = websiteUrl(r.web);
  const cover = safeImageUrl(r.image);
  const gallery = Array.isArray(r.gallery) ? r.gallery.map(safeImageUrl).filter((url): url is string => !!url) : [];
  const phone = telHref(r.phone);
  const mail = mailtoHref(r.email);
  const deliveryLinks = (Array.isArray(r.delivery.links) ? r.delivery.links : []).flatMap((link) => {
    const url = deliveryLinkUrl(link?.name, link?.url);
    return url ? [{ name: typeof link.name === "string" ? link.name : "Donáška", url }] : [];
  });

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        <Icon name="back" size={17} /> Späť na výsledky
      </Link>

      <div className="detail-head">
        <div className="detail-banner" style={cover ? { backgroundImage: `url("${cover}")` } : undefined} />
        <div className="detail-id">
          <div className="detail-title">
            <span className={`open-label ${status.open ? "" : "closed"}`}>{status.label}</span>
            <h2>{r.name}</h2>
            <p className="restaurant-type">{r.tagline}</p>
            <a className="inline-link" href="#google-rating">Hodnotenie z Google Maps ↓</a>
          </div>
          <div className="detail-fav">
            <HeartButton slug={r.slug} />
            <span>Obľúbené</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel" id="contact">
          <h3>Kontakt</h3>
          <ul className="contact-list">
            <li>
              <Icon name="location" size={16} /> <Link to="#location" title="Zobraziť na mape">{r.address}</Link>
            </li>
            {phone && (
              <li>
                <Icon name="phone" size={16} /> <a href={phone}>{r.phone}</a>
              </li>
            )}
            {mail && (
              <li>
                <Icon name="mail" size={16} /> <a href={mail}>{r.email}</a>
              </li>
            )}
            {website && (
              <li>
                <Icon name="globe" size={16} /> <a href={website}>{website}</a>
              </li>
            )}
          </ul>
        </section>
        <section className="panel" id="hours">
          <h3>Otváracie hodiny</h3>
          {r.hours.length === 0 && <p className="muted">Otváracie hodiny zatiaľ neboli uvedené.</p>}
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
            </p>
          ) : (
            <p className="muted">Reštaurácia donášku neposkytuje.</p>
          )}
          {deliveryLinks.map((link) => (
            <a key={link.url} className="btn-ghost block" href={link.url} target="_blank" rel="noopener noreferrer">
              Objednať cez {link.name} <Icon name="arrow" size={16} />
            </a>
          ))}

        </section>
      </div>

      <RestaurantMapCard restaurant={r} />

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
            {dailyFor(r, day).length === 0 && <p className="muted">Na tento deň zatiaľ nebolo zverejnené menu.</p>}
            <div className="menu-list flush">
              {dailyFor(r, day).map((it) => (
                <MenuRow key={it.name} item={it} />
              ))}
            </div>
            <p className="menu-note">{r.live ? "Menu zverejňuje reštaurácia." : "Denné menu sa aktualizuje automaticky každé ráno."}</p>
          </>
        )}
        {tab === "standard" && r.standard.length === 0 && <p className="muted">Stále menu zatiaľ nebolo zverejnené.</p>}
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
        {gallery.length === 0 && <p className="muted">Reštaurácia zatiaľ nepridala fotografie.</p>}
        <div className="gallery">
          {gallery.map((image, i) => (
            <button key={`${image}-${i}`} className="gallery-item" onClick={() => setPhoto(i)} aria-label={`Zväčšiť fotku ${i + 1}`}>
              <img src={image} alt={`${r.name} – fotka ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
        {photo !== null && photo < gallery.length && (
          <Lightbox images={gallery} index={photo} alt={r.name} onClose={() => setPhoto(null)} onIndex={setPhoto} />
        )}
      </section>

      <RestaurantReviews key={r.slug} restaurant={r} />
    </article>
  );
}
