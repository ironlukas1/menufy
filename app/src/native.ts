import { Capacitor } from "@capacitor/core";

const params = new URLSearchParams(location.search);
export const isNative = Capacitor.isNativePlatform() || params.has("native");
const isIOSApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

/** iOS uses a native Liquid Glass tab bar drawn above the Capacitor WebView. */
export const hasNativeTabBar = isIOSApp || params.get("tabbar") === "native";

/** iOS uses UIKit Liquid Glass for the three browse toolbar buttons. */
export const hasNativeGlass = isIOSApp || (params.get("glass") === "native");

if (isNative) document.documentElement.classList.add("native");
if (hasNativeTabBar) document.documentElement.classList.add("native-tabbar");
if (hasNativeGlass) document.documentElement.classList.add("native-glass");
