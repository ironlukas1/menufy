import { Link } from "react-router";
import Icon from "@/components/Icon";
import RestaurantCard from "@/components/RestaurantCard";
import { restaurants } from "@/data/restaurants";
import { USER_POS, distanceKm } from "@/lib";
import { useProto } from "@/proto/ProtoContext";

export default function Saved() {
  const { favorites } = useProto();
  const list = restaurants.filter((r) => favorites.includes(r.slug));

  return (
    <div className="page">
      <div className="page-head">
        <p className="section-kicker">Obľúbené</p>
        <h2>Uložené reštaurácie</h2>
        <p className="muted">{list.length} uložených</p>
      </div>
      <div className="restaurant-list">
        {list.map((r) => (
          <RestaurantCard key={r.slug} r={r} day={0} excluded={[]} maxPrice={99} query="" distance={distanceKm(USER_POS, r)} />
        ))}
        {list.length === 0 && (
          <div className="empty-state">
            <span>
              <Icon name="heart" size={26} />
            </span>
            <h3>Zatiaľ nemáte žiadne obľúbené</h3>
            <p>Kliknite na srdce pri reštaurácii a nájdete ju tu.</p>
            <Link className="btn-primary" to="/">
              Prezrieť menu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
