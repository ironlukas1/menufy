const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost",
];

// Configured origins must be HTTPS or loopback HTTP; never reflect arbitrary schemes.
function validConfiguredOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.username || url.password || url.origin !== origin) return false;
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]");
  } catch {
    return false;
  }
}

function allowedOrigins() {
  const configured = process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(validConfiguredOrigin) ?? [];
  const development = process.env.NODE_ENV !== "production" ? LOCAL_ORIGINS : [];
  return new Set([...development, ...configured]);
}

export function withCors(request: Request, response: Response) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) return response;

  const headers = new Headers(response.headers);
  headers.delete("Access-Control-Allow-Credentials");
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.append("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
