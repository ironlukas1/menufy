import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const FALLBACK_PORT = 5173;

/**
 * Resolve the URL of the menufy web app.
 *
 * 1. EXPO_PUBLIC_MENUFY_URL wins (use this for a tunnel URL).
 * 2. Otherwise assume `pnpm dev --host` runs on the same machine as Metro,
 *    so reuse the host part of Expo's hostUri and just swap the port.
 */
function resolveAppUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_MENUFY_URL?.trim();
  if (explicit) return explicit;

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  const hostname = host && host !== 'localhost' && host !== '127.0.0.1' ? host : 'localhost';
  return `http://${hostname}:${FALLBACK_PORT}`;
}

/**
 * Absolute URL for one tab's web route.
 *
 * `tabbar=native` tells the web app that the bottom navigation is drawn by
 * UIKit (NativeTabs), so it must hide its own tab bar and reserve room for the
 * floating system one.
 *
 * `glass=native` additionally tells it that the three top-bar buttons are
 * drawn by UIKit with the real Liquid Glass material, so the web copies must
 * be hidden while still occupying their layout slot.
 */
function appUrlFor(path: string, glass: boolean): string {
  const url = new URL(path, resolveAppUrl());
  if (!url.searchParams.has('native')) url.searchParams.set('native', '1');
  url.searchParams.set('tabbar', 'native');
  if (glass) url.searchParams.set('glass', 'native');
  return url.toString();
}

type ChromeRect = { x: number; y: number; w: number; h: number };

type ChromeState = {
  rects: { map: ChromeRect | null; filter: ChromeRect | null; search: ChromeRect | null };
  open: { map: boolean; filters: boolean; search: boolean };
  count: number;
  dark: boolean;
  /** Scroll offset of the page at snapshot time. */
  scrollY?: number;
  /** Favorite (heart) buttons of the cards, as document-relative rects. */
  hearts?: { slug: string; active: boolean; x: number; y: number; w: number; h: number }[];
};

type GlassButtonProps = {
  rect: ChromeRect | null;
  icon: SFSymbol;
  active: boolean;
  dark: boolean;
  label: string;
  badge?: number;
  onPress: () => void;
};

/**
 * A real UIKit Liquid Glass button. The web app reports where its own (hidden)
 * button would be, so the native view lands exactly on top of it.
 */
function GlassButton({ rect, icon, active, dark, label, badge, onPress }: GlassButtonProps) {
  if (!rect) return null;
  const tint = active ? (dark ? '#7ee0ad' : '#176b43') : dark ? '#e8efe9' : '#17211b';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      <GlassView
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: rect.w / 2 }}
        glassEffectStyle="regular"
        isInteractive
        colorScheme={dark ? 'dark' : 'light'}
        tintColor={active ? (dark ? 'rgba(47,154,101,0.35)' : 'rgba(23,107,67,0.28)') : undefined}
      />
      <View pointerEvents="none" style={styles.glassContent}>
        <SymbolView name={icon} size={22} weight="semibold" tintColor={tint} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * One native tab's content: the menufy web app in a WKWebView.
 *
 * The WebView is mounted on first focus and then kept alive, so unvisited tabs
 * do not each boot the whole SPA while still keeping scroll position and state
 * when switching back.
 */
export function WebScreen({ path }: { path: string }) {
  // Expo Go ships expo-glass-effect, so on iOS 26 we can use the genuine
  // UIKit Liquid Glass material instead of the CSS approximation.
  const glassReady = useMemo(() => {
    try {
      return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
    } catch {
      return false;
    }
  }, []);
  const appUrl = useMemo(() => appUrlFor(path, glassReady), [path, glassReady]);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView<{}>>(null);
  // Live scroll offset of the page inside the WebView. The heart layer's
  // rects are document-relative, so this value positions them continuously —
  // animated directly (no re-render) as the WKWebView scrolls.
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chrome, setChrome] = useState<ChromeState | null>(null);

  useFocusEffect(
    useCallback(() => {
      setActivated(true);
      // The tab kept its page and scroll position while it was hidden; ask
      // the web to re-post its snapshot so the glass hearts land correctly.
      webViewRef.current?.injectJavaScript(
        'window.__menufyChrome && window.__menufyChrome.poke && window.__menufyChrome.poke(); true;'
      );
    }, [])
  );

  // WKWebView reports env(safe-area-inset-*) in most cases, but inside Expo Go
  // it can come back as 0. Mirror the native insets into CSS variables so the
  // header always clears the notch.
  const injectInsets = useMemo(() => {
    const px = (v: number) => `${Math.max(0, Math.round(v))}px`;
    return `
      (function () {
        var root = document.documentElement;
        if (!root) return;
        root.style.setProperty('--safe-top', '${px(insets.top)}');
        root.style.setProperty('--safe-bottom', '${px(insets.bottom)}');
        root.style.setProperty('--safe-left', '${px(insets.left)}');
        root.style.setProperty('--safe-right', '${px(insets.right)}');
      })();
      true;
    `;
  }, [insets.top, insets.bottom, insets.left, insets.right]);

  const runWebCommand = useCallback((command: string) => {
    webViewRef.current?.injectJavaScript(
      `window.__menufyChrome && window.__menufyChrome.${command}(); true;`
    );
  }, []);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!activated) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <ActivityIndicator size="large" color="#176b43" />
      </View>
    );
  }

  const showGlass = glassReady && !!chrome && !loading && !error;

  return (
    <View style={styles.container}>
      <WebView<{}>
        ref={webViewRef}
        source={{ uri: appUrl }}
        originWhitelist={['*']}
        style={styles.webview}
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        contentInsetAdjustmentBehavior="never"
        geolocationEnabled
        mediaPlaybackRequiresUserAction={false}
        // Let the page open the keyboard via focus() without a user gesture —
        // the glass search button toggles through the bridge (no gesture in
        // the web context), and the input auto-focuses on mount.
        keyboardDisplayRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectInsets}
        injectedJavaScript={injectInsets}
        onScroll={(event: { nativeEvent: { contentOffset: { y: number } } }) =>
          scrollY.setValue(event.nativeEvent.contentOffset.y)
        }
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          if (!data.startsWith('{')) return;
          try {
            const message = JSON.parse(data);
            if (message?.type === 'menufy:chrome') {
              setChrome(message as ChromeState);
              if (typeof message.scrollY === 'number') scrollY.setValue(message.scrollY);
            }
          } catch {
            // Ignore non-chrome messages from the page.
          }
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={({ nativeEvent }) => {
          setLoading(false);
          setError(nativeEvent.description || 'Nepodarilo sa načítať aplikáciu.');
        }}
      />

      {showGlass && chrome ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <GlassButton
            rect={chrome.rects.map}
            icon={chrome.open.map ? 'xmark' : 'map'}
            active={chrome.open.map}
            dark={chrome.dark}
            label={chrome.open.map ? 'Zavrieť mapu' : 'Otvoriť mapu'}
            onPress={() => runWebCommand('toggleMap')}
          />
          <GlassButton
            rect={chrome.rects.filter}
            icon="slider.horizontal.3"
            active={chrome.open.filters}
            dark={chrome.dark}
            label={chrome.open.filters ? 'Zavrieť filtre' : 'Filtre'}
            badge={chrome.count}
            onPress={() => runWebCommand('toggleFilters')}
          />
          <GlassButton
            rect={chrome.rects.search}
            icon={chrome.open.search ? 'xmark' : 'magnifyingglass'}
            active={chrome.open.search}
            dark={chrome.dark}
            label={chrome.open.search ? 'Zavrieť hľadanie' : 'Hľadať'}
            onPress={() => runWebCommand('toggleSearch')}
          />
        </View>
      ) : null}

      {showGlass && chrome && chrome.hearts?.length ? (
        // Real Liquid Glass hearts over the card favorites. Heart rects are
        // document-relative; the layer follows the WebView's scroll offset.
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { transform: [{ translateY: Animated.multiply(scrollY, -1) }] }]}
        >
          {chrome.hearts.map((heart) => (
            <GlassButton
              key={heart.slug}
              rect={heart}
              icon={heart.active ? 'heart.fill' : 'heart'}
              active={heart.active}
              dark={chrome.dark}
              label={heart.active ? 'Odobrať z obľúbených' : 'Pridať do obľúbených'}
              onPress={() =>
                webViewRef.current?.injectJavaScript(
                  `window.__menufyChrome && window.__menufyChrome.heartTap(${JSON.stringify(heart.slug)}); true;`
                )
              }
            />
          ))}
        </Animated.View>
      ) : null}

      {loading && !error ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#176b43" />
        </View>
      ) : null}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>Aplikácia sa nenačítala</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.url}>{appUrl}</Text>
          <Text style={styles.hint}>
            Skontroluj, či beží `pnpm dev` v priečinku app/ a či je telefón pripojený k
            tunelu. Pri tuneli nastav EXPO_PUBLIC_MENUFY_URL.
          </Text>
          <Pressable style={styles.button} onPress={reload}>
            <Text style={styles.buttonText}>Skúsiť znova</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0c' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  webview: { flex: 1, backgroundColor: '#0b0b0c' },
  glassContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176b43',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(11,11,12,0.92)',
    gap: 10,
  },
  errorTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center' },
  url: { color: '#86efac', fontSize: 13, fontFamily: 'Courier' },
  hint: { color: '#a1a1aa', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#176b43',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
