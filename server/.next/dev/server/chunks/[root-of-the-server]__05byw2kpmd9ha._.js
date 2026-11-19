module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/notifications/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
;
;
;
const dynamic = "force-dynamic";
const OPTIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preflight"];
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["route"])(async (req)=>{
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
    const notices = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRepositories"])().notifications.list(user.id, user.email);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])(notices, {
        meta: {
            unread: notices.filter((notice)=>!notice.read).length
        }
    });
});
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "currentUser",
    ()=>currentUser,
    "requireRole",
    ()=>requireRole,
    "requireUser",
    ()=>requireUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
;
;
function roleFor(email) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].adminEmails.includes(email)) return "admin";
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].managerEmails.includes(email)) return "manager";
    return "user";
}
function currentUser(req) {
    const raw = req.headers.get("x-menufy-user") ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].devUserEmail;
    const email = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return {
        id: `user_${email}`,
        email,
        role: roleFor(email)
    };
}
function requireUser(req) {
    const user = currentUser(req);
    if (!user) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"](401, "unauthorized", "Chýba alebo je neplatná identita používateľa.");
    return user;
}
function requireRole(req, ...roles) {
    const user = requireUser(req);
    if (!roles.includes(user.role)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiError"](403, "forbidden", "Na túto akciu nemáte oprávnenie.");
    }
    return user;
}
}),
"[project]/src/lib/data/catalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALLERGENS",
    ()=>ALLERGENS,
    "DEFAULT_CUISINES",
    ()=>DEFAULT_CUISINES
]);
const ALLERGENS = [
    {
        code: 1,
        name: "Obilniny s lepkom"
    },
    {
        code: 2,
        name: "Kôrovce"
    },
    {
        code: 3,
        name: "Vajcia"
    },
    {
        code: 4,
        name: "Ryby"
    },
    {
        code: 5,
        name: "Arašidy"
    },
    {
        code: 6,
        name: "Sója"
    },
    {
        code: 7,
        name: "Mlieko"
    },
    {
        code: 8,
        name: "Orechy"
    },
    {
        code: 9,
        name: "Zeler"
    },
    {
        code: 10,
        name: "Horčica"
    },
    {
        code: 11,
        name: "Sezam"
    },
    {
        code: 12,
        name: "Oxid siričitý"
    },
    {
        code: 13,
        name: "Vlčí bôb"
    },
    {
        code: 14,
        name: "Mäkkýše"
    }
];
const DEFAULT_CUISINES = [
    "Slovenská",
    "Talianska",
    "Ázijská",
    "Vegánska",
    "Burger",
    "Stredomorská"
];
}),
"[project]/src/lib/data/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRepositories",
    ()=>getRepositories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$repositories$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/memory/repositories.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$repositories$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabase/repositories.ts [app-route] (ecmascript)");
;
;
;
let repositories = null;
function getRepositories() {
    if (!repositories) {
        repositories = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].dataSource === "supabase" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$repositories$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSupabaseRepositories"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$repositories$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createMemoryRepositories"])();
    }
    return repositories;
}
}),
"[project]/src/lib/data/memory/repositories.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMemoryRepositories",
    ()=>createMemoryRepositories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/slug.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/presentation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/memory/store.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const DEFAULT_HOURS = [
    [
        "Pondelok",
        "Zatvorené"
    ],
    [
        "Utorok",
        "Zatvorené"
    ],
    [
        "Streda",
        "Zatvorené"
    ],
    [
        "Štvrtok",
        "Zatvorené"
    ],
    [
        "Piatok",
        "Zatvorené"
    ],
    [
        "Sobota",
        "Zatvorené"
    ],
    [
        "Nedeľa",
        "Zatvorené"
    ]
];
function menusFor(slug) {
    return [
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().menus.values()
    ].filter((menu)=>menu.restaurantSlug === slug);
}
function withItems(menuId, items) {
    return items.map((item, index)=>({
            ...item,
            id: `mi_${menuId}_${index}`,
            position: index
        }));
}
function createMemoryRepositories() {
    return {
        restaurants: {
            async list (filter) {
                const allowed = filter.statuses ?? [
                    "active"
                ];
                const dtos = [
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().restaurants.values()
                ].filter((record)=>allowed.includes(record.status)).map((record)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menusFor(record.slug)));
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectRestaurants"])(dtos, filter);
            },
            async bySlug (slug) {
                const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().restaurants.get(slug);
                if (!record) return null;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menusFor(record.slug));
            },
            async listByStatus (status) {
                return [
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().restaurants.values()
                ].filter((record)=>record.status === status).map((record)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menusFor(record.slug), new Date(), true)).sort((a, b)=>a.name.localeCompare(b.name, "sk"));
            },
            async create (input) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                const slug = input.slug?.trim() ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugify"])(input.slug) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugify"])(input.name);
                if (!slug || store.restaurants.has(slug)) return null;
                const record = {
                    id: `r_${slug}`,
                    slug,
                    name: input.name,
                    initials: input.name.split(/\s+/).slice(0, 2).map((word)=>word[0] ?? "").join("").toUpperCase(),
                    tagline: input.tagline,
                    cuisines: input.cuisines,
                    city: input.city,
                    district: input.district,
                    address: input.address,
                    phone: input.phone,
                    email: input.email,
                    web: input.web,
                    ico: input.ico,
                    contactName: input.contactName,
                    rating: 0,
                    ratingCount: 0,
                    lat: input.lat ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lat,
                    lng: input.lng ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lng,
                    delivery: {
                        available: false,
                        eta: ""
                    },
                    hours: input.hours ?? DEFAULT_HOURS,
                    image: "",
                    gallery: [],
                    standard: [],
                    reviews: [],
                    status: "pending",
                    createdAt: new Date().toISOString()
                };
                store.restaurants.set(slug, record);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, []);
            },
            async updateStatus (slug, status) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                const record = store.restaurants.get(slug);
                if (!record) return null;
                record.status = status;
                store.restaurants.set(slug, record);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menusFor(slug), new Date(), true);
            },
            async catalog () {
                const restaurants = [
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().restaurants.values()
                ];
                const cuisines = [
                    ...new Set([
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_CUISINES"],
                        ...restaurants.flatMap((r)=>r.cuisines)
                    ])
                ].sort((a, b)=>a.localeCompare(b, "sk"));
                const cities = new Map();
                for (const restaurant of restaurants){
                    if (!cities.has(restaurant.city)) cities.set(restaurant.city, new Set());
                    if (restaurant.district) cities.get(restaurant.city).add(restaurant.district);
                }
                return {
                    cuisines,
                    cities: [
                        ...cities.entries()
                    ].map(([name, districts])=>({
                            name,
                            districts: [
                                ...districts
                            ].sort((a, b)=>a.localeCompare(b, "sk"))
                        })).sort((a, b)=>a.name.localeCompare(b.name, "sk")),
                    allergens: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALLERGENS"],
                    days: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_SLOTS"].map((slot)=>({
                            slot,
                            date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slotDate"])(slot)
                        }))
                };
            }
        },
        menus: {
            async get (restaurantSlug, date) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().menus.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["menuKey"])(restaurantSlug, date)) ?? null;
            },
            async listRange (restaurantSlug, from, to) {
                return [
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().menus.values()
                ].filter((menu)=>menu.restaurantSlug === restaurantSlug && menu.date >= from && menu.date <= to).sort((a, b)=>a.date.localeCompare(b.date));
            },
            async upsert (input) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["menuKey"])(input.restaurantSlug, input.date);
                const existing = store.menus.get(key);
                const now = new Date();
                const id = existing?.id ?? `m_${input.restaurantSlug}_${input.date}`;
                const menu = {
                    id,
                    restaurantSlug: input.restaurantSlug,
                    date: input.date,
                    status: input.status,
                    note: input.note ?? null,
                    publishedAt: input.status === "published" ? existing?.publishedAt ?? now.toISOString() : existing?.publishedAt ?? null,
                    updatedAt: now.toISOString(),
                    items: withItems(id, input.items)
                };
                store.menus.set(key, menu);
                return menu;
            },
            async update (id, patch) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                const entry = [
                    ...store.menus.entries()
                ].find(([, menu])=>menu.id === id);
                if (!entry) return null;
                const [key, existing] = entry;
                const now = new Date();
                const status = patch.status ?? existing.status;
                const menu = {
                    ...existing,
                    status,
                    note: patch.note === undefined ? existing.note : patch.note,
                    items: patch.items === undefined ? existing.items : withItems(existing.id, patch.items),
                    publishedAt: status === "published" ? existing.publishedAt ?? now.toISOString() : existing.publishedAt,
                    updatedAt: now.toISOString()
                };
                store.menus.set(key, menu);
                return menu;
            }
        },
        favorites: {
            async list (userId) {
                return [
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])().favorites.get(userId) ?? []
                ].sort((a, b)=>a.localeCompare(b));
            },
            async add (userId, _email, slug) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                const restaurant = store.restaurants.get(slug);
                if (!restaurant || restaurant.status !== "active") return false;
                const set = store.favorites.get(userId) ?? new Set();
                set.add(slug);
                store.favorites.set(userId, set);
                return true;
            },
            async remove (userId, _email, slug) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                if (!store.restaurants.has(slug)) return false;
                store.favorites.get(userId)?.delete(slug);
                return true;
            }
        },
        notifications: {
            async list (userId) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                return store.notices.map((notice)=>({
                        ...notice,
                        read: store.noticeRead.get(notice.id)?.has(userId) ?? false
                    })).sort((a, b)=>b.createdAt.localeCompare(a.createdAt));
            },
            async markRead (userId, _email, id) {
                const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
                if (!store.notices.some((notice)=>notice.id === id)) return false;
                const readers = store.noticeRead.get(id) ?? new Set();
                readers.add(userId);
                store.noticeRead.set(id, readers);
                return true;
            }
        }
    };
}
}),
"[project]/src/lib/data/memory/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStore",
    ()=>getStore,
    "menuKey",
    ()=>menuKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/seed.ts [app-route] (ecmascript)");
;
;
const menuKey = (slug, date)=>`${slug}|${date}`;
function createStore() {
    const now = new Date();
    const restaurants = new Map((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seedRestaurants"])(now).map((r)=>[
            r.slug,
            r
        ]));
    const menus = new Map((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seedMenus"])(now).map((m)=>[
            menuKey(m.restaurantSlug, m.date),
            m
        ]));
    // The prototype starts with one favourite for the demo account.
    const favorites = new Map([
        [
            `user_${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].devUserEmail}`,
            new Set([
                "bistro-mlyn"
            ])
        ]
    ]);
    return {
        restaurants,
        menus,
        favorites,
        noticeRead: new Map(),
        notices: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seedNotices"])(now)
    };
}
/** Kept on globalThis so `next dev` hot reloads do not wipe written data. */ const globalStore = globalThis;
function getStore() {
    globalStore.__menufyMemoryStore ??= createStore();
    return globalStore.__menufyMemoryStore;
}
}),
"[project]/src/lib/data/presentation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "selectRestaurants",
    ()=>selectRestaurants,
    "toRestaurantDTO",
    ()=>toRestaurantDTO
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/search.ts [app-route] (ecmascript)");
;
;
;
const byPosition = (a, b)=>a.position - b.position;
function toRestaurantDTO(record, menus, now = new Date(), includeDrafts = false) {
    const dates = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_SLOTS"].map((slot)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slotDate"])(slot, now));
    const byDate = new Map(menus.filter((menu)=>menu.date).map((menu)=>[
            menu.date,
            menu
        ]));
    const daily = dates.map((date)=>{
        const menu = byDate.get(date);
        if (!menu) return [];
        if (!includeDrafts && menu.status !== "published") return [];
        return [
            ...menu.items
        ].sort(byPosition);
    });
    const todayMenu = byDate.get(dates[0]);
    const publishedToday = todayMenu && todayMenu.status === "published" ? todayMenu : null;
    const avgPrice = daily[0].length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["round2"])(daily[0].reduce((sum, item)=>sum + item.price, 0) / daily[0].length) : null;
    const { status, ...profile } = record;
    return {
        ...profile,
        status,
        todayHours: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hoursForToday"])(record.hours, now),
        daily,
        hasMenuToday: Boolean(publishedToday && daily[0].length > 0),
        menuUpdatedAt: publishedToday?.updatedAt ?? null,
        avgPrice
    };
}
function selectRestaurants(sources, filter) {
    const query = (filter.q ?? "").trim();
    const scored = [];
    for (const source of sources){
        if (filter.city && source.city !== filter.city) continue;
        if (filter.district && source.district !== filter.district) continue;
        if (filter.cuisines?.length && !source.cuisines.some((c)=>filter.cuisines.includes(c))) continue;
        if (filter.delivery && !source.delivery.available) continue;
        if (filter.minRating && source.rating < filter.minRating) continue;
        const items = source.daily[filter.day] ?? [];
        if (!items.length) continue;
        const eligible = items.filter((item)=>(filter.maxPrice == null || item.price <= filter.maxPrice) && !item.allergens.some((allergen)=>(filter.excluded ?? []).includes(allergen)));
        if (!eligible.length) continue;
        let score = 1;
        if (query) {
            score = Math.max((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchScore"])(query, source.name), ...eligible.map((item)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchScore"])(query, item.name)));
            if (score < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MATCH_THRESHOLD"]) continue;
        }
        scored.push({
            dto: {
                ...source,
                distanceKm: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["round1"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["distanceKm"])(filter.origin, {
                    lat: source.lat,
                    lng: source.lng
                }))
            },
            score
        });
    }
    scored.sort((a, b)=>{
        if (filter.sort === "distance") {
            return (a.dto.distanceKm ?? Infinity) - (b.dto.distanceKm ?? Infinity);
        }
        if (filter.sort === "price") {
            return (a.dto.avgPrice ?? Infinity) - (b.dto.avgPrice ?? Infinity);
        }
        return b.dto.rating - a.dto.rating || b.dto.ratingCount - a.dto.ratingCount || b.score - a.score || a.dto.name.localeCompare(b.dto.name, "sk");
    });
    return {
        total: scored.length,
        items: scored.slice(filter.offset, filter.offset + filter.limit).map((entry)=>entry.dto)
    };
}
}),
"[project]/src/lib/data/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "seedMenus",
    ()=>seedMenus,
    "seedNotices",
    ()=>seedNotices,
    "seedRestaurants",
    ()=>seedRestaurants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$restaurants$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/seed/restaurants.json.[json].cjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$menus$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/seed/menus.json.[json].cjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$notifications$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/seed/notifications.json.[json].cjs [app-route] (ecmascript)");
;
;
;
;
function seedRestaurants(now = new Date()) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$restaurants$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].map((restaurant)=>({
            ...restaurant,
            hours: restaurant.hours,
            status: restaurant.status,
            standard: restaurant.standard.map((item, index)=>({
                    ...item,
                    position: index
                })),
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString()
        }));
}
function seedMenus(now = new Date()) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$menus$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].map((menu)=>{
        const date = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slotDate"])(menu.dayIndex, now);
        const publishedAt = new Date(`${date}T${menu.publishedAtTime}:00`).toISOString();
        return {
            id: `m_${menu.restaurantSlug}_${date}`,
            restaurantSlug: menu.restaurantSlug,
            date,
            status: menu.status,
            note: null,
            publishedAt,
            updatedAt: publishedAt,
            items: menu.items.map((item, index)=>({
                    ...item,
                    position: index
                }))
        };
    });
}
function seedNotices(now = new Date()) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$seed$2f$notifications$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].map((notice)=>({
            id: notice.id,
            kind: notice.kind,
            title: notice.title,
            body: notice.body,
            time: notice.time,
            slug: notice.slug,
            createdAt: new Date(now.getTime() - notice.hoursAgo * 60 * 60 * 1000).toISOString(),
            read: false
        }));
}
}),
"[project]/src/lib/data/supabase/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$118$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.118.0/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
;
;
let client = null;
function supabaseAdmin() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].supabaseUrl || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].supabaseServiceRoleKey) {
        throw new Error("Supabase nie je nakonfigurovaný. Nastavte SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY v .env.local.");
    }
    client ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$118$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].supabaseUrl, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        },
        global: {
            headers: {
                "X-Client-Info": "menufy-api"
            }
        }
    });
    return client;
}
}),
"[project]/src/lib/data/supabase/repositories.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSupabaseRepositories",
    ()=>createSupabaseRepositories
]);
/**
 * Supabase implementations of the repositories.
 *
 * ⚠️  Reference implementation: it targets the schema in
 *     `supabase/migrations/0001_init.sql` but has not been exercised against a
 *     live project yet (the app runs on the memory backend by default).
 *     Before switching `MENUFY_DATA_SOURCE=supabase`, create the schema and
 *     smoke-test the endpoints listed in `server/README.md`.
 *
 * Business rules (filtering, typo-tolerant search, DTO composition) are shared
 * with the memory backend through `../presentation.ts`; this file only maps
 * PostgREST rows and writes.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/slug.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/presentation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabase/client.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const MENU_ITEM_FIELDS = "id, name, description, weight, price_cents, allergens, tag, position";
const MENU_SELECT = `id, kind, date, status, note, published_at, updated_at, menu_items(${MENU_ITEM_FIELDS})`;
const RESTAURANT_SELECT = `
  id, slug, name, initials, tagline, city, district, address, phone, email, web, ico,
  rating, rating_count, lat, lng, delivery_available, delivery_eta, hours, image, gallery,
  status, created_at,
  restaurant_type_links(type:restaurant_types(name)),
  restaurant_reviews(author, stars, reviewed_on, body),
  menus(${MENU_SELECT})
`;
/* --------------------------------------------------------------- mapping --- */ const num = (value, fallback = 0)=>{
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const initialsOf = (name)=>name.split(/\s+/).slice(0, 2).map((word)=>word[0] ?? "").join("").toUpperCase();
function itemsFromRows(rows) {
    return [
        ...rows ?? []
    ].sort((a, b)=>num(a.position) - num(b.position)).map((row, index)=>({
            id: row.id,
            name: row.name,
            desc: row.description ?? "",
            weight: row.weight ?? "",
            allergens: (row.allergens ?? []).map((value)=>num(value)).filter((value)=>value >= 1 && value <= 14),
            price: Math.round(num(row.price_cents)) / 100,
            tag: row.tag ?? "",
            position: index
        }));
}
function menuFromRow(row, restaurantSlug) {
    return {
        id: row.id,
        restaurantSlug,
        date: row.date ?? "",
        status: row.status === "published" ? "published" : "draft",
        note: row.note,
        publishedAt: row.published_at,
        updatedAt: row.updated_at ?? row.published_at ?? new Date().toISOString(),
        items: itemsFromRows(row.menu_items)
    };
}
function restaurantFromRow(row) {
    const dailyMenus = (row.menus ?? []).filter((menu)=>menu.kind === "daily");
    const standardMenu = (row.menus ?? []).find((menu)=>menu.kind === "standard");
    const record = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        initials: row.initials || initialsOf(row.name),
        tagline: row.tagline ?? "",
        cuisines: (row.restaurant_type_links ?? []).map((link)=>link.type?.name).filter((name)=>Boolean(name)),
        city: row.city,
        district: row.district ?? "",
        address: row.address ?? "",
        phone: row.phone ?? "",
        email: row.email ?? "",
        web: row.web ?? "",
        ico: row.ico ?? undefined,
        rating: num(row.rating),
        ratingCount: num(row.rating_count),
        lat: num(row.lat, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lat),
        lng: num(row.lng, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lng),
        delivery: {
            available: Boolean(row.delivery_available),
            eta: row.delivery_eta ?? ""
        },
        hours: row.hours ?? [],
        image: row.image ?? "",
        gallery: row.gallery ?? [],
        standard: itemsFromRows(standardMenu?.menu_items ?? null),
        reviews: (row.restaurant_reviews ?? []).map((review)=>({
                author: review.author,
                stars: num(review.stars),
                date: review.reviewed_on ?? "",
                text: review.body ?? ""
            })),
        status: row.status,
        createdAt: row.created_at
    };
    return {
        record,
        menus: dailyMenus.map((menu)=>menuFromRow(menu, row.slug))
    };
}
/* --------------------------------------------------------------- helpers --- */ async function profileIdFor(email) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
    if (error) {
        console.warn(`[menufy] profiles lookup failed: ${error.message}`);
        return null;
    }
    return data?.id ?? null;
}
async function restaurantRow(slug) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select(RESTAURANT_SELECT).eq("slug", slug).maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ?? null;
}
async function restaurantIdForSlug(slug) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select("id").eq("slug", slug).maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data?.id ?? null;
}
async function fetchDTO(slug, includeDrafts = false) {
    const row = await restaurantRow(slug);
    if (!row) return null;
    const { record, menus } = restaurantFromRow(row);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menus, new Date(), includeDrafts);
}
async function getMenu(restaurantSlug, date) {
    const restaurantId = await restaurantIdForSlug(restaurantSlug);
    if (!restaurantId) return null;
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("menus").select(MENU_SELECT).eq("restaurant_id", restaurantId).eq("kind", "daily").eq("date", date).maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? menuFromRow(data, restaurantSlug) : null;
}
function createSupabaseRepositories() {
    return {
        restaurants: {
            async list (filter) {
                const allowed = filter.statuses ?? [
                    "active"
                ];
                let query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select(RESTAURANT_SELECT).in("status", allowed);
                if (filter.city) query = query.eq("city", filter.city);
                if (filter.district) query = query.eq("district", filter.district);
                if (filter.delivery) query = query.eq("delivery_available", true);
                if (filter.minRating) query = query.gte("rating", filter.minRating);
                const { data, error } = await query;
                if (error) throw new Error(`Supabase: ${error.message}`);
                const now = new Date();
                const dtos = (data ?? []).map((row)=>{
                    const { record, menus } = restaurantFromRow(row);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menus, now);
                });
                // Menu-level filters and fuzzy search run in shared code; at this scale
                // (hundreds of restaurants) that is cheaper than several round trips.
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectRestaurants"])(dtos, filter);
            },
            async bySlug (slug) {
                return fetchDTO(slug);
            },
            async listByStatus (status) {
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select(RESTAURANT_SELECT).eq("status", status).order("name");
                if (error) throw new Error(`Supabase: ${error.message}`);
                const now = new Date();
                return (data ?? []).map((row)=>{
                    const { record, menus } = restaurantFromRow(row);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$presentation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRestaurantDTO"])(record, menus, now, true);
                });
            },
            async create (input) {
                const slug = input.slug?.trim() ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugify"])(input.slug) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugify"])(input.name);
                if (!slug) return null;
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").insert({
                    slug,
                    name: input.name,
                    initials: initialsOf(input.name),
                    tagline: input.tagline,
                    city: input.city,
                    district: input.district,
                    address: input.address,
                    phone: input.phone,
                    email: input.email,
                    web: input.web,
                    ico: input.ico,
                    lat: input.lat ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lat,
                    lng: input.lng ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CITY_CENTER"].lng,
                    hours: input.hours ?? [],
                    status: "pending"
                }).select("id").single();
                if (error) {
                    if (error.code === "23505") return null; // slug already exists
                    throw new Error(`Supabase: ${error.message}`);
                }
                const restaurantId = data.id;
                if (input.cuisines.length) {
                    const { data: types } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurant_types").select("id").in("name", input.cuisines);
                    const links = (types ?? []).map((type)=>({
                            restaurant_id: restaurantId,
                            type_id: type.id
                        }));
                    if (links.length) {
                        const { error: linkError } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurant_type_links").insert(links);
                        if (linkError) console.warn(`[menufy] type links not saved: ${linkError.message}`);
                    }
                }
                // If the contact already has an account, make them the restaurant owner.
                const profileId = await profileIdFor(input.contactEmail);
                if (profileId) {
                    const { error: ownerError } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurant_users").insert({
                        user_id: profileId,
                        restaurant_id: restaurantId,
                        role: "owner"
                    });
                    if (ownerError) console.warn(`[menufy] owner link not saved: ${ownerError.message}`);
                }
                return fetchDTO(slug, true);
            },
            async updateStatus (slug, status) {
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").update({
                    status
                }).eq("slug", slug).select("id").maybeSingle();
                if (error) throw new Error(`Supabase: ${error.message}`);
                if (!data) return null;
                return fetchDTO(slug, true);
            },
            async catalog () {
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select("city, district, restaurant_type_links(type:restaurant_types(name))").eq("status", "active");
                if (error) throw new Error(`Supabase: ${error.message}`);
                const rows = data ?? [];
                const cuisines = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_CUISINES"]);
                const cities = new Map();
                for (const row of rows){
                    for (const link of row.restaurant_type_links ?? []){
                        if (link.type?.name) cuisines.add(link.type.name);
                    }
                    if (!cities.has(row.city)) cities.set(row.city, new Set());
                    if (row.district) cities.get(row.city).add(row.district);
                }
                return {
                    cuisines: [
                        ...cuisines
                    ].sort((a, b)=>a.localeCompare(b, "sk")),
                    cities: [
                        ...cities.entries()
                    ].map(([name, districts])=>({
                            name,
                            districts: [
                                ...districts
                            ].sort((a, b)=>a.localeCompare(b, "sk"))
                        })).sort((a, b)=>a.name.localeCompare(b.name, "sk")),
                    allergens: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALLERGENS"],
                    days: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DAY_SLOTS"].map((slot)=>({
                            slot,
                            date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slotDate"])(slot)
                        }))
                };
            }
        },
        menus: {
            async get (restaurantSlug, date) {
                return getMenu(restaurantSlug, date);
            },
            async listRange (restaurantSlug, from, to) {
                const restaurantId = await restaurantIdForSlug(restaurantSlug);
                if (!restaurantId) return [];
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("menus").select(MENU_SELECT).eq("restaurant_id", restaurantId).eq("kind", "daily").gte("date", from).lte("date", to).order("date");
                if (error) throw new Error(`Supabase: ${error.message}`);
                return (data ?? []).map((row)=>menuFromRow(row, restaurantSlug));
            },
            async upsert (input) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])();
                const restaurantId = await restaurantIdForSlug(input.restaurantSlug);
                if (!restaurantId) throw new Error(`Reštaurácia ${input.restaurantSlug} neexistuje.`);
                const { data: existing, error: findError } = await supabase.from("menus").select("id, published_at").eq("restaurant_id", restaurantId).eq("kind", "daily").eq("date", input.date).maybeSingle();
                if (findError) throw new Error(`Supabase: ${findError.message}`);
                const current = existing;
                const now = new Date().toISOString();
                const publishedAt = input.status === "published" ? current?.published_at ?? now : current?.published_at ?? null;
                const payload = {
                    status: input.status,
                    note: input.note ?? null,
                    published_at: publishedAt,
                    updated_at: now
                };
                let menuId = current?.id;
                if (menuId) {
                    const { error } = await supabase.from("menus").update(payload).eq("id", menuId);
                    if (error) throw new Error(`Supabase: ${error.message}`);
                    const { error: clearError } = await supabase.from("menu_items").delete().eq("menu_id", menuId);
                    if (clearError) throw new Error(`Supabase: ${clearError.message}`);
                } else {
                    const { data, error } = await supabase.from("menus").insert({
                        ...payload,
                        restaurant_id: restaurantId,
                        kind: "daily",
                        date: input.date
                    }).select("id").single();
                    if (error) throw new Error(`Supabase: ${error.message}`);
                    menuId = data.id;
                }
                await insertItems(menuId, input.items);
                const menu = await getMenu(input.restaurantSlug, input.date);
                if (!menu) throw new Error("Menu sa nepodarilo načítať po uložení.");
                return menu;
            },
            async update (id, patch) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])();
                const { data: row, error: findError } = await supabase.from("menus").select("id, restaurant:restaurants(slug)").eq("id", id).maybeSingle();
                if (findError) throw new Error(`Supabase: ${findError.message}`);
                if (!row) return null;
                const slug = row.restaurant?.slug ?? "";
                const now = new Date().toISOString();
                const payload = {
                    updated_at: now
                };
                if (patch.status !== undefined) {
                    payload.status = patch.status;
                    if (patch.status === "published") payload.published_at = now;
                }
                if (patch.note !== undefined) payload.note = patch.note;
                const { error } = await supabase.from("menus").update(payload).eq("id", id);
                if (error) throw new Error(`Supabase: ${error.message}`);
                if (patch.items !== undefined) {
                    const { error: clearError } = await supabase.from("menu_items").delete().eq("menu_id", id);
                    if (clearError) throw new Error(`Supabase: ${clearError.message}`);
                    await insertItems(id, patch.items);
                }
                const { data, error: fetchError } = await supabase.from("menus").select(MENU_SELECT).eq("id", id).maybeSingle();
                if (fetchError) throw new Error(`Supabase: ${fetchError.message}`);
                return data ? menuFromRow(data, slug) : null;
            }
        },
        favorites: {
            async list (_userId, email) {
                const profileId = await profileIdFor(email);
                if (!profileId) return [];
                const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("favorites").select("restaurant:restaurants(slug)").eq("user_id", profileId);
                if (error) throw new Error(`Supabase: ${error.message}`);
                return (data ?? []).map((row)=>row.restaurant?.slug).filter((slug)=>Boolean(slug)).sort((a, b)=>a.localeCompare(b));
            },
            async add (_userId, email, slug) {
                const profileId = await profileIdFor(email);
                if (!profileId) return false;
                const { data: restaurant } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("restaurants").select("id").eq("slug", slug).eq("status", "active").maybeSingle();
                const restaurantId = restaurant?.id;
                if (!restaurantId) return false;
                const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("favorites").upsert({
                    user_id: profileId,
                    restaurant_id: restaurantId
                }, {
                    onConflict: "user_id,restaurant_id"
                });
                if (error) throw new Error(`Supabase: ${error.message}`);
                return true;
            },
            async remove (_userId, email, slug) {
                const profileId = await profileIdFor(email);
                if (!profileId) return false;
                const restaurantId = await restaurantIdForSlug(slug);
                if (!restaurantId) return false;
                const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("favorites").delete().eq("user_id", profileId).eq("restaurant_id", restaurantId);
                if (error) throw new Error(`Supabase: ${error.message}`);
                return true;
            }
        },
        notifications: {
            async list (_userId, email) {
                const profileId = await profileIdFor(email);
                let query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("notifications").select("id, kind, title, body, time_label, restaurant_slug, created_at").order("created_at", {
                    ascending: false
                });
                query = profileId ? query.or(`user_id.is.null,user_id.eq.${profileId}`) : query.is("user_id", null);
                const { data, error } = await query;
                if (error) throw new Error(`Supabase: ${error.message}`);
                const readIds = new Set();
                if (profileId) {
                    const { data: reads } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("notification_reads").select("notification_id").eq("user_id", profileId);
                    for (const row of reads ?? [])readIds.add(row.notification_id);
                }
                return (data ?? []).map((row)=>({
                        id: row.id,
                        kind: row.kind === "menu" || row.kind === "offer" ? row.kind : "system",
                        title: row.title,
                        body: row.body,
                        time: row.time_label,
                        slug: row.restaurant_slug,
                        createdAt: row.created_at,
                        read: readIds.has(row.id)
                    }));
            },
            async markRead (_userId, email, id) {
                const profileId = await profileIdFor(email);
                if (!profileId) return false;
                const { data } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("notifications").select("id").eq("id", id).maybeSingle();
                if (!data) return false;
                const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("notification_reads").upsert({
                    notification_id: id,
                    user_id: profileId
                }, {
                    onConflict: "notification_id,user_id"
                });
                if (error) throw new Error(`Supabase: ${error.message}`);
                return true;
            }
        }
    };
}
async function insertItems(menuId, items) {
    if (!items.length) return;
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"])().from("menu_items").insert(items.map((item, index)=>({
            menu_id: menuId,
            name: item.name,
            description: item.desc,
            weight: item.weight,
            price_cents: Math.round(item.price * 100),
            allergens: item.allergens,
            tag: item.tag,
            position: index
        })));
    if (error) throw new Error(`Supabase: ${error.message}`);
}
}),
"[project]/src/lib/dates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Calendar helpers.
 *
 * The prototype UI works with four day slots (0 = today, 1 = tomorrow,
 * 2 = next Monday, 3 = next Tuesday). The database stores real dates, so both
 * worlds are bridged here instead of scattering `new Date()` logic around.
 */ __turbopack_context__.s([
    "DAY_SLOTS",
    ()=>DAY_SLOTS,
    "addDays",
    ()=>addDays,
    "dateKey",
    ()=>dateKey,
    "hoursForToday",
    ()=>hoursForToday,
    "isDateKey",
    ()=>isDateKey,
    "slotDate",
    ()=>slotDate,
    "slotDates",
    ()=>slotDates,
    "slotForDate",
    ()=>slotForDate,
    "weekdayIndex",
    ()=>weekdayIndex
]);
const DAY_SLOTS = [
    0,
    1,
    2,
    3
];
const TIME_ZONE = "Europe/Bratislava";
function dateKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}
function parseKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function addDays(key, days) {
    const date = parseKey(key);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}
function weekdayIndex(key) {
    return (parseKey(key).getUTCDay() + 6) % 7;
}
function isDateKey(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseKey(value).getTime());
}
function slotDate(slot, now = new Date()) {
    const today = dateKey(now);
    if (slot === 0) return today;
    if (slot === 1) return addDays(today, 1);
    const target = slot === 2 ? 0 : 1;
    let offset = (target - weekdayIndex(today) + 7) % 7;
    if (offset === 0) offset = 7;
    return addDays(today, offset);
}
function slotDates(now = new Date()) {
    return {
        0: slotDate(0, now),
        1: slotDate(1, now),
        2: slotDate(2, now),
        3: slotDate(3, now)
    };
}
function slotForDate(date, now = new Date()) {
    for (const slot of DAY_SLOTS){
        if (slotDate(slot, now) === date) return slot;
    }
    return null;
}
function hoursForToday(hours, now = new Date()) {
    const index = weekdayIndex(dateKey(now));
    return hours[index]?.[1] ?? "Zatvorené";
}
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
"[project]/src/lib/geo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CITY_CENTER",
    ()=>CITY_CENTER,
    "distanceKm",
    ()=>distanceKm,
    "round1",
    ()=>round1,
    "round2",
    ()=>round2
]);
const CITY_CENTER = {
    lat: 48.1486,
    lng: 17.1077
};
function distanceKm(a, b) {
    const R = 6371;
    const rad = (degrees)=>degrees * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}
const round1 = (n)=>Math.round(n * 10) / 10;
const round2 = (n)=>Math.round(n * 100) / 100;
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
"[project]/src/lib/search.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Diacritics-insensitive matching with typo tolerance (spec FR-02).
 * A request for "kolkovna" finds "Kolkovňa"; "pizz" finds "Pizza Napoli".
 */ __turbopack_context__.s([
    "MATCH_THRESHOLD",
    ()=>MATCH_THRESHOLD,
    "matchScore",
    ()=>matchScore,
    "matches",
    ()=>matches,
    "normalizeText",
    ()=>normalizeText,
    "similarity",
    ()=>similarity
]);
function normalizeText(input) {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ß/g, "ss").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function bigrams(value) {
    const out = new Set();
    for(let i = 0; i < value.length - 1; i += 1)out.add(value.slice(i, i + 2));
    return out;
}
function similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const left = bigrams(a);
    const right = bigrams(b);
    if (!left.size || !right.size) return 0;
    let shared = 0;
    for (const gram of left)if (right.has(gram)) shared += 1;
    return 2 * shared / (left.size + right.size);
}
function matchScore(query, target) {
    const q = normalizeText(query);
    const t = normalizeText(target);
    if (!q || !t) return 0;
    if (t === q) return 1;
    if (t.startsWith(q)) return 0.95;
    if (t.includes(q)) return 0.9;
    let best = similarity(q, t);
    for (const word of t.split(" ")){
        if (word.startsWith(q)) best = Math.max(best, 0.8);
        else best = Math.max(best, similarity(q, word));
    }
    return best;
}
const MATCH_THRESHOLD = 0.55;
function matches(query, target) {
    if (!query.trim()) return true;
    return matchScore(query, target) >= MATCH_THRESHOLD;
}
}),
"[project]/src/lib/slug.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** URL-safe slug without diacritics ("Zelená lyžica" -> "zelena-lyzica"). */ __turbopack_context__.s([
    "slugify",
    ()=>slugify
]);
function slugify(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
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
"[project]/src/lib/data/seed/menus.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = [
    {
        "id": "m_bistro-mlyn_0",
        "restaurantSlug": "bistro-mlyn",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "09:12",
        "items": [
            {
                "id": "mi_bistro-mlyn_0_0",
                "name": "Tekvicový krém, pražené semienka",
                "desc": "Hokkaido tekvica, smotana, tekvicový olej",
                "weight": "0,33 l",
                "allergens": [
                    7,
                    8
                ],
                "price": 3.2,
                "tag": "Polievka"
            },
            {
                "id": "mi_bistro-mlyn_0_1",
                "name": "Kuracie supreme, zemiakové pyré, hrášok",
                "desc": "Kuracie prsia s kožou, maslové pyré, hrášok",
                "weight": "150 / 200 g",
                "allergens": [
                    7
                ],
                "price": 9.9,
                "tag": "Menu 1"
            },
            {
                "id": "mi_bistro-mlyn_0_2",
                "name": "Hubové rizoto s parmezánom",
                "desc": "Šampiňóny, hliva, parmezán 24 mes.",
                "weight": "350 g",
                "allergens": [
                    7,
                    9
                ],
                "price": 8.9,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_bistro-mlyn_1",
        "restaurantSlug": "bistro-mlyn",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "09:12",
        "items": [
            {
                "id": "mi_bistro-mlyn_1_0",
                "name": "Hrachová polievka s údeným",
                "desc": "Žltý hrach, údené mäso, majorán",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    9
                ],
                "price": 2.9,
                "tag": "Polievka"
            },
            {
                "id": "mi_bistro-mlyn_1_1",
                "name": "Bravčová pečienka, knedľa, kapusta",
                "desc": "Pečená krkovička, domáca knedľa",
                "weight": "150 / 200 g",
                "allergens": [
                    1,
                    3
                ],
                "price": 9.5,
                "tag": "Menu 1"
            },
            {
                "id": "mi_bistro-mlyn_1_2",
                "name": "Gnocchi so šalviou a tekvicou",
                "desc": "Zemiakové gnocchi, maslo, šalvia",
                "weight": "330 g",
                "allergens": [
                    1,
                    3,
                    7
                ],
                "price": 8.7,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_oliva-kitchen_0",
        "restaurantSlug": "oliva-kitchen",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "08:40",
        "items": [
            {
                "id": "mi_oliva-kitchen_0_0",
                "name": "Paradajková polievka s bazalkou",
                "desc": "Pečené paradajky, bazalka, olivový olej",
                "weight": "0,33 l",
                "allergens": [
                    7
                ],
                "price": 2.9,
                "tag": "Polievka"
            },
            {
                "id": "mi_oliva-kitchen_0_1",
                "name": "Grilovaný losos, kuskus, jogurtový dip",
                "desc": "Filet z lososa, citrón, mäta",
                "weight": "150 / 180 g",
                "allergens": [
                    4,
                    7
                ],
                "price": 11.9,
                "tag": "Menu 1"
            },
            {
                "id": "mi_oliva-kitchen_0_2",
                "name": "Cícerový šalát s fetou a olivami",
                "desc": "Cícer, feta, uhorka, červená cibuľa",
                "weight": "380 g",
                "allergens": [
                    7
                ],
                "price": 8.5,
                "tag": "Fit"
            }
        ]
    },
    {
        "id": "m_oliva-kitchen_1",
        "restaurantSlug": "oliva-kitchen",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "08:40",
        "items": [
            {
                "id": "mi_oliva-kitchen_1_0",
                "name": "Minestrone",
                "desc": "Sezónna zelenina, fazuľa, parmezán",
                "weight": "0,33 l",
                "allergens": [
                    7,
                    9
                ],
                "price": 2.9,
                "tag": "Polievka"
            },
            {
                "id": "mi_oliva-kitchen_1_1",
                "name": "Penne arrabbiata s kuracím",
                "desc": "Pikantná paradajková omáčka",
                "weight": "350 g",
                "allergens": [
                    1
                ],
                "price": 9.2,
                "tag": "Menu 1"
            },
            {
                "id": "mi_oliva-kitchen_1_2",
                "name": "Falafel tanier s hummusom",
                "desc": "Falafel, hummus, tahini, pita",
                "weight": "360 g",
                "allergens": [
                    1,
                    11
                ],
                "price": 8.8,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_pri-jednom-stole_0",
        "restaurantSlug": "pri-jednom-stole",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "08:05",
        "items": [
            {
                "id": "mi_pri-jednom-stole_0_0",
                "name": "Slepačí vývar s domácimi rezancami",
                "desc": "Vývar z domácej slepice, mrkva",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    3,
                    9
                ],
                "price": 3.1,
                "tag": "Polievka"
            },
            {
                "id": "mi_pri-jednom-stole_0_1",
                "name": "Hovädzie líčka, tarhoňa, koreňová zelenina",
                "desc": "Pomaly dusené 6 hodín",
                "weight": "150 / 200 g",
                "allergens": [
                    1,
                    9
                ],
                "price": 12.5,
                "tag": "Menu 1"
            },
            {
                "id": "mi_pri-jednom-stole_0_2",
                "name": "Pečená cvikla, kozí syr, vlašské orechy",
                "desc": "Teplý šalát s medovou vinaigrette",
                "weight": "320 g",
                "allergens": [
                    7,
                    8
                ],
                "price": 8.9,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_pri-jednom-stole_1",
        "restaurantSlug": "pri-jednom-stole",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "08:05",
        "items": [
            {
                "id": "mi_pri-jednom-stole_1_0",
                "name": "Kapustnica",
                "desc": "Tradičná sviatočná kapustnica",
                "weight": "0,33 l",
                "allergens": [
                    1
                ],
                "price": 3,
                "tag": "Polievka"
            },
            {
                "id": "mi_pri-jednom-stole_1_1",
                "name": "Hovädzia sviečková na smotane, knedľa",
                "desc": "Sviečková, brusnice, šľahačka",
                "weight": "120 / 200 g",
                "allergens": [
                    1,
                    3,
                    7,
                    9,
                    10
                ],
                "price": 11.9,
                "tag": "Menu 1"
            },
            {
                "id": "mi_pri-jednom-stole_1_2",
                "name": "Bryndzové halušky",
                "desc": "Bryndza, slanina, jarná cibuľka",
                "weight": "350 g",
                "allergens": [
                    1,
                    3,
                    7
                ],
                "price": 8.2,
                "tag": "Menu 2"
            }
        ]
    },
    {
        "id": "m_wok-bar-nivy_0",
        "restaurantSlug": "wok-bar-nivy",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "09:05",
        "items": [
            {
                "id": "mi_wok-bar-nivy_0_0",
                "name": "Miso polievka s tofu",
                "desc": "Miso pasta, tofu, wakame",
                "weight": "0,3 l",
                "allergens": [
                    6
                ],
                "price": 3.2,
                "tag": "Polievka"
            },
            {
                "id": "mi_wok-bar-nivy_0_1",
                "name": "Kuracie pad thai",
                "desc": "Ryžové rezance, arašidy, limetka",
                "weight": "380 g",
                "allergens": [
                    3,
                    5,
                    6,
                    14
                ],
                "price": 9.4,
                "tag": "Menu 1"
            },
            {
                "id": "mi_wok-bar-nivy_0_2",
                "name": "Zeleninový wok so sójou",
                "desc": "Brokolica, paprika, sójové mäso",
                "weight": "350 g",
                "allergens": [
                    6,
                    11
                ],
                "price": 8.4,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_wok-bar-nivy_1",
        "restaurantSlug": "wok-bar-nivy",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "09:05",
        "items": [
            {
                "id": "mi_wok-bar-nivy_1_0",
                "name": "Kokosová polievka",
                "desc": "Kokosové mlieko, citrónová tráva",
                "weight": "0,3 l",
                "allergens": [],
                "price": 3.2,
                "tag": "Polievka"
            },
            {
                "id": "mi_wok-bar-nivy_1_1",
                "name": "Teriyaki losos s ryžou",
                "desc": "Losos, teriyaki, sezam",
                "weight": "150 / 200 g",
                "allergens": [
                    4,
                    6,
                    11
                ],
                "price": 11.2,
                "tag": "Menu 1"
            },
            {
                "id": "mi_wok-bar-nivy_1_2",
                "name": "Tofu curry",
                "desc": "Červené curry, tofu, jazmínová ryža",
                "weight": "380 g",
                "allergens": [
                    6
                ],
                "price": 8.6,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_burger-garage_0",
        "restaurantSlug": "burger-garage",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "09:20",
        "items": [
            {
                "id": "mi_burger-garage_0_0",
                "name": "Cibuľová polievka",
                "desc": "Gratinovaná so syrom",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    7
                ],
                "price": 3,
                "tag": "Polievka"
            },
            {
                "id": "mi_burger-garage_0_1",
                "name": "Classic burger + hranolky",
                "desc": "Hovädzie, cheddar, kyslá uhorka",
                "weight": "180 / 150 g",
                "allergens": [
                    1,
                    3,
                    7,
                    10
                ],
                "price": 9.9,
                "tag": "Menu 1"
            },
            {
                "id": "mi_burger-garage_0_2",
                "name": "Falafel burger",
                "desc": "Falafel, hummus, rukola",
                "weight": "330 g",
                "allergens": [
                    1,
                    11
                ],
                "price": 8.9,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_burger-garage_1",
        "restaurantSlug": "burger-garage",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "09:20",
        "items": [
            {
                "id": "mi_burger-garage_1_0",
                "name": "Kuracia polievka",
                "desc": "S rezancami",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    3,
                    9
                ],
                "price": 2.8,
                "tag": "Polievka"
            },
            {
                "id": "mi_burger-garage_1_1",
                "name": "BBQ chicken burger",
                "desc": "Kuracie stehno, BBQ, coleslaw",
                "weight": "300 g",
                "allergens": [
                    1,
                    3,
                    10
                ],
                "price": 9.7,
                "tag": "Menu 1"
            },
            {
                "id": "mi_burger-garage_1_2",
                "name": "Batátové hranolky s dipom",
                "desc": "Aioli dip, sea salt",
                "weight": "250 g",
                "allergens": [
                    3
                ],
                "price": 6.2,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_zelena-lyzica_0",
        "restaurantSlug": "zelena-lyzica",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "08:55",
        "items": [
            {
                "id": "mi_zelena-lyzica_0_0",
                "name": "Šošovicová polievka s kokosom",
                "desc": "Červená šošovica, kokos, kurkuma",
                "weight": "0,33 l",
                "allergens": [
                    9
                ],
                "price": 2.9,
                "tag": "Polievka"
            },
            {
                "id": "mi_zelena-lyzica_0_1",
                "name": "Quinoa bowl s pečenou zeleninou",
                "desc": "Quinoa, batáty, avokádo",
                "weight": "380 g",
                "allergens": [
                    6,
                    11
                ],
                "price": 8.9,
                "tag": "Vegán"
            },
            {
                "id": "mi_zelena-lyzica_0_2",
                "name": "Cuketové placky, cesnaková plnka",
                "desc": "Z cukety a ryžovej múky",
                "weight": "320 g",
                "allergens": [
                    3
                ],
                "price": 8.2,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_zelena-lyzica_1",
        "restaurantSlug": "zelena-lyzica",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "08:55",
        "items": [
            {
                "id": "mi_zelena-lyzica_1_0",
                "name": "Krémová brokolicová",
                "desc": "Bez smotany, s mandľami",
                "weight": "0,33 l",
                "allergens": [
                    8
                ],
                "price": 2.9,
                "tag": "Polievka"
            },
            {
                "id": "mi_zelena-lyzica_1_1",
                "name": "Pestrý tempeh s ryžou",
                "desc": "Tempeh, teriyaki, zelenina",
                "weight": "350 g",
                "allergens": [
                    6,
                    11
                ],
                "price": 9.1,
                "tag": "Vegán"
            },
            {
                "id": "mi_zelena-lyzica_1_2",
                "name": "Cícerové curry",
                "desc": "Kokosové mlieko, špenát",
                "weight": "380 g",
                "allergens": [],
                "price": 8.6,
                "tag": "Vegán"
            }
        ]
    },
    {
        "id": "m_trattoria-ponte_0",
        "restaurantSlug": "trattoria-ponte",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "09:30",
        "items": [
            {
                "id": "mi_trattoria-ponte_0_0",
                "name": "Ribollita",
                "desc": "Toskánska zeleninová polievka",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    9
                ],
                "price": 3.4,
                "tag": "Polievka"
            },
            {
                "id": "mi_trattoria-ponte_0_1",
                "name": "Spaghetti carbonara",
                "desc": "Guanciale, pecorino, žĺtok",
                "weight": "350 g",
                "allergens": [
                    1,
                    3,
                    7
                ],
                "price": 10.5,
                "tag": "Menu 1"
            },
            {
                "id": "mi_trattoria-ponte_0_2",
                "name": "Pizza funghi",
                "desc": "Hlivy, šampiňóny, mozzarella",
                "weight": "430 g",
                "allergens": [
                    1,
                    7
                ],
                "price": 9.4,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_trattoria-ponte_1",
        "restaurantSlug": "trattoria-ponte",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "09:30",
        "items": [
            {
                "id": "mi_trattoria-ponte_1_0",
                "name": "Krémová zo sladkej kukurice",
                "desc": "S pancettou",
                "weight": "0,33 l",
                "allergens": [
                    7
                ],
                "price": 3.2,
                "tag": "Polievka"
            },
            {
                "id": "mi_trattoria-ponte_1_1",
                "name": "Lasagne bolognese",
                "desc": "Domáce lasagne",
                "weight": "380 g",
                "allergens": [
                    1,
                    3,
                    7,
                    9
                ],
                "price": 10.2,
                "tag": "Menu 1"
            },
            {
                "id": "mi_trattoria-ponte_1_2",
                "name": "Caprese s focaccio",
                "desc": "Paradajky, mozzarella, bazalka",
                "weight": "300 g",
                "allergens": [
                    1,
                    7
                ],
                "price": 8.9,
                "tag": "Vege"
            }
        ]
    },
    {
        "id": "m_koliba-hrebenky_0",
        "restaurantSlug": "koliba-hrebenky",
        "dayIndex": 0,
        "status": "published",
        "publishedAtTime": "08:45",
        "items": [
            {
                "id": "mi_koliba-hrebenky_0_0",
                "name": "Fazuľová na kyslo",
                "desc": "S údeným mäsom a klobásou",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    9
                ],
                "price": 3,
                "tag": "Polievka"
            },
            {
                "id": "mi_koliba-hrebenky_0_1",
                "name": "Kapustové pirohy s bryndzou",
                "desc": "Pirohy, slanina, kyslá smotana",
                "weight": "350 g",
                "allergens": [
                    1,
                    3,
                    7
                ],
                "price": 8.4,
                "tag": "Menu 1"
            }
        ]
    },
    {
        "id": "m_koliba-hrebenky_1",
        "restaurantSlug": "koliba-hrebenky",
        "dayIndex": 1,
        "status": "published",
        "publishedAtTime": "08:45",
        "items": [
            {
                "id": "mi_koliba-hrebenky_1_0",
                "name": "Gulášová polievka",
                "desc": "Hovädzí guláš, zemiaky",
                "weight": "0,33 l",
                "allergens": [
                    1,
                    9
                ],
                "price": 3,
                "tag": "Polievka"
            },
            {
                "id": "mi_koliba-hrebenky_1_1",
                "name": "Pečená kačica, červená kapusta",
                "desc": "Kačacie stehno, lokše",
                "weight": "150 / 250 g",
                "allergens": [
                    1,
                    3
                ],
                "price": 11.5,
                "tag": "Menu 1"
            }
        ]
    }
];
}),
"[project]/src/lib/data/seed/notifications.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = [
    {
        "id": "n1",
        "kind": "menu",
        "title": "Bistro Mlyn zverejnil dnešné menu",
        "body": "Tekvicový krém, kuracie supreme a hubové rizoto.",
        "time": "Dnes 9:12",
        "slug": "bistro-mlyn",
        "hoursAgo": 3,
        "read": false
    },
    {
        "id": "n2",
        "kind": "offer",
        "title": "Oliva Kitchen: -10 % na losos",
        "body": "Zľava platí pri objednávke do 13:00.",
        "time": "Dnes 8:40",
        "slug": "oliva-kitchen",
        "hoursAgo": 4,
        "read": false
    },
    {
        "id": "n3",
        "kind": "menu",
        "title": "Pri jednom stole zverejnil dnešné menu",
        "body": "Dnes varia hovädzie líčka a pečenú cviklu.",
        "time": "Dnes 8:05",
        "slug": "pri-jednom-stole",
        "hoursAgo": 5,
        "read": false
    },
    {
        "id": "n4",
        "kind": "system",
        "title": "Nové filtre alergénov",
        "body": "Vylúčiť môžete všetkých 14 alergénov naraz.",
        "time": "Včera 16:20",
        "slug": null,
        "hoursAgo": 20,
        "read": false
    },
    {
        "id": "n5",
        "kind": "offer",
        "title": "Burger Garage: Burger týždňa",
        "body": "BBQ chicken burger so šalátom za 8,90 €.",
        "time": "Pondelok 10:00",
        "slug": "burger-garage",
        "hoursAgo": 72,
        "read": false
    },
    {
        "id": "n6",
        "kind": "system",
        "title": "Plánovaná údržba",
        "body": "V nedeľu medzi 2:00 a 3:00 nebude služba dostupná.",
        "time": "5. 10.",
        "slug": null,
        "hoursAgo": 120,
        "read": false
    }
];
}),
"[project]/src/lib/data/seed/restaurants.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = JSON.parse("[{\"id\":\"r_bistro-mlyn\",\"slug\":\"bistro-mlyn\",\"name\":\"Bistro Mlyn\",\"initials\":\"BM\",\"tagline\":\"Moderná slovenská kuchyňa\",\"cuisines\":[\"Slovenská\"],\"city\":\"Bratislava\",\"district\":\"Ružinov\",\"address\":\"Mlynské nivy 12, Ružinov\",\"phone\":\"+421 910 234 567\",\"email\":\"obed@bistromlyn.sk\",\"web\":\"bistromlyn.sk\",\"rating\":4.8,\"ratingCount\":312,\"lat\":48.1465,\"lng\":17.126,\"delivery\":{\"available\":true,\"eta\":\"30 – 45 min\"},\"hours\":[[\"Pondelok\",\"11:00 – 15:00\"],[\"Utorok\",\"11:00 – 15:00\"],[\"Streda\",\"11:00 – 15:00\"],[\"Štvrtok\",\"11:00 – 15:00\"],[\"Piatok\",\"11:00 – 15:00\"],[\"Sobota\",\"Zatvorené\"],[\"Nedeľa\",\"Zatvorené\"]],\"image\":\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Hovädzí burger Mlyn\",\"desc\":\"Hovädzie 180 g, cheddar, lokálna žemľa\",\"weight\":\"320 g\",\"allergens\":[1,3,7,10],\"price\":10.9,\"tag\":\"Stále\"},{\"name\":\"Caesar šalát s kuracím\",\"desc\":\"Rímsky šalát, parmezán, krutóny\",\"weight\":\"300 g\",\"allergens\":[1,3,4,7],\"price\":8.5,\"tag\":\"Stále\"}],\"reviews\":[{\"author\":\"Zuzana K.\",\"stars\":5,\"date\":\"pred 2 dňami\",\"text\":\"Najlepšie denné menu na Nivách. Porcie sú poriadne a obsluha rýchla.\"},{\"author\":\"Peter M.\",\"stars\":4,\"date\":\"pred týždňom\",\"text\":\"Dobré jedlo, v čase obeda je plno. Odporúčam prísť skôr.\"}],\"status\":\"active\"},{\"id\":\"r_oliva-kitchen\",\"slug\":\"oliva-kitchen\",\"name\":\"Oliva Kitchen\",\"initials\":\"OK\",\"tagline\":\"Stredomorská kuchyňa\",\"cuisines\":[\"Stredomorská\",\"Talianska\"],\"city\":\"Bratislava\",\"district\":\"Ružinov\",\"address\":\"Prievozská 6, Ružinov\",\"phone\":\"+421 948 112 390\",\"email\":\"ahoj@olivakitchen.sk\",\"web\":\"olivakitchen.sk\",\"rating\":4.6,\"ratingCount\":187,\"lat\":48.15,\"lng\":17.1335,\"delivery\":{\"available\":true,\"eta\":\"25 – 40 min\"},\"hours\":[[\"Pondelok\",\"10:30 – 14:30\"],[\"Utorok\",\"10:30 – 14:30\"],[\"Streda\",\"10:30 – 14:30\"],[\"Štvrtok\",\"10:30 – 14:30\"],[\"Piatok\",\"10:30 – 14:30\"],[\"Sobota\",\"12:00 – 20:00\"],[\"Nedeľa\",\"Zatvorené\"]],\"image\":\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Margherita\",\"desc\":\"Paradajky, mozzarella, bazalka\",\"weight\":\"450 g\",\"allergens\":[1,7],\"price\":7.9,\"tag\":\"Stále\"},{\"name\":\"Tiramisu\",\"desc\":\"Mascarpone, espresso, kakao\",\"weight\":\"140 g\",\"allergens\":[1,3,7],\"price\":4.2,\"tag\":\"Dezert\"}],\"reviews\":[{\"author\":\"Marek D.\",\"stars\":5,\"date\":\"pred 3 dňami\",\"text\":\"Losos bol výborný, kuskus nie je suchý ako inde.\"},{\"author\":\"Jana S.\",\"stars\":4,\"date\":\"pred 2 týždňami\",\"text\":\"Príjemné prostredie, menu mení každý deň.\"}],\"status\":\"active\"},{\"id\":\"r_pri-jednom-stole\",\"slug\":\"pri-jednom-stole\",\"name\":\"Pri jednom stole\",\"initials\":\"PJ\",\"tagline\":\"Poctivá domáca kuchyňa\",\"cuisines\":[\"Slovenská\"],\"city\":\"Bratislava\",\"district\":\"Staré Mesto\",\"address\":\"Záhradnícka 21, Staré Mesto\",\"phone\":\"+421 903 875 221\",\"email\":\"rezervacie@jednostol.sk\",\"web\":\"jednostol.sk\",\"rating\":4.9,\"ratingCount\":428,\"lat\":48.1492,\"lng\":17.1235,\"delivery\":{\"available\":false,\"eta\":\"\"},\"hours\":[[\"Pondelok\",\"11:00 – 15:30\"],[\"Utorok\",\"11:00 – 15:30\"],[\"Streda\",\"11:00 – 15:30\"],[\"Štvrtok\",\"11:00 – 15:30\"],[\"Piatok\",\"11:00 – 15:30\"],[\"Sobota\",\"Zatvorené\"],[\"Nedeľa\",\"Zatvorené\"]],\"image\":\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Domáci jablkový závin\",\"desc\":\"Orechy, škorica, vanilková poleva\",\"weight\":\"150 g\",\"allergens\":[1,3,7,8],\"price\":3.5,\"tag\":\"Dezert\"}],\"reviews\":[{\"author\":\"Eva H.\",\"stars\":5,\"date\":\"pred 4 dňami\",\"text\":\"Sviečková ako od babičky. Rezervácie nutné.\"},{\"author\":\"Tomáš R.\",\"stars\":5,\"date\":\"pred týždňom\",\"text\":\"Za tú cenu najlepšia domáca kuchyňa v centre.\"}],\"status\":\"active\"},{\"id\":\"r_wok-bar-nivy\",\"slug\":\"wok-bar-nivy\",\"name\":\"Wok Bar Nivy\",\"initials\":\"WB\",\"tagline\":\"Ázijská kuchyňa\",\"cuisines\":[\"Ázijská\"],\"city\":\"Bratislava\",\"district\":\"Petržalka\",\"address\":\"Einsteinova 24, Petržalka\",\"phone\":\"+421 902 444 019\",\"email\":\"info@wokbar.sk\",\"web\":\"wokbar.sk\",\"rating\":4.4,\"ratingCount\":256,\"lat\":48.1287,\"lng\":17.1096,\"delivery\":{\"available\":true,\"eta\":\"35 – 50 min\"},\"hours\":[[\"Pondelok\",\"11:00 – 21:00\"],[\"Utorok\",\"11:00 – 21:00\"],[\"Streda\",\"11:00 – 21:00\"],[\"Štvrtok\",\"11:00 – 21:00\"],[\"Piatok\",\"11:00 – 21:00\"],[\"Sobota\",\"11:00 – 21:00\"],[\"Nedeľa\",\"12:00 – 20:00\"]],\"image\":\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Vietnamské jarné závitky\",\"desc\":\"Krevety, mäta, arašidová omáčka\",\"weight\":\"4 ks\",\"allergens\":[2,5,6],\"price\":5.9,\"tag\":\"Stále\"}],\"reviews\":[{\"author\":\"Lucia B.\",\"stars\":4,\"date\":\"pred 5 dňami\",\"text\":\"Rýchle, chutné, trochu bez fantázie. Pad thai je ale top.\"}],\"status\":\"active\"},{\"id\":\"r_burger-garage\",\"slug\":\"burger-garage\",\"name\":\"Burger Garage\",\"initials\":\"BG\",\"tagline\":\"Burgre a grill\",\"cuisines\":[\"Burger\"],\"city\":\"Bratislava\",\"district\":\"Nové Mesto\",\"address\":\"Račianske mýto 2, Nové Mesto\",\"phone\":\"+421 905 300 700\",\"email\":\"garage@burgergarage.sk\",\"web\":\"burgergarage.sk\",\"rating\":4.5,\"ratingCount\":391,\"lat\":48.1578,\"lng\":17.1186,\"delivery\":{\"available\":true,\"eta\":\"30 – 40 min\"},\"hours\":[[\"Pondelok\",\"11:00 – 22:00\"],[\"Utorok\",\"11:00 – 22:00\"],[\"Streda\",\"11:00 – 22:00\"],[\"Štvrtok\",\"11:00 – 22:00\"],[\"Piatok\",\"11:00 – 22:00\"],[\"Sobota\",\"11:00 – 23:00\"],[\"Nedeľa\",\"12:00 – 21:00\"]],\"image\":\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Milkshake vanilka\",\"desc\":\"Vanilkový zmrzlinový shake\",\"weight\":\"0,4 l\",\"allergens\":[7],\"price\":4.5,\"tag\":\"Nápoj\"}],\"reviews\":[{\"author\":\"Adam P.\",\"stars\":5,\"date\":\"pred 2 dňami\",\"text\":\"Najlepší burger na obede. Ceny férové.\"}],\"status\":\"active\"},{\"id\":\"r_zelena-lyzica\",\"slug\":\"zelena-lyzica\",\"name\":\"Zelená lyžica\",\"initials\":\"ZL\",\"tagline\":\"Vegánska a vegetariánska kuchyňa\",\"cuisines\":[\"Vegánska\"],\"city\":\"Bratislava\",\"district\":\"Staré Mesto\",\"address\":\"Obchodná 40, Staré Mesto\",\"phone\":\"+421 917 100 205\",\"email\":\"ahoj@zelenalyzica.sk\",\"web\":\"zelenalyzica.sk\",\"rating\":4.7,\"ratingCount\":144,\"lat\":48.1496,\"lng\":17.1103,\"delivery\":{\"available\":false,\"eta\":\"\"},\"hours\":[[\"Pondelok\",\"11:00 – 16:00\"],[\"Utorok\",\"11:00 – 16:00\"],[\"Streda\",\"11:00 – 16:00\"],[\"Štvrtok\",\"11:00 – 16:00\"],[\"Piatok\",\"11:00 – 16:00\"],[\"Sobota\",\"Zatvorené\"],[\"Nedeľa\",\"Zatvorené\"]],\"image\":\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Smoothie bowl\",\"desc\":\"Banán, bobule, granola\",\"weight\":\"320 g\",\"allergens\":[8],\"price\":6.5,\"tag\":\"Stále\"}],\"reviews\":[{\"author\":\"Katarína V.\",\"stars\":5,\"date\":\"pred 3 dňami\",\"text\":\"Konečne vegánske menu, ktoré zasýti.\"}],\"status\":\"active\"},{\"id\":\"r_trattoria-ponte\",\"slug\":\"trattoria-ponte\",\"name\":\"Trattoria Ponte\",\"initials\":\"TP\",\"tagline\":\"Talianska kuchyňa\",\"cuisines\":[\"Talianska\"],\"city\":\"Bratislava\",\"district\":\"Staré Mesto\",\"address\":\"Hviezdoslavovo nám. 18, Staré Mesto\",\"phone\":\"+421 911 223 344\",\"email\":\"tavolo@trattoriaponte.sk\",\"web\":\"trattoriaponte.sk\",\"rating\":4.3,\"ratingCount\":520,\"lat\":48.1437,\"lng\":17.1066,\"delivery\":{\"available\":true,\"eta\":\"40 – 55 min\"},\"hours\":[[\"Pondelok\",\"11:30 – 22:00\"],[\"Utorok\",\"11:30 – 22:00\"],[\"Streda\",\"11:30 – 22:00\"],[\"Štvrtok\",\"11:30 – 22:00\"],[\"Piatok\",\"11:30 – 22:00\"],[\"Sobota\",\"11:30 – 23:00\"],[\"Nedeľa\",\"11:30 – 21:00\"]],\"image\":\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Panna cotta\",\"desc\":\"Vanilka, malinový coulis\",\"weight\":\"130 g\",\"allergens\":[7],\"price\":4.5,\"tag\":\"Dezert\"}],\"reviews\":[{\"author\":\"Martin Z.\",\"stars\":4,\"date\":\"pred týždňom\",\"text\":\"Centrum, takže ceny vyššie, ale kvalita sedí.\"}],\"status\":\"active\"},{\"id\":\"r_koliba-hrebenky\",\"slug\":\"koliba-hrebenky\",\"name\":\"Koliba Hrebienok\",\"initials\":\"KH\",\"tagline\":\"Slovenská kuchyňa\",\"cuisines\":[\"Slovenská\"],\"city\":\"Košice\",\"district\":\"Staré Mesto\",\"address\":\"Hlavná 52, Košice\",\"phone\":\"+421 905 111 202\",\"email\":\"obedy@kolibahrebienok.sk\",\"web\":\"kolibahrebienok.sk\",\"rating\":4.6,\"ratingCount\":98,\"lat\":48.7208,\"lng\":21.2581,\"delivery\":{\"available\":true,\"eta\":\"30 – 45 min\"},\"hours\":[[\"Pondelok\",\"10:30 – 21:00\"],[\"Utorok\",\"10:30 – 21:00\"],[\"Streda\",\"10:30 – 21:00\"],[\"Štvrtok\",\"10:30 – 21:00\"],[\"Piatok\",\"10:30 – 21:00\"],[\"Sobota\",\"11:00 – 22:00\"],[\"Nedeľa\",\"11:00 – 20:00\"]],\"image\":\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"gallery\":[\"https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\",\"https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900\"],\"standard\":[{\"name\":\"Bryndzové halušky\",\"desc\":\"Bryndza, slanina\",\"weight\":\"400 g\",\"allergens\":[1,3,7],\"price\":8.9,\"tag\":\"Stále\"}],\"reviews\":[{\"author\":\"Ján T.\",\"stars\":5,\"date\":\"pred 6 dňami\",\"text\":\"Pirohy ako doma.\"}],\"status\":\"active\"}]");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__05byw2kpmd9ha._.js.map