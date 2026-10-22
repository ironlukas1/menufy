/**
 * Runtime configuration. Read once per server process, overridable in `.env.local`.
 * Keep every environment-dependent decision here so the Supabase switch touches
 * a single file.
 */

function csv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : fallback;
}

export type DataSource = "memory" | "supabase";

function resolveDataSource(): DataSource {
  const raw = (process.env.MENUFY_DATA_SOURCE ?? "memory").trim().toLowerCase();
  if (raw === "supabase") return "supabase";
  if (raw !== "memory") {
    console.warn(`[menufy] Unknown MENUFY_DATA_SOURCE="${raw}", falling back to "memory".`);
  }
  return "memory";
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  version: "0.1.0",
  dataSource: resolveDataSource(),
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  devUserEmail: (process.env.MENUFY_DEV_USER ?? "zuzana@example.sk").trim().toLowerCase(),
  adminEmails: csv(process.env.MENUFY_ADMIN_EMAILS, ["admin@menufy.sk"]).map((e) => e.toLowerCase()),
  managerEmails: csv(process.env.MENUFY_MANAGER_EMAILS, ["obed@bistromlyn.sk"]).map((e) => e.toLowerCase()),
  corsOrigins: csv(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "capacitor://localhost",
    "ionic://localhost",
    "https://localhost",
    "http://localhost",
  ]),
} as const;
