import { Component, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import Icon from "./Icon";
import AreaPicker from "./AreaPicker";
import DragRail from "./DragRail";
import Portal from "./Portal";
import SearchBox from "./SearchBox";
import { useProto } from "@/proto/ProtoContext";
import { useUi } from "@/proto/UiContext";
import { isNative } from "@/native";

const links = [
  { to: "/", label: "Domov", icon: "home", auth: false, end: true },
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

function TopBar() {
  const { loggedIn, email } = useProto();
  const { panel, togglePanel, setPanel, activeFilters, query, setQuery } = useUi();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const isHome = loc.pathname === "/";

  // The open window lives in the URL, so a route change already closes it.
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  // Escape closes the search window (filters and map handle their own).
  useEffect(() => {
    if (panel !== "search") return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [panel, setPanel]);

  const submitSearch = () => {
    setPanel(null);
    setTimeout(
      () => document.querySelector(".results-column")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-inner">
          <Brand />
          {isHome && <AreaPicker />}
          <nav className="top-nav" aria-label="Hlavná navigácia">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="top-link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="top-actions">
            {isHome && (
              <DragRail className="top-chrome" label="Hľadať, filtre a mapa" role="toolbar">
                <button
                  data-rail-item=""
                  className={`chrome-btn${panel === "map" ? " active" : ""}`}
                  onClick={() => togglePanel("map")}
                  aria-label="Mapa"
                  aria-pressed={panel === "map"}
                  aria-expanded={panel === "map"}
                >
                  <Icon name="map" size={20} />
                </button>
                <button
                  data-rail-item=""
                  className={`chrome-btn${panel === "filters" ? " active" : ""}`}
                  onClick={() => togglePanel("filters")}
                  aria-label="Filtre"
                  aria-pressed={panel === "filters"}
                  aria-expanded={panel === "filters"}
                >
                  <Icon name="filter" size={20} />
                  {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
                </button>
                <button
                  data-rail-item=""
                  className={`chrome-btn${panel === "search" ? " active" : ""}`}
                  onClick={() => togglePanel("search")}
                  aria-label="Hľadať"
                  aria-pressed={panel === "search"}
                  aria-expanded={panel === "search"}
                >
                  <Icon name="search" size={20} />
                </button>
              </DragRail>
            )}
            {loggedIn ? (
              <Link to="/settings" className="top-avatar" aria-label="Môj účet">
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

        {open && (
          <Portal>
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
          </Portal>
        )}
      </header>

      {isHome && panel === "search" && (
        <Portal>
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
        </Portal>
      )}
    </>
  );
}

function BottomNav() {
  return (
    <DragRail className="bottom-nav" label="Hlavná navigácia" role="navigation">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className="bottom-tab" data-rail-item="">
          <Icon name={l.icon} size={22} />
          <span>{l.to === "/owners" ? "Môj podnik" : l.label}</span>
        </NavLink>
      ))}
    </DragRail>
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

/** Locks the page behind an open chrome window (search / filters / map). */
function ScrollLock() {
  const { panel } = useUi();
  const open = panel !== null;
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    // Only the root element is locked so the sticky bar keeps working.
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);
  return null;
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);
  return (
    <div className="app-shell">
      <ScrollLock />
      <TopBar />
      <main>
        <RouteBoundary key={loc.pathname}>
          <Outlet />
        </RouteBoundary>
      </main>
      {isNative ? <BottomNav /> : <Footer />}
    </div>
  );
}
