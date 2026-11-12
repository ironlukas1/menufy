import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Panel = "search" | "filters" | "map" | null;

type UiContextValue = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  activeFilters: number;
  setActiveFilters: (count: number) => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);

  // Setting any panel true replaces the current one; closing is conditional so
  // a stale close action cannot dismiss a different panel opened just after it.
  const setSearchOpen = useCallback((open: boolean) => setPanel((current) => open ? "search" : current === "search" ? null : current), []);
  const setFiltersOpen = useCallback((open: boolean) => setPanel((current) => open ? "filters" : current === "filters" ? null : current), []);
  const setMapOpen = useCallback((open: boolean) => setPanel((current) => open ? "map" : current === "map" ? null : current), []);

  const value = useMemo<UiContextValue>(() => ({
    searchOpen: panel === "search",
    setSearchOpen,
    query,
    setQuery,
    filtersOpen: panel === "filters",
    setFiltersOpen,
    activeFilters,
    setActiveFilters,
    mapOpen: panel === "map",
    setMapOpen,
  }), [panel, query, activeFilters, setSearchOpen, setFiltersOpen, setMapOpen]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error("useUi must be used inside UiProvider");
  return value;
}
