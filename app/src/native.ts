import { Capacitor } from "@capacitor/core";

const params = new URLSearchParams(location.search);

export const isNative = Capacitor.isNativePlatform() || params.has("native");
/** The bottom tab bar is drawn by the native shell; the web copy must hide. */
export const nativeTabBar = params.get("tabbar") === "native";
/** The three top-bar buttons are drawn natively with real Liquid Glass. */
export const nativeGlass = params.get("glass") === "native";

if (isNative) document.documentElement.classList.add("native");
if (nativeTabBar) document.documentElement.dataset.tabbar = "native";
if (nativeGlass) document.documentElement.dataset.glass = "native";
