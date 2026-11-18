import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import Icon from "./Icon";
import SearchBox from "./SearchBox";
import { chromeHearts, chromeRects, installChromeBridge, postChrome } from "./chromeBridge";
import { isNative, nativeGlass } from "@/native";
import { useProto } from "@/proto/ProtoContext";
import { useUi } from "@/proto/UiContext";

const links = [
  { to: "/", label: "Domov", icon: "search", end: true },
  { to: "/saved", label: "Uložené", icon: "heart", end: false },
  { to: "/notifications", label: "Upozornenia", icon: "bell", end: false },
  { to: "/owners", label: "Vlastníš reštauráciu?", icon: "store", end: false },
  { to: "/account", label: "Účet", icon: "user", end: false },
] as const;

/** Bottom task-bar tabs: settings live inside the account page. */
const tabs = [
  { to: "/", label: "Domov", icon: "search", end: true },
  { to: "/saved", label: "Uložené", icon: "heart", end: false },
  { to: "/notifications", label: "Upozornenia", icon: "bell", end: false },
  { to: "/account", label: "Účet", icon: "user", end: false },
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

function TopBar() {
  const { loggedIn, email, dark, refreshProfile } = useProto();
  const { panel, togglePanel, setPanel, activeFilters, query, setQuery } = useUi();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const isHome = loc.pathname === "/";

  useEffect(() => {
    setOpen(false);
    setPanel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  // Native shell bridge: the glass buttons in the shell toggle these panels.
  // Wrappers go through a ref so the installed bridge never goes stale when
  // the top bar re-renders (or hot-reloads).
  const togglesRef = useRef({
    search: () => {},
    filters: () => {},
    map: () => {},
    heartTap: (_slug: string) => {},
    poke: () => {},
  });
  togglesRef.current = {
    search: () => togglePanel("search"),
    filters: () => togglePanel("filters"),
    map: () => togglePanel("map"),
    // Replays the tap on the (hidden) web heart so all of its logic — login
    // redirect, favorite toggle, animation — stays in exactly one place.
    heartTap: (slug: string) => {
      const el = Array.from(document.querySelectorAll<HTMLElement>("[data-heart]")).find(
        (n) => n.dataset.heart === slug,
      );
      el?.click();
    },
    poke: () => {
      report();
      // A tab regains focus: re-read favorites/preferences from the database,
      // because every shell tab is a separate WebView with its own state copy
      // and the change may have been made in another tab.
      void refreshProfile();
    },
  };

  useEffect(
    () =>
      installChromeBridge({
        search: () => togglesRef.current.search(),
        filters: () => togglesRef.current.filters(),
        map: () => togglesRef.current.map(),
        heartTap: (slug) => togglesRef.current.heartTap(slug),
        poke: () => togglesRef.current.poke(),
      }),
    [],
  );

  const report = useCallback(() => {
    postChrome({
      rects: chromeRects(),
      open: { map: panel === "map", filters: panel === "filters", search: panel === "search" },
      count: activeFilters,
      dark,
      scrollY: window.scrollY,
      hearts: chromeHearts(),
    });
  }, [panel, activeFilters, dark]);

  // Report after every render (rects depend on the open state and badge).
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(report);
    return () => cancelAnimationFrame(raf);
  });

  useEffect(() => {
    window.addEventListener("resize", report);
    const bar = document.querySelector(".top-bar");
    const ro = new ResizeObserver(report);
    if (bar) ro.observe(bar);
    // Card lists change without the top bar re-rendering (day/price filters,
    // favorites toggling classes) — watch the DOM so the shell always has
    // fresh heart rects. rAF-debounced to coalesce bursts.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(report);
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener("resize", report);
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [report]);

  const submitSearch = () => {
    setPanel(null);
    document.querySelector(".results-column")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Escape closes the search window (filters/map handle their own).
  useEffect(() => {
    if (panel !== "search") return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [panel, setPanel]);

  return (
    <>
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
          {isHome && (
            <div className={`top-chrome${nativeGlass ? " glass-native" : ""}`}>
              <button
                data-chrome="map"
                className={`chrome-btn glass${panel === "map" ? " active" : ""}`}
                onClick={() => togglePanel("map")}
                aria-label="Mapa"
                aria-expanded={panel === "map"}
              >
                <Icon name="map" size={20} />
              </button>
              <button
                data-chrome="filters"
                className={`chrome-btn glass${panel === "filters" ? " active" : ""}`}
                onClick={() => togglePanel("filters")}
                aria-label="Filtre"
                aria-expanded={panel === "filters"}
              >
                <Icon name="filter" size={20} />
                {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
              </button>
              <button
                data-chrome="search"
                className={`chrome-btn glass${panel === "search" ? " active" : ""}`}
                onClick={() => togglePanel("search")}
                aria-label="Hľadať"
                aria-expanded={panel === "search"}
              >
                <Icon name="search" size={20} />
              </button>
            </div>
          )}
          {!loggedIn && (
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

      {isHome && panel === "search" && (
        <div className="search-overlay" onClick={() => setPanel(null)}>
          <div
            className="search-overlay-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Hľadať"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchBox
              applied={query}
              onApply={setQuery}
              onSubmit={submitSearch}
              onOpen={(slug) => nav(`/restaurant/${slug}`)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav glass" aria-label="Hlavná navigácia">
      {tabs.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className="bottom-tab">
          <Icon name={l.icon} size={22} />
          <span>{l.label}</span>
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

class RouteBoundary extends Component<{ children: ReactNode; locationKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(e: unknown) {
    console.error(e);
  }
  componentDidUpdate(prev: { locationKey: string }) {
    // A new route gets a clean slate, but the route subtree itself stays
    // mounted so page state (filters, search, pinned restaurant, scroll
    // position) survives navigating into a detail page and back.
    if (prev.locationKey !== this.props.locationKey && this.state.error) this.setState({ error: null });
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
        <RouteBoundary locationKey={loc.pathname}>
          <Outlet />
        </RouteBoundary>
      </main>
      {isNative ? <BottomNav /> : <Footer />}
    </div>
  );
}
