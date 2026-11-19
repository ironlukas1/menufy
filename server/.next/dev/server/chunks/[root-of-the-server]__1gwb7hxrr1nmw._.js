module.exports = [
(()=>{"use strict";return[
"[project]/src/app/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
;
;
const dynamic = "force-dynamic";
const OPTIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preflight"];
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["route"])(async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
        service: "menufy-api",
        version: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].version,
        dataSource: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].dataSource,
        ui: "http://localhost:5173",
        docs: "server/README.md",
        endpoints: {
            health: "/api/health",
            catalog: "/api/types",
            restaurants: "/api/restaurants?q=&day=0",
            restaurant: "/api/restaurants/{slug}",
            menus: "/api/restaurants/{slug}/menus?from=&to=",
            menuImport: "POST /api/menus/import",
            favorites: "/api/favorites",
            notifications: "/api/notifications",
            me: "/api/me",
            admin: "/api/admin/restaurants?status=pending"
        }
    }));
}),
"[project]/src/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env
]);
/**
 * Runtime configuration. Read once per server process, overridable in `.env.local`.
 * Keep every environment-dependent decision here so the Supabase switch touches
 * a single file.
 */ function csv(value, fallback) {
    if (!value) return fallback;
    const parts = value.split(",").map((s)=>s.trim()).filter(Boolean);
    return parts.length ? parts : fallback;
}
function resolveDataSource() {
    const raw = (process.env.MENUFY_DATA_SOURCE ?? "memory").trim().toLowerCase();
    if (raw === "supabase") return "supabase";
    if (raw !== "memory") {
        console.warn(`[menufy] Unknown MENUFY_DATA_SOURCE="${raw}", falling back to "memory".`);
    }
    return "memory";
}
const env = {
    nodeEnv: ("TURBOPACK compile-time value", "development") ?? "development",
    isProduction: ("TURBOPACK compile-time value", "development") === "production",
    version: "0.1.0",
    dataSource: resolveDataSource(),
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    devUserEmail: (process.env.MENUFY_DEV_USER ?? "zuzana@example.sk").trim().toLowerCase(),
    adminEmails: csv(process.env.MENUFY_ADMIN_EMAILS, [
        "admin@menufy.sk"
    ]).map((e)=>e.toLowerCase()),
    managerEmails: csv(process.env.MENUFY_MANAGER_EMAILS, [
        "obed@bistromlyn.sk"
    ]).map((e)=>e.toLowerCase()),
    corsOrigins: csv(process.env.CORS_ORIGINS, [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "capacitor://localhost",
        "ionic://localhost",
        "https://localhost",
        "http://localhost"
    ])
};
}),
"[project]/src/lib/http.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "notFound",
    ()=>notFound,
    "ok",
    ()=>ok,
    "parseBody",
    ()=>parseBody,
    "parseQuery",
    ()=>parseQuery,
    "preflight",
    ()=>preflight,
    "route",
    ()=>route
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$2_$40$types$2b$node$40$22$2e$20$2e$5_react$2d$dom$40$19$2e$3$2e$1_react$40$19$2e$3$2e$1_$5f$react$40$19$2e$3$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.4.2_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$7$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/errors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
;
;
;
class ApiError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details){
        super(message), this.status = status, this.code = code, this.details = details;
        this.name = "ApiError";
    }
}
const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Menufy-User",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
};
function withCors(res, req) {
    const origin = req.headers.get("origin");
    const allowed = !!origin && (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].corsOrigins.includes("*") || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].corsOrigins.includes(origin));
    for (const [key, value] of Object.entries(CORS_HEADERS))res.headers.set(key, value);
    if (allowed && origin) {
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return res;
}
function preflight(req) {
    return withCors(new Response(null, {
        status: 204
    }), req);
}
function ok(data, init = {}) {
    const body = init.meta === undefined ? {
        data
    } : {
        data,
        meta: init.meta
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$2_$40$types$2b$node$40$22$2e$20$2e$5_react$2d$dom$40$19$2e$3$2e$1_react$40$19$2e$3$2e$1_$5f$react$40$19$2e$3$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(body, {
        status: init.status ?? 200
    });
}
function notFound(message) {
    return new ApiError(404, "not_found", message);
}
function validationError(error) {
    return new ApiError(422, "validation_error", "Neplatné vstupy.", error.issues.map((issue)=>({
            path: issue.path.join("."),
            message: issue.message
        })));
}
function errorResponse(error) {
    if (error instanceof ApiError) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$2_$40$types$2b$node$40$22$2e$20$2e$5_react$2d$dom$40$19$2e$3$2e$1_react$40$19$2e$3$2e$1_$5f$react$40$19$2e$3$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            }
        }, {
            status: error.status
        });
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$7$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"]) {
        const apiError = validationError(error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$2_$40$types$2b$node$40$22$2e$20$2e$5_react$2d$dom$40$19$2e$3$2e$1_react$40$19$2e$3$2e$1_$5f$react$40$19$2e$3$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: {
                code: apiError.code,
                message: apiError.message,
                details: apiError.details
            }
        }, {
            status: apiError.status
        });
    }
    console.error("[menufy] Unhandled API error:", error);
    const message = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].isProduction ? "Interná chyba servera." : error instanceof Error ? error.message : "Neznáma chyba.";
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$2_$40$types$2b$node$40$22$2e$20$2e$5_react$2d$dom$40$19$2e$3$2e$1_react$40$19$2e$3$2e$1_$5f$react$40$19$2e$3$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: {
            code: "internal_error",
            message
        }
    }, {
        status: 500
    });
}
function route(handler) {
    return async (req, ctx)=>{
        try {
            return withCors(await handler(req, ctx), req);
        } catch (error) {
            return withCors(errorResponse(error), req);
        }
    };
}
async function parseBody(req, schema) {
    let raw;
    try {
        raw = await req.json();
    } catch  {
        throw new ApiError(400, "invalid_json", "Telo požiadavky musí byť platný JSON.");
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw validationError(parsed.error);
    return parsed.data;
}
async function parseQuery(req, schema) {
    const url = new URL(req.url);
    const query = {};
    for (const [key, value] of url.searchParams){
        const previous = query[key];
        if (previous === undefined) query[key] = value;
        else if (Array.isArray(previous)) previous.push(value);
        else query[key] = [
            previous,
            value
        ];
    }
    const parsed = schema.safeParse(query);
    if (!parsed.success) throw validationError(parsed.error);
    return parsed.data;
}
}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1gwb7hxrr1nmw._.js.map