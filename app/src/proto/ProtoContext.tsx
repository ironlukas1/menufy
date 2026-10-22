import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { supabase } from "@/supabase";

export type Theme = "system" | "light" | "dark";

type Proto = {
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  dark: boolean;
  geo: "unknown" | "requesting" | "granted" | "denied";
  setGeo: (g: "granted" | "denied") => void;
  userPosition: { lat: number; lng: number } | null;
  locationError: string | null;
  requestLocation: () => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  email: string;
  userId: string | null;
  notify: Notify;
  setNotify: (patch: Partial<Notify>) => void;
};

export type Notify = { daily: boolean; fav: boolean; promo: boolean };

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
  const [loggedIn, setLoggedInState] = useState(read("menufy-auth") === "1");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [notify, setNotifyState] = useState<Notify>({ daily: true, fav: true, promo: false });
  const setLoggedIn = (v: boolean) => {
    setLoggedInState(v);
    if (!v) void supabase.auth.signOut();
  };

  useEffect(() => {
    const apply = (s: { user: { id: string; email?: string } } | null) => {
      setLoggedInState(!!s);
      setUserId(s?.user.id ?? null);
      setEmail(s?.user.email ?? "");
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => apply(s));
    return () => data.subscription.unsubscribe();
  }, []);
  const stored = read("menufy-theme");
  const [theme, setThemeState] = useState<Theme>(stored === "light" || stored === "dark" ? stored : "system");
  const savePrefs = (patch: Record<string, unknown>) => {
    if (userId) void supabase.from("preferences").upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
    savePrefs({ theme: t });
  };
  const setNotify = (patch: Partial<Notify>) => {
    setNotifyState((n) => ({ ...n, ...patch }));
    savePrefs(Object.fromEntries(Object.entries(patch).map(([k, v]) => [`notify_${k}`, v])));
  };
  const [geo, setGeo] = useState<Proto["geo"]>("unknown");
  const [userPosition, setUserPosition] = useState<Proto["userPosition"]>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locating = useRef(false);

  const requestLocation = () => {
    if (locating.current) return;
    if (!navigator.geolocation) {
      setGeo("denied");
      setLocationError("Tento prehliadač nepodporuje zisťovanie polohy.");
      return;
    }
    locating.current = true;
    setLocationError(null);
    setGeo("requesting");
    const onSuccess = ({ coords }: GeolocationPosition) => {
        locating.current = false;
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });
        setGeo("granted");
      };
    const onError = (error: GeolocationPositionError) => {
        locating.current = false;
        setGeo(userPosition ? "granted" : "denied");
        setLocationError(error.code === 1
          ? "Povoľte prístup k polohe v nastaveniach prehliadača a skúste znova."
          : error.code === 3
            ? "Zisťovanie polohy trvalo príliš dlho. Skontrolujte lokalizačné služby zariadenia a skúste znova."
            : "Zariadenie neposkytlo polohu. Zapnite lokalizačné služby a povoľte ich pre tento prehliadač alebo aplikáciu.");
      };
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (error) => {
        if (error.code === 1) return onError(error);
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
          enableHighAccuracy: true, timeout: 15000, maximumAge: 300000,
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return setFavorites([]);
    let live = true;
    Promise.all([
      supabase.from("favorites").select("restaurants(slug)").order("created_at"),
      supabase.from("preferences").select("*").maybeSingle(),
    ]).then(([f, p]) => {
      if (!live) return;
      // many-to-one embed returns an object; the untyped client types it as an array
      if (f.data) setFavorites(f.data.map((r) => (r.restaurants as unknown as { slug: string }).slug));
      if (p.data) {
        setThemeState(p.data.theme);
        setNotifyState({ daily: p.data.notify_daily, fav: p.data.notify_fav, promo: p.data.notify_promo });
      }
    });
    return () => {
      live = false;
    };
  }, [userId]);

  const toggleFavorite = (slug: string) => {
    const adding = !favorites.includes(slug);
    setFavorites((f) => (adding ? [...f, slug] : f.filter((x) => x !== slug)));
    if (!userId) return;
    void (async () => {
      const r = await supabase.from("restaurants").select("id").eq("slug", slug).single();
      const { error } = r.error
        ? r
        : adding
          ? await supabase.from("favorites").insert({ user_id: userId, restaurant_id: r.data.id })
          : await supabase.from("favorites").delete().eq("restaurant_id", r.data.id);
      if (error) setFavorites((f) => (adding ? f.filter((x) => x !== slug) : [...f, slug]));
    })();
  };
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

  useEffect(() => {
    write("menufy-auth", loggedIn ? "1" : "0");
  }, [loggedIn]);

  const value: Proto = {
    loggedIn,
    setLoggedIn,
    theme,
    setTheme,
    dark: theme === "dark" || (theme === "system" && systemDark),
    geo,
    setGeo,
    userPosition,
    locationError,
    requestLocation,
    favorites,
    toggleFavorite,
    notify,
    setNotify,
    email,
    userId,
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
