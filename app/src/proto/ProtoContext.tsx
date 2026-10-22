import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { api, ApiError } from "@/api/client";

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [email, setEmail] = useState("zuzana@example.sk");
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

  // Identity + favourites come from the API (dev auth stub on the server).
  useEffect(() => {
    let cancelled = false;
    api.me()
      .then(({ data }) => {
        if (!cancelled) setEmail(data.email);
      })
      .catch(() => {
        /* offline prototype: keep the demo address */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setFavorites([]);
      return;
    }
    let cancelled = false;
    api.favorites
      .list()
      .then(({ data }) => {
        if (!cancelled) setFavorites(data);
      })
      .catch((error) => {
        console.warn("[menufy] obľúbené z API sa nepodarilo načítať:", error);
        if (!cancelled) setFavorites(["bistro-mlyn"]);
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const toggleFavorite = (slug: string) => {
    const active = favorites.includes(slug);
    setFavorites((list) => (active ? list.filter((x) => x !== slug) : [...list, slug]));

    const request = active ? api.favorites.remove(slug) : api.favorites.add(slug);
    request.catch((error: unknown) => {
      const message = error instanceof ApiError ? error.message : String(error);
      console.warn(`[menufy] obľúbené sa nepodarilo uložiť: ${message}`);
      // Revert the optimistic update.
      setFavorites((list) => (active ? [...list, slug] : list.filter((x) => x !== slug)));
    });
  };

  const value: Proto = {
    loggedIn,
    setLoggedIn,
    theme,
    setTheme,
    dark: theme === "dark" || (theme === "system" && systemDark),
    geo,
    setGeo,
    favorites,
    toggleFavorite,
    email,
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
