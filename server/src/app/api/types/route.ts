import { getRepositories } from "@/lib/data";
import { env } from "@/lib/env";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** Cuisines, cities/districts, allergens and the dates behind the UI day slots. */
export const GET = route(async () => {
  const catalog = await getRepositories().restaurants.catalog();
  return ok(catalog, { meta: { dataSource: env.dataSource } });
});
