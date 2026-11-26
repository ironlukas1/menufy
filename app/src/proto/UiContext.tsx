import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

/**
 * Which top-bar panel is open. Only one at a time.
 *
 * The open panel lives in the URL (`?panel=search`), so opening one pushes a
 * history entry: the phone's back button / back swipe pops it and closes the
 * window instead of leaving the app.
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
  /** Selected area (city). Drives the results and the header picker. */
  city: string;
  setCity: (city: string) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

const panelOf = (search: string): ChromePanel => {
  const p = new URLSearchParams(search).get("panel");
  return p === "search" || p === "filters" || p === "map" ? p : null;
};

export function UiProvider({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const panel = panelOf(loc.search);

  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);
  const [city, setCity] = useState("Bratislava");

  const setPanel = useCallback(
    (next: ChromePanel) => {
      const params = new URLSearchParams(loc.search);
      if (next) params.set("panel", next);
      else params.delete("panel");
      const search = params.toString();
      const target = `${loc.pathname}${search ? `?${search}` : ""}${loc.hash}`;

      if (next) {
        // Opening from a closed state gets its own entry; switching between
        // windows replaces it so a single back press closes the window.
        nav(target, { replace: panel !== null });
        return;
      }
      // Closing pops the entry the window pushed, so the history stays in sync.
      const idx = (window.history.state as { idx?: number } | null)?.idx;
      if (typeof idx === "number" && idx > 0) nav(-1);
      else nav(target, { replace: true });
    },
    [loc.search, loc.pathname, loc.hash, nav, panel],
  );

  const togglePanel = useCallback(
    (next: Exclude<ChromePanel, null>) => setPanel(panel === next ? null : next),
    [panel, setPanel],
  );

  const value = useMemo<UiContextValue>(
    () => ({ panel, setPanel, togglePanel, query, setQuery, activeFilters, setActiveFilters, city, setCity }),
    [panel, setPanel, togglePanel, query, activeFilters, city],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}
