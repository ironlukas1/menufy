import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { AppState, useColorScheme } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { CITY_CENTER, distanceKm, nextAt, openStatus } from '../data/lib';
import {
  dailyFor,
  restaurants as prototypeRestaurants,
  type Restaurant,
} from '../data/restaurants';
import { RESTAURANT_SELECT, toRestaurant } from '../lib/restaurants';
import { supabase, supabaseConfigured } from '../lib/supabase';

export type Theme = 'system' | 'light' | 'dark';
export type Panel = 'search' | 'filters' | 'map' | null;
export type Notify = { daily: boolean; fav: boolean; promo: boolean };
export type Sort = 'rating' | 'price' | 'distance' | 'favorites';

export type Filters = {
  day: number;
  city: string;
  district: string;
  cuisines: string[];
  excluded: string[];
  maxPrice: number;
  delivery: boolean;
  minRating: number;
  openAt: string;
  sort: Sort;
};

export const MAX_PRICE = 15;

const INITIAL_FILTERS: Filters = {
  day: 0,
  city: 'Bratislava',
  district: 'Všetky časti',
  cuisines: [],
  excluded: [],
  maxPrice: MAX_PRICE,
  delivery: false,
  minRating: 0,
  openAt: '',
  sort: 'rating',
};

const DEFAULT_NOTIFY: Notify = { daily: true, fav: true, promo: false };

const AUTH_ERRORS: { match: RegExp; message: string }[] = [
  { match: /already registered|user already exists|email address is already/i, message: 'E-mailová adresa je už zaregistrovaná.' },
  { match: /email not confirmed|not confirmed/i, message: 'E-mail ešte nie je overený. Skontrolujte schránku.' },
  { match: /invalid login credentials|invalid email or password/i, message: 'Zadané heslo nezodpovedá zadanému e-mailu.' },
  { match: /password should be at least|weak password/i, message: 'Heslo musí mať min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.' },
];

function authMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  return AUTH_ERRORS.find((entry) => entry.match.test(raw))?.message ?? raw ?? 'Nepodarilo sa dokončiť prihlásenie.';
}

function nameFromSession(session: Session | null): string {
  const meta = session?.user.user_metadata as Record<string, unknown> | undefined;
  const name = [
    meta?.display_name,
    meta?.full_name,
    meta?.name,
    meta?.user_name,
    meta?.preferred_username,
  ].find((value): value is string => typeof value === 'string' && value.trim().length >= 2);
  return name ? Array.from(name.trim()).slice(0, 60).join('') : 'Člen menufy';
}

type MenufyContextValue = {
  // identity / settings
  loggedIn: boolean;
  email: string;
  displayName: string;
  userId: string | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dark: boolean;
  notify: Notify;
  setNotify: (patch: Partial<Notify>) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, displayName: string, redirectTo?: string) => Promise<string | null>;
  resendVerification: (email: string, redirectTo?: string) => Promise<string | null>;
  resetPassword: (email: string, redirectTo?: string) => Promise<string | null>;
  signOut: () => void;
  updateDisplayName: (name: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  updateEmail: (email: string) => Promise<string | null>;
  deleteAccount: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;

  // catalog / favorites
  restaurants: Restaurant[];
  catalogLoading: boolean;
  refreshRestaurants: () => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;

  // position
  geo: 'unknown' | 'requesting' | 'granted' | 'denied';
  userPosition: { lat: number; lng: number } | null;
  locationError: string | null;
  requestLocation: () => Promise<void>;

  // feed UI
  panel: Panel;
  setPanel: (panel: Panel) => void;
  togglePanel: (panel: Exclude<Panel, null>) => void;
  query: string;
  setQuery: (value: string) => void;
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  activeCount: number;
  resetFilters: () => void;
  pinned: string | null;
  setPinned: (slug: string | null) => void;
  results: { r: Restaurant; distance: number }[];
};

const MenufyContext = createContext<MenufyContextValue | null>(null);

export function MenufyProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();

  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('Člen menufy');
  const [userId, setUserId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<Theme>('system');
  const [notify, setNotifyState] = useState<Notify>(DEFAULT_NOTIFY);

  const [liveRestaurants, setLiveRestaurants] = useState<Restaurant[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [geo, setGeo] = useState<MenufyContextValue['geo']>('unknown');
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [panel, setPanelState] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [filters, setFiltersState] = useState<Filters>(INITIAL_FILTERS);
  const [pinned, setPinned] = useState<string | null>(null);

  const pendingOps = useRef<PromiseLike<unknown>[]>([]);
  const refreshing = useRef(false);
  const locating = useRef(false);
  const appliedPosition = useRef<{ lat: number; lng: number } | null>(null);

  const trackOp = useCallback((op: PromiseLike<unknown>) => {
    pendingOps.current.push(op);
    void Promise.resolve(op).finally(() => {
      pendingOps.current = pendingOps.current.filter((item) => item !== op);
    });
  }, []);

  const applySession = useCallback((session: Session | null) => {
    setLoggedIn(!!session);
    setUserId(session?.user.id ?? null);
    setEmail(session?.user.email ?? '');
    setDisplayName(nameFromSession(session));
  }, []);

  const savePrefs = useCallback(
    (patch: Record<string, unknown>) => {
      if (!userId || !supabaseConfigured) return;
      trackOp(
        supabase
          .from('preferences')
          .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() })
          .then(() => undefined),
      );
    },
    [trackOp, userId],
  );

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      void SecureStore.setItemAsync('menufy-theme', value).catch(() => undefined);
      savePrefs({ theme: value });
    },
    [savePrefs],
  );

  const setNotify = useCallback(
    (patch: Partial<Notify>) => {
      setNotifyState((current) => ({ ...current, ...patch }));
      savePrefs(Object.fromEntries(Object.entries(patch).map(([key, value]) => [`notify_${key}`, value])));
    },
    [savePrefs],
  );

  const loadFavorites = useCallback(async () => {
    if (!supabaseConfigured || !userId) return;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (pendingOps.current.length) await Promise.allSettled(pendingOps.current);
      const { data, error } = await supabase
        .from('favorites')
        .select('restaurants(slug)')
        .order('created_at');
      if (error) return;
      const next = (data ?? []).map(
        (row) => (row.restaurants as unknown as { slug: string }).slug,
      );
      setFavorites((current) =>
        current.length === next.length && current.every((slug, index) => slug === next[index])
          ? current
          : next,
      );
      if (!pendingOps.current.length) return;
    }
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!supabaseConfigured || refreshing.current) return;
    refreshing.current = true;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return;
      applySession(data.session);
      if (!data.session) {
        setFavorites([]);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      await loadFavorites();
      const { data: prefs } = await supabase.from('preferences').select('*').maybeSingle();
      if (prefs) {
        if (prefs.theme === 'system' || prefs.theme === 'light' || prefs.theme === 'dark') {
          setThemeState(prefs.theme as Theme);
          void SecureStore.setItemAsync('menufy-theme', prefs.theme).catch(() => undefined);
        }
        setNotifyState({
          daily: Boolean(prefs.notify_daily),
          fav: Boolean(prefs.notify_fav),
          promo: Boolean(prefs.notify_promo),
        });
      }
    } finally {
      refreshing.current = false;
    }
  }, [applySession, loadFavorites]);

  const requestLocation = useCallback(async () => {
    if (locating.current) return;
    locating.current = true;
    setLocationError(null);
    setGeo('requesting');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setGeo('denied');
        setLocationError('Povoľte prístup k polohe v nastaveniach zariadenia a skúste znova.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
      setGeo('granted');
    } catch {
      setGeo(userPosition ? 'granted' : 'denied');
      setLocationError(
        'Zariadenie neposkytlo polohu. Zapnite lokalizačné služby a skúste znova.',
      );
    } finally {
      locating.current = false;
    }
  }, [userPosition]);

  const toggleFavorite = useCallback(
    (slug: string) => {
      const adding = !favorites.includes(slug);
      setFavorites((current) =>
        adding ? [...current, slug] : current.filter((item) => item !== slug),
      );
      if (!userId || !supabaseConfigured) return;
      trackOp(
        (async () => {
          const restaurant = await supabase.from('restaurants').select('id').eq('slug', slug).single();
          const { error } = restaurant.error
            ? restaurant
            : adding
              ? await supabase
                  .from('favorites')
                  .insert({ user_id: userId, restaurant_id: restaurant.data.id })
              : await supabase
                  .from('favorites')
                  .delete()
                  .eq('user_id', userId)
                  .eq('restaurant_id', restaurant.data.id);
          if (error) {
            setFavorites((current) =>
              adding ? current.filter((item) => item !== slug) : [...current, slug],
            );
          }
        })(),
      );
    },
    [favorites, trackOp, userId],
  );

  const signIn = useCallback(async (mail: string, password: string) => {
    if (!supabaseConfigured) return 'Prihlásenie nie je v tomto builde dostupné.';
    const { error } = await supabase.auth.signInWithPassword({ email: mail.trim(), password });
    if (error) return authMessage(error);
    await refreshProfile();
    return null;
  }, [refreshProfile]);

  const signUp = useCallback(async (mail: string, password: string, name: string, redirectTo?: string) => {
    if (!supabaseConfigured) return 'Registrácia nie je v tomto builde dostupná.';
    if (name.trim().length < 2 || name.trim().length > 60) {
      return 'Používateľské meno musí mať 2 až 60 znakov.';
    }
    const { data, error } = await supabase.auth.signUp({
      email: mail.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    });
    if (error) return authMessage(error);
    if (data.user && data.user.identities?.length === 0) {
      return 'E-mailová adresa je už zaregistrovaná.';
    }
    return null;
  }, []);

  const resendVerification = useCallback(async (mail: string, redirectTo?: string) => {
    if (!supabaseConfigured) return 'Overenie nie je v tomto builde dostupné.';
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: mail.trim(),
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });
    return error ? authMessage(error) : null;
  }, []);

  const resetPassword = useCallback(async (mail: string, redirectTo?: string) => {
    if (!supabaseConfigured) return 'Obnovenie hesla nie je v tomto builde dostupné.';
    const { error } = await supabase.auth.resetPasswordForEmail(mail.trim(), {
      ...(redirectTo ? { redirectTo } : {}),
    });
    return error ? authMessage(error) : null;
  }, []);

  const signOut = useCallback(() => {
    setLoggedIn(false);
    setUserId(null);
    setEmail('');
    setDisplayName('Člen menufy');
    setFavorites([]);
    if (supabaseConfigured) void supabase.auth.signOut();
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!supabaseConfigured) return 'Zmena profilu nie je v tomto builde dostupná.';
      const trimmed = name.trim();
      if (trimmed.length < 2 || trimmed.length > 60) {
        return 'Používateľské meno musí mať 2 až 60 znakov.';
      }
      const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
      if (error) return authMessage(error);
      setDisplayName(trimmed);
      return null;
    },
    [],
  );

  const updatePassword = useCallback(async (password: string) => {
    if (!supabaseConfigured) return 'Zmena hesla nie je v tomto builde dostupná.';
    const { error } = await supabase.auth.updateUser({ password });
    return error ? authMessage(error) : null;
  }, []);

  const updateEmail = useCallback(async (mail: string) => {
    if (!supabaseConfigured) return 'Zmena e-mailu nie je v tomto builde dostupná.';
    const { error } = await supabase.auth.updateUser({ email: mail.trim() });
    if (error) return authMessage(error);
    setEmail(mail.trim());
    return null;
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabaseConfigured) return 'Zmazanie účtu nie je v tomto builde dostupné.';
    const { error } = await supabase.rpc('delete_user');
    if (error) return authMessage(error);
    signOut();
    return null;
  }, [signOut]);

  const refreshRestaurants = useCallback(() => setCatalogRevision((value) => value + 1), []);

  const setPanel = useCallback((value: Panel) => setPanelState(value), []);
  const togglePanel = useCallback((value: Exclude<Panel, null>) => {
    setPanelState((current) => (current === value ? null : value));
  }, []);

  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      setFiltersState((current) => {
        const next = { ...current, ...patch };
        if (!loggedIn && next.sort === 'favorites') next.sort = 'rating';
        return next;
      });
    },
    [loggedIn],
  );

  const resetFilters = useCallback(() => {
    setFiltersState((current) => ({ ...INITIAL_FILTERS, city: current.city }));
    setQuery('');
    setPinned(null);
  }, []);

  const restaurants = useMemo(
    () => [...(supabaseConfigured ? liveRestaurants : []), ...prototypeRestaurants],
    [liveRestaurants],
  );

  const origin = geo === 'granted' && userPosition ? userPosition : CITY_CENTER;

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('sk');
    return restaurants
      .filter((r) => r.city === filters.city)
      .filter((r) => filters.district === 'Všetky časti' || r.district === filters.district)
      .filter((r) => !filters.cuisines.length || r.cuisines.some((c) => filters.cuisines.includes(c)))
      .filter((r) => !filters.delivery || r.delivery.available)
      .filter((r) => !filters.openAt || openStatus(r, nextAt(filters.openAt)).open)
      .filter((r) => Math.round(r.rating) >= filters.minRating)
      .filter((r) => !pinned || r.slug === pinned)
      .filter((r) => filters.sort !== 'favorites' || favorites.includes(r.slug))
      .filter((r) => {
        const dayMenu = dailyFor(r, filters.day);
        const items = (r.live && !dayMenu.length ? r.standard : dayMenu).filter(
          (item) =>
            item.price <= filters.maxPrice &&
            !item.allergens.some((allergen) => filters.excluded.includes(String(allergen))),
        );
        const publishesMenu = r.daily.some((day) => day.length) || r.standard.length > 0;
        if (!items.length && publishesMenu) return false;
        if (!q) return true;
        return (
          r.name.toLocaleLowerCase('sk').includes(q) ||
          items.some((item) => item.name.toLocaleLowerCase('sk').includes(q))
        );
      })
      .map((r) => ({ r, distance: distanceKm(origin, r) }))
      .sort((a, b) => {
        if (filters.sort === 'distance') return a.distance - b.distance;
        if (filters.sort === 'price') {
          const avg = (restaurant: Restaurant) => {
            const menu = dailyFor(restaurant, filters.day);
            return menu.length
              ? menu.reduce((sum, item) => sum + item.price, 0) / menu.length
              : Infinity;
          };
          return avg(a.r) - avg(b.r);
        }
        return b.r.rating - a.r.rating;
      });
  }, [favorites, filters, origin, pinned, query, restaurants]);

  const activeCount =
    [
      filters.delivery,
      filters.maxPrice < MAX_PRICE,
      filters.minRating > 0,
      Boolean(filters.openAt),
      Boolean(pinned),
    ].filter(Boolean).length +
    filters.excluded.length +
    filters.cuisines.length;

  const dark = theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('menufy-theme');
        if (active && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
        }
      } catch {
        /* keep system theme */
      }
      if (!supabaseConfigured) return;
      const { data } = await supabase.auth.getSession();
      if (active) applySession(data.session);
    })();

    const authSubscription = supabaseConfigured
      ? supabase.auth.onAuthStateChange((_event, session) => applySession(session))
      : null;

    return () => {
      active = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setCatalogLoading(false);
      return;
    }
    let active = true;
    void (async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select(RESTAURANT_SELECT)
        .eq('status', 'active')
        .eq('owner_submitted', true);
      if (active && !error) {
        setLiveRestaurants((data as unknown as Parameters<typeof toRestaurant>[0][]).map(toRestaurant));
      }
      if (active) setCatalogLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [catalogRevision]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void refreshProfile();
      refreshRestaurants();
    });
    return () => subscription.remove();
  }, [refreshProfile, refreshRestaurants]);

  useEffect(() => {
    if (geo === 'unknown') void requestLocation();
  }, [geo, requestLocation]);

  useEffect(() => {
    if (!userPosition || appliedPosition.current === userPosition) return;
    appliedPosition.current = userPosition;
    const nearest = restaurants.reduce((a, b) =>
      distanceKm(userPosition, a) <= distanceKm(userPosition, b) ? a : b,
    );
    setFiltersState((current) => ({
      ...current,
      city: nearest.city,
      district: 'Všetky časti',
      sort: 'distance',
    }));
  }, [restaurants, userPosition]);

  useEffect(() => {
    if (!loggedIn && filters.sort === 'favorites') {
      setFiltersState((current) => ({ ...current, sort: 'rating' }));
    }
  }, [filters.sort, loggedIn]);

  const value = useMemo<MenufyContextValue>(
    () => ({
      loggedIn,
      email,
      displayName,
      userId,
      theme,
      setTheme,
      dark,
      notify,
      setNotify,
      signIn,
      signUp,
      resendVerification,
      resetPassword,
      signOut,
      updateDisplayName,
      updatePassword,
      updateEmail,
      deleteAccount,
      refreshProfile,
      restaurants,
      catalogLoading,
      refreshRestaurants,
      favorites,
      toggleFavorite,
      geo,
      userPosition,
      locationError,
      requestLocation,
      panel,
      setPanel,
      togglePanel,
      query,
      setQuery,
      filters,
      setFilters,
      activeCount,
      resetFilters,
      pinned,
      setPinned,
      results,
    }),
    [
      activeCount,
      catalogLoading,
      dark,
      deleteAccount,
      displayName,
      email,
      favorites,
      filters,
      geo,
      locationError,
      loggedIn,
      notify,
      panel,
      pinned,
      query,
      refreshProfile,
      refreshRestaurants,
      requestLocation,
      resetFilters,
      restaurants,
      results,
      resendVerification,
      resetPassword,
      setFilters,
      setNotify,
      setPanel,
      setTheme,
      signIn,
      signOut,
      signUp,
      theme,
      toggleFavorite,
      togglePanel,
      updateDisplayName,
      updateEmail,
      updatePassword,
      userId,
      userPosition,
    ],
  );

  return <MenufyContext.Provider value={value}>{children}</MenufyContext.Provider>;
}

export function useMenufy(): MenufyContextValue {
  const value = useContext(MenufyContext);
  if (!value) throw new Error('useMenufy must be used inside MenufyProvider');
  return value;
}
