import { Component, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import Icon from "./Icon";
import ProtoPanel from "./ProtoPanel";
import { useProto } from "@/proto/ProtoContext";

const links = [
  { to: "/", label: "Domov", icon: "search", auth: false, end: true },
  { to: "/saved", label: "Uložené", icon: "heart", auth: true, end: false },
  { to: "/notifications", label: "Upozornenia", icon: "bell", auth: true, end: false },
  { to: "/settings", label: "Nastavenia", icon: "settings", auth: false, end: false },
] as const;

function Brand() {
  return (
    <Link to="/" className="top-brand" aria-label="menufy – domov">
      <span className="top-brand-mark" />
      <span>menufy</span>
    </Link>
  );
}

function TopBar() {
  const { loggedIn } = useProto();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

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

export function Footer() {
  return (
    <footer>
      <Link to="/" className="top-brand footer-brand">
        <span className="top-brand-mark" />
        <span>menufy</span>
      </Link>
      <p>Každý deň dobrá voľba.</p>
      <span>© 2026 menufy</span>
    </footer>
  );
}

class RouteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.error(e);
    try {
      if (sessionStorage.getItem("menufy-reloaded") === location.pathname) return;
      sessionStorage.setItem("menufy-reloaded", location.pathname);
    } catch {
      return;
    }
    location.reload();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [loc.pathname]);
  return (
    <div className="app-shell">
      <TopBar />
      <main>
        <RouteBoundary key={loc.pathname}>
          <Outlet />
        </RouteBoundary>
      </main>
      <Footer />
      <ProtoPanel />
    </div>
  );
}
