import { createDatabaseClient } from "@/server/db/supabase";
import { withCors } from "@/server/http/cors";

export const dynamic = "force-dynamic";

const CACHE_MS = 45_000;
type Health = { status: string; httpStatus: number };
let cached: { config: string; result: Health; expiresAt: number } | null = null;
let inFlight: Promise<Health> | null = null;

async function checkDatabase(table: string): Promise<Health> {
  try {
    // HEAD checks database access without returning any row contents.
    const { error } = await createDatabaseClient()
      .from(table)
      .select("*", { head: true })
      .limit(1)
      .abortSignal(AbortSignal.timeout(5000));
    return error ? { status: "unavailable", httpStatus: 503 } : { status: "ok", httpStatus: 200 };
  } catch {
    return { status: "unavailable", httpStatus: 503 };
  }
}

async function getHealth(configured: boolean, table?: string): Promise<Health> {
  const config = `${configured}\u0000${table ?? ""}`;
  if (cached && cached.config === config && cached.expiresAt > Date.now()) return cached.result;
  if (!inFlight) {
    inFlight = (configured && table ? checkDatabase(table) : Promise.resolve({ status: "not_configured", httpStatus: 503 }))
      .then((result) => {
        cached = { config, result, expiresAt: Date.now() + CACHE_MS };
        return result;
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

export async function GET(request: Request) {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
  const { status, httpStatus } = await getHealth(configured, process.env.SUPABASE_HEALTH_TABLE);

  return withCors(request, Response.json({
    data: { status, service: "menufy-database" },
    error: status === "not_configured"
      ? "Database connection and health-check table are not configured."
      : status === "unavailable" ? "Database check failed." : null,
  }, { status: httpStatus, headers: { "Cache-Control": "no-store" } }));
}

export function OPTIONS(request: Request) {
  return withCors(request, new Response(null, { status: 204 }));
}
