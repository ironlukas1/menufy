import type { NextConfig } from "next";

/**
 * This project is an API-only Next.js app (App Router route handlers).
 * The visitor PWA lives in `../app` (Vite) and talks to `/api/*`.
 *
 * CORS + preflight are handled explicitly in `src/lib/http.ts` so the
 * behaviour is identical in dev, in production and inside the Capacitor shell.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
