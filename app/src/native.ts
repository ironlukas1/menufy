import { Capacitor } from "@capacitor/core";

const params = new URLSearchParams(location.search);

export const isNative = Capacitor.isNativePlatform() || params.has("native");

/**
 * True when the WebView runs inside a real native tab bar (the Expo preview).
 * The native UIKit bar already renders Liquid Glass, so the web app must not
 * draw its own bottom navigation on top of it.
 */
export const hasNativeTabBar = params.get("tabbar") === "native";

/**
 * True when the Expo shell also renders the top-bar icon buttons with real
 * UIKit Liquid Glass and expects the web app to hide its CSS copies.
 */
export const hasNativeGlass = params.get("glass") === "native";

if (isNative) document.documentElement.classList.add("native");
if (hasNativeTabBar) document.documentElement.classList.add("native-tabbar");
if (hasNativeGlass) document.documentElement.classList.add("native-glass");
