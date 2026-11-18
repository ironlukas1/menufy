import { Capacitor } from "@capacitor/core";

const params = new URLSearchParams(location.search);

export const isNative = Capacitor.isNativePlatform() || params.has("native");
const isIOSApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
const previewGlassHearts = params.get("glass") === "native";
/** The bottom tab bar is drawn by the native shell; the web copy must hide. */
export const nativeTabBar = isIOSApp || params.get("tabbar") === "native";
/** The three top-bar buttons are drawn natively with real Liquid Glass. */
export const nativeGlass = isIOSApp || params.get("glass") === "native";

if (isNative) document.documentElement.classList.add("native");
if (nativeTabBar) document.documentElement.dataset.tabbar = "native";
if (nativeGlass) document.documentElement.dataset.glass = "native";
if (previewGlassHearts) document.documentElement.dataset.glassHearts = "native";
