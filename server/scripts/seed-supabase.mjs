/**
 * Seed the Supabase project with the demo data used by the in-memory backend.
 *
 *   cd server && pnpm seed:supabase
 *
 * Reads the same JSON files as `src/lib/data/seed.ts`, so the Supabase and
 * memory backends show identical restaurants, menus and notices. The script is
 * idempotent: restaurants are upserted by slug, menus and reviews are replaced,
 * notices are only inserted when the table is still empty.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env.local`
 * (the seed writes with the service-role key and bypasses RLS).
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (see .env.example).");
  process.exit(1);
}

const TIME_ZONE = "Europe/Bratislava";
const DAY_SLOTS = [0, 1, 2, 3];

const dateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const parseKey = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const addDays = (value, days) => {
  const date = parseKey(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Mirrors `slotDate` in src/lib/dates.ts (0 = today, 1 = tomorrow, 2/3 = next Mon/Tue). */
const slotDate = (slot, now = new Date()) => {
  const today = dateKey(now);
  if (slot === 0) return today;
  if (slot === 1) return addDays(today, 1);
  const target = slot === 2 ? 0 : 1;
  const weekday = (parseKey(today).getUTCDay() + 6) % 7;
  let offset = (target - weekday + 7) % 7;
  if (offset === 0) offset = 7;
  return addDays(today, offset);
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const restaurants = readJson("src/lib/data/seed/restaurants.json");
const menus = readJson("src/lib/data/seed/menus.json");
const notifications = readJson("src/lib/data/seed/notifications.json");

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const fail = (step, error) => {
  console.error(`✗ ${step}: ${error.message}`);
  process.exit(1);
};

const itemRows = (items) =>
  items.map((item, index) => ({
    name: item.name,
    description: item.desc ?? "",
    weight: item.weight ?? "",
    price_cents: Math.round(item.price * 100),
    allergens: item.allergens ?? [],
    tag: item.tag ?? "",
    position: index,
  }));

async function replaceItems(menuId, items) {
  const { error: clearError } = await db.from("menu_items").delete().eq("menu_id", menuId);
  if (clearError) fail("clear menu items", clearError);

  const { error } = await db.from("menu_items").insert(itemRows(items).map((row) => ({ ...row, menu_id: menuId })));
  if (error) fail("insert menu items", error);
}

async function upsertMenu(restaurantId, kind, date, payload, items) {
  let query = db.from("menus").select("id").eq("restaurant_id", restaurantId).eq("kind", kind);
  query = date ? query.eq("date", date) : query.is("date", null);
  const { data: existing, error: findError } = await query.maybeSingle();
  if (findError) fail("find menu", findError);

  if (existing) {
    const { error } = await db.from("menus").update(payload).eq("id", existing.id);
    if (error) fail("update menu", error);
    await replaceItems(existing.id, items);
    return existing.id;
  }

  const { data, error } = await db
    .from("menus")
    .insert({ ...payload, restaurant_id: restaurantId, kind, date })
    .select("id")
    .single();
  if (error) fail("insert menu", error);
  await replaceItems(data.id, items);
  return data.id;
}

const { data: types, error: typesError } = await db.from("restaurant_types").select("id, name");
if (typesError) fail("load restaurant types", typesError);
const typeIdByName = new Map(types.map((type) => [type.name, type.id]));

let seeded = 0;

for (const restaurant of restaurants) {
  const { data: row, error } = await db
    .from("restaurants")
    .upsert(
      {
        slug: restaurant.slug,
        name: restaurant.name,
        initials: restaurant.initials ?? "",
        tagline: restaurant.tagline ?? "",
        city: restaurant.city,
        district: restaurant.district ?? "",
        address: restaurant.address ?? "",
        phone: restaurant.phone ?? "",
        email: restaurant.email ?? "",
        web: restaurant.web ?? "",
        ico: restaurant.ico ?? null,
        rating: restaurant.rating ?? 0,
        rating_count: restaurant.ratingCount ?? 0,
        lat: restaurant.lat,
        lng: restaurant.lng,
        delivery_available: restaurant.delivery?.available ?? false,
        delivery_eta: restaurant.delivery?.eta ?? "",
        hours: restaurant.hours ?? [],
        image: restaurant.image ?? "",
        gallery: restaurant.gallery ?? [],
        status: restaurant.status ?? "active",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) fail(`upsert restaurant ${restaurant.slug}`, error);

  const links = (restaurant.cuisines ?? [])
    .map((name) => typeIdByName.get(name))
    .filter(Boolean)
    .map((typeId) => ({ restaurant_id: row.id, type_id: typeId }));
  if (links.length) {
    const { error: linkError } = await db
      .from("restaurant_type_links")
      .upsert(links, { onConflict: "restaurant_id,type_id" });
    if (linkError) fail(`link cuisines for ${restaurant.slug}`, linkError);
  }

  const { error: reviewClearError } = await db.from("restaurant_reviews").delete().eq("restaurant_id", row.id);
  if (reviewClearError) fail(`clear reviews for ${restaurant.slug}`, reviewClearError);
  if (restaurant.reviews?.length) {
    const { error: reviewError } = await db.from("restaurant_reviews").insert(
      restaurant.reviews.map((review) => ({
        restaurant_id: row.id,
        author: review.author,
        stars: review.stars,
        reviewed_on: review.date ?? "",
        body: review.text ?? "",
      })),
    );
    if (reviewError) fail(`insert reviews for ${restaurant.slug}`, reviewError);
  }

  await upsertMenu(
    row.id,
    "standard",
    null,
    { status: "published", published_at: new Date().toISOString() },
    restaurant.standard ?? [],
  );

  for (const menu of menus.filter((entry) => entry.restaurantSlug === restaurant.slug)) {
    const date = slotDate(menu.dayIndex);
    const publishedAt = new Date(`${date}T${menu.publishedAtTime}:00`).toISOString();
    await upsertMenu(
      row.id,
      "daily",
      date,
      {
        status: menu.status,
        note: null,
        published_at: menu.status === "published" ? publishedAt : null,
        updated_at: publishedAt,
      },
      menu.items ?? [],
    );
  }

  seeded += 1;
  console.log(`✓ ${restaurant.name} (${restaurant.slug})`);
}

const { count: noticeCount, error: countError } = await db
  .from("notifications")
  .select("id", { count: "exact", head: true });
if (countError) fail("count notifications", countError);

if (!noticeCount) {
  const now = Date.now();
  const { error } = await db.from("notifications").insert(
    notifications.map((notice) => ({
      user_id: null,
      kind: notice.kind,
      title: notice.title,
      body: notice.body,
      time_label: notice.time,
      restaurant_slug: notice.slug,
      created_at: new Date(now - notice.hoursAgo * 60 * 60 * 1000).toISOString(),
    })),
  );
  if (error) fail("insert notifications", error);
  console.log(`✓ ${notifications.length} notices`);
}

console.log(`\nSeeded ${seeded} restaurants into ${url}.`);
