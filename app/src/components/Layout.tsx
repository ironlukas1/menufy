import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import Icon from "./Icon";
import { useProto } from "@/proto/ProtoContext";
import { isNative } from "@/native";

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

function TopBar() {
  const { loggedIn, email } = useProto();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const measured = useRef(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false, ready: false });

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let cancelled = false;
    const update = () => {
      const active = nav.querySelector<HTMLElement>(".top-link.active");
      const ready = measured.current;
      measured.current = true;
      if (cancelled) return;
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth, visible: true, ready });
      else setIndicator((current) => ({ ...current, visible: false, ready }));
    };
    update();
    document.fonts?.ready.then(update);
    window.addEventListener("resize", update);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", update);
    };
  }, [loc.pathname, loc.search]);

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <Brand />
        <nav className="top-nav" aria-label="Hlavná navigácia" ref={navRef}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="top-link">
              {l.label}
            </NavLink>
          ))}
          <span
            className={`top-nav-indicator ${indicator.visible ? "visible" : ""} ${indicator.ready ? "ready" : ""}`}
            style={{ left: indicator.left, width: indicator.width }}
            aria-hidden="true"
          />
        </nav>
        <div className="top-actions">
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

const errorId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID().slice(0, 8);
  } catch {
    /* fall through to a random identifier */
  }
  return Math.random().toString(36).slice(2, 10);
};

class RouteBoundary extends Component<{ children: ReactNode }, { error: Error | null; id: string }> {
  state = { error: null as Error | null, id: "" };
  static getDerivedStateFromError(error: Error) {
    return { error, id: errorId() };
  }
  componentDidCatch(e: unknown) {
    // Details are for the console only; users get a generic message and an ID.
    console.error(`[menufy] Chyba stránky (${this.state.id})`, e);
  }
  render() {
    const { error, id } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ padding: 32 }}>
        <p>Niečo sa pokazilo. Skúste stránku obnoviť.</p>
        <p className="muted">Kód chyby: {id}</p>
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
      {isNative ? <BottomNav /> : <Footer />}
    </div>
  );
}
