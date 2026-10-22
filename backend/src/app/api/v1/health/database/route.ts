import { createDatabaseClient } from "@/server/db/supabase";
import { withCors } from "@/server/http/cors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
  const table = process.env.SUPABASE_HEALTH_TABLE;
  let status = "not_configured";
  let httpStatus = 503;

  if (configured && table) {
    try {
      // HEAD checks database access without returning any row contents.
      const { error } = await createDatabaseClient()
        .from(table)
        .select("*", { head: true })
        .limit(1)
        .abortSignal(AbortSignal.timeout(5000));
      status = error ? "unavailable" : "ok";
      httpStatus = error ? 503 : 200;
    } catch {
      status = "unavailable";
    }
  }

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
