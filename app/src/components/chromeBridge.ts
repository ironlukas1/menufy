/**
 * Bridge to the native iOS shell (expo-preview).
 *
 * The web app renders three placeholder buttons in the top bar. On iOS 26 the
 * shell covers them with real UIKit Liquid Glass buttons (`glass=native`), so
 * the web copies must stay invisible while still occupying their layout slot.
 * The shell needs each button's viewport rect plus the panel state, and calls
 * back through `window.__menufyChrome` when a glass button is pressed.
 *
 * The same protocol also carries the favorite (heart) buttons of the
 * restaurant cards. Those live in scrolling content, so the shell needs their
 * document-relative rects (viewport rect + current scroll offset) and applies
 * its own scroll offset continuously via the WebView's onScroll.
 */

export type ChromeRect = { x: number; y: number; w: number; h: number };

export type ChromeHeart = { slug: string; active: boolean; x: number; y: number; w: number; h: number };

export type ChromeSnapshot = {
  type: "menufy:chrome";
  rects: { map: ChromeRect | null; filter: ChromeRect | null; search: ChromeRect | null };
  open: { map: boolean; filters: boolean; search: boolean };
  count: number;
  dark: boolean;
  /** Current document scroll offset, so the shell can place hearts before the first scroll event. */
  scrollY: number;
  hearts: ChromeHeart[];
  /** State consumed by the Capacitor UIKit shell. */
  activeTab?: number;
  browse?: boolean;
};

type ChromeWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
  webkit?: { messageHandlers?: { menufyNativeChrome?: { postMessage: (message: unknown) => void } } };
  __menufyChrome?: {
    navigate: (path: string) => void;
    toggleSearch: () => void;
    toggleFilters: () => void;
    toggleMap: () => void;
    /** Native glass heart was pressed; forwards the tap to the web button. */
    heartTap: (slug: string) => void;
    /** Re-post the current snapshot (called when a tab regains focus). */
    poke: () => void;
  };
};
const rectOf = (el: Element | null): ChromeRect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/** Send the current chrome layout to the native shell (no-op in a browser). */
export function postChrome(snapshot: Omit<ChromeSnapshot, "type">) {
  const w = window as ChromeWindow;
  const message = { type: "menufy:chrome", ...snapshot };
  w.ReactNativeWebView?.postMessage(JSON.stringify(message));
  w.webkit?.messageHandlers?.menufyNativeChrome?.postMessage(message);
}

export const chromeRects = (): ChromeSnapshot["rects"] => ({
  map: rectOf(document.querySelector('[data-chrome="map"]')),
  filter: rectOf(document.querySelector('[data-chrome="filters"]')),
  search: rectOf(document.querySelector('[data-chrome="search"]')),
});

/** Favorite buttons, as document-relative rects for the native shell. */
export const chromeHearts = (): ChromeHeart[] =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-heart]"))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        slug: el.dataset.heart || "",
        active: el.classList.contains("selected"),
        x: Math.round(r.left + window.scrollX),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    })
    .filter((h) => h.slug && h.w > 0 && h.h > 0);

/**
 * Expose the commands the native shell calls (`window.__menufyChrome
 * .toggleSearch()` etc). Returns a cleanup that removes the bridge when the
 * top bar unmounts.
 */
export function installChromeBridge(
  toggles: { navigate: (path: string) => void; search: () => void; filters: () => void; map: () => void; heartTap: (slug: string) => void; poke: () => void },
) {
  const w = window as ChromeWindow;
  w.__menufyChrome = {
    navigate: toggles.navigate,
    toggleSearch: toggles.search,
    toggleFilters: toggles.filters,
    toggleMap: toggles.map,
    heartTap: toggles.heartTap,
    poke: toggles.poke,
  };
  return () => {
    delete w.__menufyChrome;
  };
}
