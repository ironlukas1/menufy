import { useEffect, useMemo, useState, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "close"
  | "filter"
  | "heart"
  | "location"
  | "map"
  | "minus"
  | "phone"
  | "search"
  | "star"
  | "truck"
  | "user";

function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="m9 18 6-6-6-6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />,
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    star: <path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1L12 2Z" />,
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const restaurants = [
  {
    id: "mlyn",
    name: "Bistro Mlyn",
    type: "Moderná slovenská kuchyňa",
    address: "Mlynské nivy 12, Ružinov",
    phone: "+421 910 234 567",
    rating: 4.8,
    distance: 0.8,
    delivery: true,
    time: "11:00 – 15:00",
    image:
      "https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: ["36%", "39%"],
    menu: [
      { name: "Tekvicový krém, pražené semienka", weight: "0,33 l", allergens: "7, 8", price: 3.2, tag: "Polievka" },
      { name: "Kuracie supreme, zemiakové pyré, hrášok", weight: "150 / 200 g", allergens: "7", price: 9.9, tag: "Menu 1" },
      { name: "Hubové rizoto s parmezánom", weight: "350 g", allergens: "7, 9", price: 8.9, tag: "Vege" },
    ],
  },
  {
    id: "oliva",
    name: "Oliva Kitchen",
    type: "Stredomorská kuchyňa",
    address: "Prievozská 6, Ružinov",
    phone: "+421 948 112 390",
    rating: 4.6,
    distance: 1.4,
    delivery: true,
    time: "10:30 – 14:30",
    image:
      "https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: ["61%", "57%"],
    menu: [
      { name: "Paradajková polievka s bazalkou", weight: "0,33 l", allergens: "7", price: 2.9, tag: "Polievka" },
      { name: "Grilovaný losos, kuskus, jogurtový dip", weight: "150 / 180 g", allergens: "4, 7", price: 11.9, tag: "Menu 1" },
      { name: "Cícerový šalát s fetou a olivami", weight: "380 g", allergens: "7", price: 8.5, tag: "Fit" },
    ],
  },
  {
    id: "stol",
    name: "Pri jednom stole",
    type: "Poctivá domáca kuchyňa",
    address: "Záhradnícka 21, Staré Mesto",
    phone: "+421 903 875 221",
    rating: 4.9,
    distance: 2.1,
    delivery: false,
    time: "11:00 – 15:30",
    image:
      "https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: ["47%", "25%"],
    menu: [
      { name: "Slepačí vývar s domácimi rezancami", weight: "0,33 l", allergens: "1, 3, 9", price: 3.1, tag: "Polievka" },
      { name: "Hovädzie líčka, tarhoňa, koreňová zelenina", weight: "150 / 200 g", allergens: "1, 9", price: 12.5, tag: "Menu 1" },
      { name: "Pečená cvikla, kozí syr, vlašské orechy", weight: "320 g", allergens: "7, 8", price: 8.9, tag: "Vege" },
    ],
  },
];

function SelectField({
  icon,
  label,
  value,
  onChange,
  children,
}: {
  icon?: IconName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="field">
      {icon && <Icon name={icon} size={18} />}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        {children}
      </select>
      <Icon name="chevron" size={16} />
    </label>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Bratislava – Ružinov");
  const [day, setDay] = useState("Dnes, streda 14. 5.");
  const [price, setPrice] = useState("Všetky ceny");
  const [rating, setRating] = useState("Akékoľvek hodnotenie");
  const [allergen, setAllergen] = useState("Všetky alergény");
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [sort, setSort] = useState("rating");
  const [favorites, setFavorites] = useState<string[]>(["mlyn"]);
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const selectedAllergen = allergen.match(/\d+/)?.[0];

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocation("Bratislava – Ružinov"),
      () => undefined,
      { timeout: 5000 },
    );
  }, []);

  const filteredRestaurants = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("sk");
    const maximumPrice = price === "Do 9 €" ? 9 : price === "Do 11 €" ? 11 : Infinity;
    const minimumRating = rating === "4,5 a viac" ? 4.5 : rating === "4,8 a viac" ? 4.8 : 0;
    return restaurants
      .filter((restaurant) => restaurantFilter === "all" || restaurant.id === restaurantFilter)
      .filter((restaurant) => !deliveryOnly || restaurant.delivery)
      .filter((restaurant) => restaurant.rating >= minimumRating)
      .filter((restaurant) =>
        restaurant.menu.some(
          (item) =>
            item.price <= maximumPrice &&
            (!selectedAllergen || !item.allergens.split(", ").includes(selectedAllergen)),
        ),
      )
      .filter(
        (restaurant) =>
          !normalized ||
          restaurant.name.toLocaleLowerCase("sk").includes(normalized) ||
          restaurant.menu.some((item) => item.name.toLocaleLowerCase("sk").includes(normalized)),
      )
      .sort((a, b) => {
        if (sort === "price") return Math.min(...a.menu.map((item) => item.price)) - Math.min(...b.menu.map((item) => item.price));
        if (sort === "distance") return a.distance - b.distance;
        return b.rating - a.rating;
      });
  }, [deliveryOnly, price, query, rating, restaurantFilter, selectedAllergen, sort]);

  const visibleMenu = (menu: (typeof restaurants)[number]["menu"]) => {
    const maximumPrice = price === "Do 9 €" ? 9 : price === "Do 11 €" ? 11 : Infinity;
    return menu.filter(
      (item) =>
        item.price <= maximumPrice &&
        (!selectedAllergen || !item.allergens.split(", ").includes(selectedAllergen)),
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectRestaurant = (id: string) => {
    setRestaurantFilter(id);
    setMapExpanded(false);
    window.scrollTo({ top: 360, behavior: "smooth" });
  };

  const resetFilters = () => {
    setQuery("");
    setPrice("Všetky ceny");
    setRating("Akékoľvek hodnotenie");
    setAllergen("Všetky alergény");
    setDeliveryOnly(false);
    setRestaurantFilter("all");
  };

  return (
    <div className="app-shell">
      <main>
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-inner">
            <div className="hero-top">
              <div className="hero-brand" aria-label="Menufy">
                <span className="hero-brand-mark"><span /></span>
                <span>menufy</span>
              </div>
              <button className="sign-in-button">
                <Icon name="user" size={17} />
                Sign in
              </button>
            </div>
            <p className="eyebrow">Dobrý obed je bližšie, než si myslíte</p>
            <h1>Čo si dáte dnes?</h1>
            <p className="hero-copy">Objavte najlepšie denné menu vo vašom okolí. Čerstvé, prehľadné a bez zdĺhavého hľadania.</p>
            <div className="search-controls">
              <div className="search-box">
                <Icon name="search" size={22} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Hľadať jedlo a reštauráciu…"
                  aria-label="Hľadať jedlo a reštauráciu"
                />
                {query && (
                  <button className="clear-search" onClick={() => setQuery("")} aria-label="Vymazať vyhľadávanie">
                    <Icon name="close" size={17} />
                  </button>
                )}
                <button className="search-action">Hľadať</button>
              </div>
              <button
                className={`hero-filter-button ${filtersOpen ? "active" : ""}`}
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
              >
                <Icon name="filter" size={19} />
                Filtre
                {(deliveryOnly || price !== "Všetky ceny" || rating !== "Akékoľvek hodnotenie" || allergen !== "Všetky alergény" || restaurantFilter !== "all") && (
                  <span className="filter-count">
                    {[
                      deliveryOnly,
                      price !== "Všetky ceny",
                      rating !== "Akékoľvek hodnotenie",
                      allergen !== "Všetky alergény",
                      restaurantFilter !== "all",
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {filtersOpen && <section className="filters-wrap open" aria-label="Filtre">
          <div className="filters-heading">
            <div>
              <strong>Filtrovať ponuku</strong>
              <span>Prispôsobte si výsledky podľa vašich preferencií</span>
            </div>
            <button onClick={() => setFiltersOpen(false)} aria-label="Zavrieť filtre"><Icon name="close" size={18} /></button>
          </div>
          <div className="primary-filters">
            <SelectField icon="calendar" label="Deň" value={day} onChange={setDay}>
              <option>Dnes, streda 14. 5.</option>
              <option>Zajtra, štvrtok 15. 5.</option>
              <option>Piatok 16. 5.</option>
            </SelectField>
            <SelectField icon="location" label="Lokalita" value={location} onChange={setLocation}>
              <option>Bratislava – Ružinov</option>
              <option>Bratislava – Staré Mesto</option>
              <option>Bratislava – Nové Mesto</option>
              <option>Košice – Centrum</option>
            </SelectField>
            <SelectField label="Reštaurácia" value={restaurantFilter} onChange={setRestaurantFilter}>
              <option value="all">Všetky reštaurácie</option>
              {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
            </SelectField>
          </div>
          <div className="advanced-filters">
            <SelectField label="Cena" value={price} onChange={setPrice}>
              <option>Všetky ceny</option><option>Do 9 €</option><option>Do 11 €</option>
            </SelectField>
            <SelectField label="Hodnotenie" value={rating} onChange={setRating}>
              <option>Akékoľvek hodnotenie</option><option>4,5 a viac</option><option>4,8 a viac</option>
            </SelectField>
            <label className="check-field">
              <input type="checkbox" checked={deliveryOnly} onChange={(event) => setDeliveryOnly(event.target.checked)} />
              <span className="custom-check">{deliveryOnly && <Icon name="check" size={14} />}</span>
              <Icon name="truck" size={19} /> Len s donáškou
            </label>
            <SelectField label="Alergény" value={allergen} onChange={setAllergen}>
              <option>Všetky alergény</option>
              <option>Bez alergénu 1 – lepok</option>
              <option>Bez alergénu 3 – vajcia</option>
              <option>Bez alergénu 7 – mlieko</option>
              <option>Bez alergénu 8 – orechy</option>
            </SelectField>
            <button className="reset-button" onClick={resetFilters}>Zrušiť filtre</button>
          </div>
        </section>}

        <section className={`content-wrap ${mapExpanded ? "map-open" : ""}`}>
          <div className="results-column">
            <div className="results-header">
              <div>
                <p className="section-kicker">{location}</p>
                <h2>Menu vo vašom okolí</h2>
                <p>{filteredRestaurants.length} {filteredRestaurants.length === 1 ? "reštaurácia" : "reštaurácie"} s dnešným menu</p>
              </div>
              <SelectField label="Zoradiť výsledky" value={sort} onChange={setSort}>
                <option value="rating">Najlepšie hodnotené</option>
                <option value="price">Najnižšia cena</option>
                <option value="distance">Najbližšie</option>
              </SelectField>
            </div>

            {restaurantFilter !== "all" && (
              <div className="active-filter">
                <span>Reštaurácia: <strong>{restaurants.find((item) => item.id === restaurantFilter)?.name}</strong></span>
                <button onClick={() => setRestaurantFilter("all")}><Icon name="close" size={16} /> Zrušiť</button>
              </div>
            )}

            <div className="restaurant-list">
              {filteredRestaurants.map((restaurant, index) => (
                <article className="restaurant-card" key={restaurant.id}>
                  <div className="restaurant-top">
                    <img src={restaurant.image} alt={`Jedlo z reštaurácie ${restaurant.name}`} />
                    <div className="restaurant-info">
                      <div className="restaurant-title-row">
                        <div>
                          <span className="open-label">Dnes otvorené</span>
                          <h3>{restaurant.name}</h3>
                          <p className="restaurant-type">{restaurant.type}</p>
                        </div>
                        <button
                          className={`favorite ${favorites.includes(restaurant.id) ? "selected" : ""}`}
                          onClick={() => toggleFavorite(restaurant.id)}
                          aria-label={favorites.includes(restaurant.id) ? "Odstrániť z obľúbených" : "Pridať do obľúbených"}
                        >
                          <Icon name="heart" size={20} filled={favorites.includes(restaurant.id)} />
                        </button>
                      </div>
                      <div className="restaurant-meta">
                        <span className="rating"><Icon name="star" size={16} filled /> <strong>{restaurant.rating.toFixed(1)}</strong> <em>({36 + index * 21})</em></span>
                        <span><Icon name="location" size={15} /> {restaurant.distance.toFixed(1).replace(".", ",")} km</span>
                        {restaurant.delivery && <span><Icon name="truck" size={17} /> Donáška</span>}
                      </div>
                      <p className="detail-line"><Icon name="location" size={15} /> {restaurant.address}</p>
                      <p className="detail-line"><Icon name="phone" size={15} /> {restaurant.phone} <i /> {restaurant.time}</p>
                    </div>
                  </div>
                  <div className="menu-heading">
                    <span>Dnešné menu</span>
                    <span className="menu-date">Streda 14. mája</span>
                  </div>
                  <div className="menu-list">
                    {visibleMenu(restaurant.menu).map((item) => (
                      <div className="menu-item" key={item.name}>
                        <span className={`menu-tag ${item.tag === "Vege" || item.tag === "Fit" ? "green" : ""}`}>{item.tag}</span>
                        <div className="meal-copy">
                          <h4>{item.name}</h4>
                          <p>{item.weight} <i /> Alergény: {item.allergens}</p>
                        </div>
                        <strong className="price">{item.price.toFixed(2).replace(".", ",")} €</strong>
                      </div>
                    ))}
                  </div>
                  <button className="card-action">Zobraziť detail reštaurácie <Icon name="arrow" size={17} /></button>
                </article>
              ))}
              {filteredRestaurants.length === 0 && (
                <div className="empty-state">
                  <span><Icon name="search" size={26} /></span>
                  <h3>Nenašli sme vhodné menu</h3>
                  <p>Skúste upraviť vyhľadávanie alebo zrušiť niektoré filtre.</p>
                  <button onClick={resetFilters}>Zobraziť všetky menu</button>
                </div>
              )}
            </div>
          </div>

          <aside className={`map-card ${mapExpanded ? "expanded" : ""}`}>
            <div className="map-header">
              <div><span>Mapa reštaurácií</span><small>{restaurants.length} miest v okolí</small></div>
              {mapExpanded && <button onClick={() => setMapExpanded(false)} aria-label="Zavrieť mapu"><Icon name="close" size={18} /></button>}
            </div>
            <div className={`map-canvas ${mapExpanded ? "is-open" : ""}`}>
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />
              <div className="river" />
              <span className="map-label label-one">Ružinov</span>
              <span className="map-label label-two">Nivy</span>
              <span className="map-label label-three">Staré Mesto</span>
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  className={`map-pin ${restaurantFilter === restaurant.id ? "selected" : ""}`}
                  style={{ left: restaurant.position[0], top: restaurant.position[1] }}
                  onClick={() => selectRestaurant(restaurant.id)}
                  aria-label={`Vybrať ${restaurant.name}`}
                >
                  <span>{restaurant.rating}</span>
                </button>
              ))}
              {!mapExpanded && (
                <button className="map-overlay" onClick={() => setMapExpanded(true)}>
                  <span><Icon name="map" size={22} /></span>
                  <strong>Otvoriť mapu</strong>
                  <small>Pozrite si reštaurácie vo svojom okolí</small>
                </button>
              )}
            </div>
            {mapExpanded && <p className="map-tip">Kliknutím na marker vyfiltrujete vybranú reštauráciu.</p>}
          </aside>
        </section>
      </main>

      <footer>
        <button className="brand footer-brand" onClick={resetFilters}><span className="brand-mark"><span /></span><span>obedovo</span></button>
        <p>Každý deň dobrá voľba.</p>
        <span>© 2025 Obedovo</span>
      </footer>
    </div>
  );
}
