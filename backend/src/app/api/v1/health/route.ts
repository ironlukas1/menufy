import { withCors } from "@/server/http/cors";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return withCors(
    request,
    Response.json(
      {
        data: {
          status: "ok",
          service: "menufy-api",
          checkedAt: new Date().toISOString(),
        },
        error: null,
      },
      { headers: { "Cache-Control": "no-store" } },
    ),
  );
}

export function OPTIONS(request: Request) {
  return withCors(request, new Response(null, { status: 204 }));
}
