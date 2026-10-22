import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { env } from "./env";

/** Error carrying an HTTP status and a stable machine-readable code. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RouteContext<P> = { params: Promise<P> };

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Menufy-User",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function withCors(res: Response, req: NextRequest): Response {
  const origin = req.headers.get("origin");
  const allowed = !!origin && (env.corsOrigins.includes("*") || env.corsOrigins.includes(origin));
  for (const [key, value] of Object.entries(CORS_HEADERS)) res.headers.set(key, value);
  if (allowed && origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

/** Response for `OPTIONS` requests (browser + Capacitor preflight). */
export function preflight(req: NextRequest): Response {
  return withCors(new Response(null, { status: 204 }), req);
}

export function ok<T>(data: T, init: { status?: number; meta?: unknown } = {}): Response {
  const body = init.meta === undefined ? { data } : { data, meta: init.meta };
  return NextResponse.json(body, { status: init.status ?? 200 });
}

export function notFound(message: string): ApiError {
  return new ApiError(404, "not_found", message);
}

function validationError(error: ZodError): ApiError {
  return new ApiError(
    422,
    "validation_error",
    "Neplatné vstupy.",
    error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  );
}

function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    const apiError = validationError(error);
    return NextResponse.json(
      { error: { code: apiError.code, message: apiError.message, details: apiError.details } },
      { status: apiError.status },
    );
  }
  console.error("[menufy] Unhandled API error:", error);
  const message = env.isProduction
    ? "Interná chyba servera."
    : error instanceof Error
      ? error.message
      : "Neznáma chyba.";
  return NextResponse.json({ error: { code: "internal_error", message } }, { status: 500 });
}

/**
 * Wraps a route handler with error mapping + CORS. Every route in this app uses
 * it, so routes never repeat try/catch or header plumbing.
 */
export function route<P extends Record<string, string> = Record<string, never>>(
  handler: (req: NextRequest, ctx: RouteContext<P>) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: RouteContext<P>): Promise<Response> => {
    try {
      return withCors(await handler(req, ctx), req);
    } catch (error) {
      return withCors(errorResponse(error), req);
    }
  };
}

export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Telo požiadavky musí byť platný JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

export async function parseQuery<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  const url = new URL(req.url);
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of url.searchParams) {
    const previous = query[key];
    if (previous === undefined) query[key] = value;
    else if (Array.isArray(previous)) previous.push(value);
    else query[key] = [previous, value];
  }
  const parsed = schema.safeParse(query);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}
