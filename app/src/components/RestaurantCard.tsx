import { Link, useLocation, useNavigate } from "react-router";
import Icon from "./Icon";
import { dailyFor, formatPrice, type MenuItem, type Restaurant } from "@/data/restaurants";
import { fmtKm, openStatus } from "@/lib";
import { useProto } from "@/proto/ProtoContext";

export function useFavorite(slug: string) {
  const { loggedIn, favorites, toggleFavorite } = useProto();
  const nav = useNavigate();
  const loc = useLocation();
  return {
    active: loggedIn && favorites.includes(slug),
    toggle: () => {
      if (!loggedIn) nav(`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`);
      else toggleFavorite(slug);
    },
  };
}

export function HeartButton({ slug }: { slug: string }) {
  const { active, toggle } = useFavorite(slug);
  return (
    <button
      className={`favorite ${active ? "selected" : ""}`}
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Odstrániť z obľúbených" : "Pridať do obľúbených"}
    >
      <Icon name="heart" size={20} filled={active} />
    </button>
  );
}

export function MenuRow({ item, hit }: { item: MenuItem; hit?: boolean }) {
  return (
    <div className={`menu-item ${hit ? "hit" : ""}`}>
      <span className={`menu-tag ${/Vege|Fit|Vegán/.test(item.tag) ? "green" : ""}`}>{item.tag}</span>
      <div className="meal-copy">
        <h4>{item.name}</h4>
        <p className="meal-desc">{item.desc}</p>
        <p>
          {item.weight} <i /> Alergény: {item.allergens.length ? item.allergens.join(", ") : "–"}
        </p>
      </div>
      <strong className="price">{formatPrice(item.price)}</strong>
    </div>
  );
}

export default function RestaurantCard({
  r,
  day,
  excluded,
  maxPrice,
  query,
  distance,
  selected,
}: {
  r: Restaurant;
  day: number;
  excluded: string[];
  maxPrice: number;
  query: string;
  distance: number;
  selected?: boolean;
}) {
  const status = openStatus(r);
  const q = query.trim().toLocaleLowerCase("sk");
  const items = dailyFor(r, day).filter(
    (it) => it.price <= maxPrice && !it.allergens.some((a) => excluded.includes(String(a))),
  );
  const date = day === 0 ? "Dnes" : ["", "Piatok", "Pondelok", "Utorok"][day];

  return (
    <article className={`restaurant-card ${selected ? "is-selected" : ""}`}>
      <div className="restaurant-top">
        <Link to={`/restaurant/${r.slug}`} className="card-img" aria-label={`Detail ${r.name}`}>
          <img src={r.image} alt={`Jedlo z reštaurácie ${r.name}`} loading="lazy" />
          <span className="card-logo">{r.initials}</span>
        </Link>
        <div className="restaurant-info">
          <div className="restaurant-title-row">
            <div>
              <span className={`open-label ${status.open ? "" : "closed"}`}>{status.label}</span>
              <h3>
                <Link to={`/restaurant/${r.slug}`}>{r.name}</Link>
              </h3>
              <p className="restaurant-type">{r.tagline}</p>
            </div>
            <HeartButton slug={r.slug} />
          </div>
          <div className="restaurant-meta">
            <span className="rating" title="Hodnotenie Google">
              <Icon name="star" size={16} filled /> <strong>{r.rating.toFixed(1).replace(".", ",")}</strong>
              <em>({r.ratingCount})</em>
            </span>
            <span>
              <Icon name="location" size={15} /> {fmtKm(distance)}
            </span>
            {r.delivery.available && (
              <span className="delivery-badge">
                <Icon name="truck" size={17} /> Donáška · {r.delivery.eta}
              </span>
            )}
          </div>
          <p className="detail-line">
            <Icon name="location" size={15} /> {r.address}
          </p>
          <p className="detail-line">
            <span className="desktop-only phone-line">
              <Icon name="phone" size={15} /> {r.phone}
              <i />
            </span>
            <Icon name="clock" size={15} /> {r.todayHours}
          </p>
        </div>
      </div>
      <div className="menu-heading">
        <span>Denné menu</span>
        <span className="menu-date">{date}</span>
      </div>
      <div className="menu-list">
        {items.map((it) => (
          <MenuRow key={it.name} item={it} hit={!!q && it.name.toLocaleLowerCase("sk").includes(q)} />
        ))}
        {items.length === 0 && <p className="menu-empty">Žiadne jedlo nevyhovuje filtrom.</p>}
      </div>
      <Link className="card-action" to={`/restaurant/${r.slug}`}>
        Zobraziť detail reštaurácie <Icon name="arrow" size={17} />
      </Link>
    </article>
  );
}
