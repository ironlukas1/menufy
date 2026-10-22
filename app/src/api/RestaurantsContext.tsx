import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, ApiError } from "@/api/client";
import { restaurants as bundledRestaurants, type Restaurant } from "@/data/restaurants";

type Source = "api" | "bundled";

type Value = {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  /** `bundled` = the offline prototype data in `src/data/restaurants.ts`. */
  source: Source;
  reload: () => void;
};

const Ctx = createContext<Value | null>(null);

/**
 * Loads the restaurant list from the Next.js API once per session.
 * If the backend is not running the prototype keeps working with the bundled
 * data, so `app/` can still be demoed without `server/`.
 */
export function RestaurantsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Value, "reload">>({
    restaurants: bundledRestaurants,
    loading: true,
    error: null,
    source: "bundled",
  });
  const started = useRef(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const { data } = await api.restaurants({ limit: 50 });
      // An empty list is valid data (a fresh database); only request failures
      // fall back to the bundled prototype data below.
      setState({ restaurants: data ?? [], loading: false, error: null, source: "api" });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Menu sa nepodarilo načítať.";
      console.warn(`[menufy] API nedostupné, používam zabudované dáta: ${message}`);
      setState({ restaurants: bundledRestaurants, loading: false, error: message, source: "bundled" });
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void load();
  }, [load]);

  const value = useMemo<Value>(() => ({ ...state, reload: () => void load() }), [state, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRestaurants(): Value {
  const value = useContext(Ctx);
  if (!value) throw new Error("useRestaurants outside RestaurantsProvider");
  return value;
}

export function useRestaurant(slug: string | undefined) {
  const { restaurants, loading, source, error } = useRestaurants();
  return {
    restaurant: restaurants.find((restaurant) => restaurant.slug === slug) ?? null,
    loading,
    source,
    error,
  };
}
