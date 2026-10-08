import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

export type Theme = "system" | "light" | "dark";

type Proto = {
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  dark: boolean;
  geo: "granted" | "denied";
  setGeo: (g: "granted" | "denied") => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  email: string;
};

const Ctx = createContext<Proto | null>(null);

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

export function ProtoProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(read("menufy-auth") === "1");
  const stored = read("menufy-theme");
  const [theme, setTheme] = useState<Theme>(stored === "light" || stored === "dark" ? stored : "system");
  const [geo, setGeo] = useState<"granted" | "denied">("granted");
  const [favorites, setFavorites] = useState<string[]>(["bistro-mlyn"]);
  const [systemDark, setSystemDark] = useState(
    typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSystemDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      delete root.dataset.theme;
      try {
        localStorage.removeItem("menufy-theme");
      } catch {
        /* ignore */
      }
    } else {
      root.dataset.theme = theme;
      write("menufy-theme", theme);
    }
  }, [theme]);

  useEffect(() => write("menufy-auth", loggedIn ? "1" : "0"), [loggedIn]);

  const value: Proto = {
    loggedIn,
    setLoggedIn,
    theme,
    setTheme,
    dark: theme === "dark" || (theme === "system" && systemDark),
    geo,
    setGeo,
    favorites,
    toggleFavorite: (slug) =>
      setFavorites((f) => (f.includes(slug) ? f.filter((x) => x !== slug) : [...f, slug])),
    email: "zuzana@example.sk",
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProto() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProto outside ProtoProvider");
  return v;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loggedIn } = useProto();
  const loc = useLocation();
  if (!loggedIn) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}
