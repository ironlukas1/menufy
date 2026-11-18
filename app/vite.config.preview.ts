import { defineConfig, mergeConfig } from "vite";
import base from "./vite.config";

/**
 * Dev-server config for testing on a phone through a public tunnel
 * (cloudflared / ngrok / Expo tunnel). Those proxies connect with a hostname
 * Vite does not know, so the host check has to be relaxed.
 *
 * Run with: pnpm dev --config vite.config.preview.ts --host 0.0.0.0
 */
export default mergeConfig(
  base,
  defineConfig({
    server: {
      allowedHosts: true,
    },
  }),
);
