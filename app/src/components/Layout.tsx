import { Component, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import Icon from "./Icon";
import { useProto } from "@/proto/ProtoContext";
import { isNative } from "@/native";

const links = [
  { to: "/", label: "Domov", icon: "search", auth: false, end: true },
  { to: "/saved", label: "Uložené", icon: "heart", auth: true, end: false },
  { to: "/notifications", label: "Upozornenia", icon: "bell", auth: true, end: false },
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
  const { loggedIn } = useProto();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

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
                <span className="drawer-user">zuzana@example.sk</span>
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
      {isNative ? <BottomNav /> : <Footer />}
    </div>
  );
}
