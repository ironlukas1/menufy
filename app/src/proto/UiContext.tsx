import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Which top-bar panel is open. Only one at a time: opening the search bar
 * closes the filters and the map, and vice versa (panel = null closes all).
 */
export type ChromePanel = "search" | "filters" | "map" | null;

type UiContextValue = {
  panel: ChromePanel;
  /** Set the open panel directly (null closes everything). */
  setPanel: (panel: ChromePanel) => void;
  /** Toggle one panel; toggling the open panel closes it. */
  togglePanel: (panel: Exclude<ChromePanel, null>) => void;
  query: string;
  setQuery: (query: string) => void;
  activeFilters: number;
  setActiveFilters: (count: number) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<ChromePanel>(null);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);

  const togglePanel = useCallback((next: Exclude<ChromePanel, null>) => {
    setPanel((current) => (current === next ? null : next));
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({ panel, setPanel, togglePanel, query, setQuery, activeFilters, setActiveFilters }),
    [panel, togglePanel, query, activeFilters],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}
