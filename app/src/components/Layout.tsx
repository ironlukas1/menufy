import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import Icon from "./Icon";
import { useProto } from "@/proto/ProtoContext";
import { useRestaurants } from "@/proto/RestaurantContext";
import { useUi } from "@/proto/UiContext";
import { hasNativeGlass, hasNativeTabBar, isNative } from "@/native";

const links = [
  { to: "/", label: "Domov", icon: "search", auth: false, end: true },
  { to: "/saved", label: "Uložené", icon: "heart", auth: true, end: false },
  { to: "/notifications", label: "Upozornenia", icon: "bell", auth: true, end: false },
  { to: "/owners", label: "Vlastníš reštauráciu?", icon: "store", auth: false, end: false },
  { to: "/settings", label: "Nastavenia", icon: "settings", auth: false, end: false },
] as const;

function Brand() {
  const loc = useLocation();
  const toTop = () => {
    if (loc.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Link to="/" className="top-brand" aria-label="menufy – domov" onClick={toTop}>
      <span className="top-brand-mark" />
      <span>menufy</span>
    </Link>
  );
}

function SearchOverlay() {
  const { searchOpen, setSearchOpen, query, setQuery } = useUi();
  const { restaurants } = useRestaurants();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    if (!searchOpen) return;
    setDraft(query);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [searchOpen]);

  if (!searchOpen) return null;

  const q = draft.trim().toLocaleLowerCase("sk");
  const places = q ? restaurants.filter((r) => r.name.toLocaleLowerCase("sk").includes(q)).slice(0, 4) : [];
  const seen = new Map<string, { name: string; place: string }>();
  if (q) {
    restaurants.forEach((r) =>
      [...r.daily.flat(), ...r.standard].forEach((it) => {
        if (it.name.toLocaleLowerCase("sk").includes(q) && !seen.has(it.name)) {
          seen.set(it.name, { name: it.name, place: r.name });
        }
      }),
    );
  }
  const dishes = [...seen.values()].slice(0, 5);

  const close = () => setSearchOpen(false);

  const submit = (value: string) => {
    setQuery(value);
    close();
    nav("/");
  };

  return (
    <>
      <div className="search-backdrop" onClick={close} />
      <div className="top-search" role="search">
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
            submit(draft.trim());
          }}
        >
          <Icon name="search" size={22} />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
            placeholder="Hľadať jedlo (napr. sviečková) alebo reštauráciu…"
            aria-label="Hľadať jedlo alebo reštauráciu"
            role="combobox"
            aria-expanded={!!q && (places.length > 0 || dishes.length > 0)}
          />
          {draft && (
            <button type="button" className="clear-search" onClick={() => { setDraft(""); setQuery(""); }} aria-label="Vymazať vyhľadávanie">
              <Icon name="close" size={17} />
            </button>
          )}
          <button type="submit" className="search-action">Hľadať</button>
        </form>

        {q && (places.length > 0 || dishes.length > 0) && (
          <div className="search-menu" role="listbox">
            {places.length > 0 && (
              <>
                <span className="search-group">Reštaurácie</span>
                {places.map((r) => (
                  <button key={r.slug} onClick={() => { close(); nav(`/restaurant/${r.slug}`); }} role="option">
                    <span className="mini-logo">{r.initials}</span>
                    <span>
                      {r.name}
                      <small>{r.address}</small>
                    </span>
                  </button>
                ))}
              </>
            )}
            {dishes.length > 0 && (
              <>
                <span className="search-group">Jedlá</span>
                {dishes.map((d) => (
                  <button key={d.name} onClick={() => submit(d.name)} role="option">
                    <span className="mini-logo dish">
                      <Icon name="search" size={14} />
                    </span>
                    <span>
                      {d.name}
                      <small>napr. {d.place}</small>
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TopBar() {
  const { loggedIn, email, dark } = useProto();
  const { searchOpen, setSearchOpen, filtersOpen, setFiltersOpen, activeFilters, mapOpen, setMapOpen } = useUi();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const isBrowse = loc.pathname === "/";
  const mapBtnRef = useRef<HTMLButtonElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [loc.pathname]);

  // Search, filters and map are mutually exclusive: opening one closes the
  // other two, so the top bar never shows two panels at once.
  const toggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    if (next) {
      setFiltersOpen(false);
      setMapOpen(false);
    }
  };

  const toggleFilters = () => {
    const next = !filtersOpen;
    if (!isBrowse) nav("/");
    setFiltersOpen(next);
    if (next) {
      setMapOpen(false);
      setSearchOpen(false);
    }
  };

  const toggleMap = () => {
    const next = !mapOpen;
    if (!isBrowse) nav("/");
    setMapOpen(next);
    if (next) {
      setFiltersOpen(false);
      setSearchOpen(false);
    }
  };

  // The Expo shell draws the three top-bar buttons with UIKit's real Liquid
  // Glass material (expo-glass-effect) and drives them through this bridge.
  const chromeHandlers = useRef({ toggleSearch, toggleFilters, toggleMap });
  chromeHandlers.current = { toggleSearch, toggleFilters, toggleMap };

  useEffect(() => {
    const w = window as Window & { __menufyChrome?: Record<string, () => void> };
    w.__menufyChrome = {
      toggleSearch: () => chromeHandlers.current.toggleSearch(),
      toggleFilters: () => chromeHandlers.current.toggleFilters(),
      toggleMap: () => chromeHandlers.current.toggleMap(),
      closeAll: () => {
        setSearchOpen(false);
        setFiltersOpen(false);
        setMapOpen(false);
      },
    };
    return () => {
      delete w.__menufyChrome;
    };
  }, [setSearchOpen, setFiltersOpen, setMapOpen]);

  // Publish the DOM button geometry and panel state so the native glass
  // buttons can sit exactly where the (now hidden) web buttons are.
  useEffect(() => {
    if (!hasNativeGlass) return;
    let frame = 0;
    const rect = (el: HTMLButtonElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    const send = () => {
      frame = 0;
      const bridge = (window as Window & { ReactNativeWebView?: { postMessage: (m: string) => void } }).ReactNativeWebView;
      if (!bridge) return;
      bridge.postMessage(
        JSON.stringify({
          type: "menufy:chrome",
          rects: {
            map: rect(mapBtnRef.current),
            filter: rect(filterBtnRef.current),
            search: rect(searchBtnRef.current),
          },
          open: { map: mapOpen, filters: filtersOpen, search: searchOpen },
          count: activeFilters,
          dark,
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(send);
    };
    schedule();
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(document.querySelector(".top-bar") ?? document.documentElement);
    observer?.observe(document.querySelector(".top-actions") ?? document.documentElement);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, [mapOpen, filtersOpen, searchOpen, activeFilters, dark, isBrowse, loggedIn]);

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <Brand />
        <nav className="top-nav" aria-label="Hlavná navigácia">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="top-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          {isBrowse && (
            <>
              <button
                ref={mapBtnRef}
                className={`top-icon-btn ${mapOpen ? "active" : ""}`}
                onClick={toggleMap}
                aria-label={mapOpen ? "Zavrieť mapu" : "Otvoriť mapu"}
                aria-expanded={mapOpen}
              >
                <Icon name={mapOpen ? "close" : "map"} size={22} />
              </button>
              <button
                ref={filterBtnRef}
                className={`top-icon-btn ${filtersOpen ? "active" : ""}`}
                onClick={toggleFilters}
                aria-label={filtersOpen ? "Zavrieť filtre" : "Filtre"}
                aria-expanded={filtersOpen}
              >
                <Icon name="filter" size={22} />
                {activeFilters > 0 && <span className="top-action-count">{activeFilters}</span>}
              </button>
            </>
          )}
          <button
            ref={searchBtnRef}
            className={`top-icon-btn ${searchOpen ? "active" : ""}`}
            onClick={toggleSearch}
            aria-label={searchOpen ? "Zavrieť hľadanie" : "Hľadať"}
            aria-expanded={searchOpen}
          >
            <Icon name="search" size={22} />
          </button>
          {loggedIn ? (
            <Link to="/account" className="top-avatar" aria-label="Môj účet">
              <Icon name="user" size={18} />
            </Link>
          ) : (
            <Link to="/login" className="top-signin">
              <Icon name="user" size={17} /> Prihlásiť sa
            </Link>
          )}
          <button
            className="top-burger"
            onClick={() => setOpen(true)}
            aria-label="Otvoriť menu"
            aria-expanded={open}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <SearchOverlay />

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Menu">
            <div className="drawer-head">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Zavrieť menu">
                <Icon name="close" size={20} />
              </button>
            </div>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="drawer-link">
                <Icon name={l.icon} size={19} /> {l.label}
              </NavLink>
            ))}
            <div className="drawer-foot">
              {loggedIn ? (
                <span className="drawer-user">{email}</span>
              ) : (
                <Link to="/login" className="btn-primary">
                  Prihlásiť sa
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hlavná navigácia">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className="bottom-tab">
          <Icon name={l.icon} size={22} />
          <span>{l.to === "/owners" ? "Môj podnik" : l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <Link to="/" className="top-brand footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <span className="top-brand-mark" />
        <span>menufy</span>
      </Link>
      <p>Každý deň dobrá voľba.</p>
      <div className="footer-links" role="navigation" aria-label="Právne informácie">
        <Link to="/owners">Vlastníš reštauráciu?</Link>
        <Link to="/terms">Podmienky používania</Link>
        <Link to="/privacy">Ochrana osobných údajov</Link>
      </div>
      <span>© 2026 menufy</span>
    </footer>
  );
}

class RouteBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(e: unknown) {
    console.error(e);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ padding: 32 }}>
        <p>Niečo sa pokazilo.</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{error.stack || error.message}</pre>
        <button onClick={() => location.reload()}>Obnoviť stránku</button>
      </div>
    );
  }
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);
  return (
    <div className="app-shell">
      <TopBar />
      <main>
        <RouteBoundary key={loc.pathname}>
          <Outlet />
        </RouteBoundary>
      </main>
      {isNative ? hasNativeTabBar ? null : <BottomNav /> : <Footer />}
    </div>
  );
}
