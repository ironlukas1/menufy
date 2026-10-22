/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API origin for production/Capacitor builds. Empty = same origin. */
  readonly VITE_API_URL?: string;
  /** Dev-only proxy target for `/api` (defaults to http://localhost:3001). */
  readonly VITE_API_PROXY_TARGET?: string;
  /** Optional identity for the server's dev auth stub (`X-Menufy-User`). */
  readonly VITE_API_USER?: string;
}
