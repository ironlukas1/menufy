import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform() || new URLSearchParams(location.search).has("native");

if (isNative) document.documentElement.classList.add("native");
