import "server-only";
import { createDatabaseClient } from "@/server/db/supabase";
import { withCors } from "@/server/http/cors";
import { clientIdentifier, createKeyedRequestBudget, fetchGoogleRating, PlacesRequestError, validPlaceId } from "@/server/google/places";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const takeRequest = createKeyedRequestBudget();

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const reply = (data: unknown, error: { code: string; message: string } | null, status = 200, retryAfterSeconds = 60) => withCors(request,
    Response.json({ data, error }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": String(retryAfterSeconds) } : {}) } }));
  const { slug } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)) return reply(null, { code: "NOT_FOUND", message: "Reštaurácia sa nenašla." }, 404);
  // Rate limit before any database work so unauthenticated callers cannot amplify load.
  const budget = takeRequest(`${clientIdentifier(request)}\u0000${slug}`);
  if (!budget.allowed) return reply(null, { code: "RATE_LIMITED", message: "Hodnotenie skúste načítať o chvíľu." }, 429, budget.retryAfterSeconds);
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return reply(null, { code: "NOT_CONFIGURED", message: "Google hodnotenia zatiaľ nie sú dostupné." }, 503);
  try {
    const { data, error } = await createDatabaseClient().from("restaurants")
      .select("google_place_id").eq("slug", slug).eq("status", "active").maybeSingle();
    if (error) return reply(null, { code: "DATABASE_UNAVAILABLE", message: "Google hodnotenie sa nepodarilo načítať." }, 503);
    if (!data) return reply(null, { code: "NOT_FOUND", message: "Reštaurácia sa nenašla." }, 404);
    if (!data.google_place_id || !validPlaceId(data.google_place_id)) return reply(null, { code: "NOT_LINKED", message: "Reštaurácia zatiaľ nemá prepojené Google Maps." }, 404);
    return reply(await fetchGoogleRating(data.google_place_id, key), null);
  } catch (error) {
    const code = error instanceof PlacesRequestError ? error.code : "GOOGLE_UNAVAILABLE";
    return reply(null, { code, message: "Google hodnotenie momentálne nie je dostupné. Skúste neskôr." }, code === "PLACE_NOT_FOUND" ? 404 : 502);
  }
}
export function OPTIONS(request: Request) { return withCors(request, new Response(null, { status: 204 })); }
