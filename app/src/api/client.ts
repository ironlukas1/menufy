import type { Restaurant } from "@/data/restaurants";

/** API-only types (the restaurant shape intentionally matches the local one). */

export type Notice = {
  id: string;
  kind: "menu" | "offer" | "system";
  title: string;
  body: string;
  time: string;
  slug: string | null;
  createdAt: string;
  read: boolean;
};

export type Me = {
  id: string;
  email: string;
  role: "user" | "manager" | "admin";
};

export type Catalog = {
  cuisines: string[];
  cities: { name: string; districts: string[] }[];
  allergens: { code: number; name: string }[];
  days: { slot: number; date: string }[];
};

export type ApiMeta = Record<string, unknown>;

export type RestaurantQuery = {
  q?: string;
  day?: number;
  city?: string;
  district?: string;
  type?: string[];
  exclude?: number[];
  maxPrice?: number;
  minRating?: number;
  delivery?: boolean;
  sort?: "rating" | "price" | "distance";
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
};

/**
 * In dev the empty base means "same origin" and Vite proxies `/api` to the
 * Next.js server (see vite.config.ts). For Capacitor builds set VITE_API_URL to
 * the deployed API origin.
 */
const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const apiBaseUrl = baseUrl || "(same origin / Vite proxy)";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
};

type Envelope<T> = {
  data?: T;
  meta?: ApiMeta;
  error?: { code?: string; message?: string };
};

/** Dev identity for the server's auth stub (manager/admin endpoints). */
const devUser = import.meta.env.VITE_API_USER?.trim();

function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      for (const entry of value) search.append(key, String(entry));
    } else {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta?: ApiMeta }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (devUser) headers["X-Menufy-User"] = devUser;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "network_error", "Server neodpovedá. Skontrolujte, či beží menufy-server.");
  } finally {
    window.clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "http_error",
      payload?.error?.message ?? `HTTP ${response.status}`,
    );
  }

  return { data: payload?.data as T, meta: payload?.meta };
}

export const api = {
  health: () => request<{ status: string; dataSource: string }>("/api/health"),
  restaurants: (params: RestaurantQuery = {}) =>
    request<Restaurant[]>(`/api/restaurants${queryString(params)}`),
  restaurant: (slug: string) =>
    request<Restaurant>(`/api/restaurants/${encodeURIComponent(slug)}`),
  catalog: () => request<Catalog>("/api/types"),
  me: () => request<Me>("/api/me"),
  favorites: {
    list: () => request<string[]>("/api/favorites"),
    add: (slug: string) =>
      request<{ slug: string; favorite: boolean }>(`/api/favorites/${encodeURIComponent(slug)}`, {
        method: "POST",
      }),
    remove: (slug: string) =>
      request<{ slug: string; favorite: boolean }>(`/api/favorites/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      }),
  },
  notifications: {
    list: () => request<Notice[]>("/api/notifications"),
    markRead: (id: string) =>
      request<{ id: string; read: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST",
      }),
  },
};
