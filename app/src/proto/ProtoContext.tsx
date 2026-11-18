import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
  /** Re-read the session, favorites and preferences from the database. */
  refreshProfile: () => Promise<void>;
  email: string;
  displayName: string;
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
  const [displayName, setDisplayName] = useState("Člen menufy");
  const [userId, setUserId] = useState<string | null>(null);
  const [notify, setNotifyState] = useState<Notify>({ daily: true, fav: true, promo: false });
  const setLoggedIn = (v: boolean) => {
    setLoggedInState(v);
    if (!v) void supabase.auth.signOut();
  };

  const applySession = useCallback(
    (s: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      setLoggedInState(!!s);
      setUserId(s?.user.id ?? null);
      setEmail(s?.user.email ?? "");
      const metadata = s?.user.user_metadata;
      const name = [metadata?.display_name, metadata?.full_name, metadata?.name, metadata?.user_name, metadata?.preferred_username]
        .find((value): value is string => typeof value === "string" && value.trim().length >= 2);
      setDisplayName(name ? Array.from(name.trim()).slice(0, 60).join("") : "Člen menufy");
    },
    [],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => applySession(s));
    return () => data.subscription.unsubscribe();
  }, [applySession]);
  const stored = read("menufy-theme");
  const [theme, setThemeState] = useState<Theme>(stored === "light" || stored === "dark" ? stored : "system");
  // Database writes started by this page (favorite toggles, preference saves).
  // A profile refresh waits for them so it never reads the database mid-write.
  const pendingOps = useRef<PromiseLike<unknown>[]>([]);
  const trackOp = useCallback((op: PromiseLike<unknown>) => {
    pendingOps.current.push(op);
    void Promise.resolve(op).finally(() => {
      pendingOps.current = pendingOps.current.filter((p) => p !== op);
    });
  }, []);
  const savePrefs = (patch: Record<string, unknown>) => {
    if (!userId) return;
    trackOp(
      supabase
        .from("preferences")
        .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() })
        .then(() => undefined),
    );
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

  /** Read favorites from the database, waiting out any write that raced the read. */
  const loadFavorites = useCallback(async () => {
    for (let i = 0; i < 3; i++) {
      if (pendingOps.current.length) await Promise.allSettled(pendingOps.current);
      const { data, error } = await supabase.from("favorites").select("restaurants(slug)").order("created_at");
      // On a failed read keep the current state instead of wiping the list.
      if (error) return;
      const next = data.map((r) => (r.restaurants as unknown as { slug: string }).slug);
      // Keep the old array when nothing changed — a new array identity re-renders every consumer.
      setFavorites((current) =>
        current.length === next.length && current.every((slug, i) => slug === next[i]) ? current : next,
      );
      if (!pendingOps.current.length) return;
    }
  }, []);

  const refreshing = useRef(false);
  /**
   * Reconcile this page with the database: session, favorites, preferences.
   *
   * Every shell tab is its own WebView with its own copy of this state, so a
   * change made in one tab never reaches the others by itself — the shell
   * calls poke() when a tab regains focus, which triggers this. It also runs
   * on window focus so plain browser tabs stay in sync.
   */
  const refreshProfile = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const { data, error } = await supabase.auth.getSession();
      // On a failed session check keep the current state — never log the user
      // out of the UI because one refocus couldn't read the session.
      if (error) return;
      applySession(data.session);
      if (!data.session) return setFavorites([]);
      // A favorite toggled in another tab milliseconds ago may still be on its
      // way to the database — give it a moment so the read below is final.
      await new Promise((resolve) => setTimeout(resolve, 300));
      await loadFavorites();
      const { data: prefs } = await supabase.from("preferences").select("*").maybeSingle();
      if (prefs) {
        setThemeState(prefs.theme);
        setNotifyState({ daily: prefs.notify_daily, fav: prefs.notify_fav, promo: prefs.notify_promo });
      }
    } finally {
      refreshing.current = false;
    }
  }, [applySession, loadFavorites]);

  // Reconcile whenever the page regains focus (browser tab switch, app switch).
  useEffect(() => {
    const onFocus = () => void refreshProfile();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshProfile();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshProfile]);

  const toggleFavorite = (slug: string) => {
    const adding = !favorites.includes(slug);
    setFavorites((f) => (adding ? [...f, slug] : f.filter((x) => x !== slug)));
    if (!userId) return;
    trackOp(
      (async () => {
        const r = await supabase.from("restaurants").select("id").eq("slug", slug).single();
        const { error } = r.error
          ? r
          : adding
            ? await supabase.from("favorites").insert({ user_id: userId, restaurant_id: r.data.id })
            : await supabase.from("favorites").delete().eq("user_id", userId).eq("restaurant_id", r.data.id);
        if (error) setFavorites((f) => (adding ? f.filter((x) => x !== slug) : [...f, slug]));
      })(),
    );
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
    refreshProfile,
    notify,
    setNotify,
    email,
    displayName,
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
