import { env } from "@/lib/env";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

export const GET = route(async () =>
  ok({
    status: "ok",
    service: "menufy-api",
    version: env.version,
    dataSource: env.dataSource,
    time: new Date().toISOString(),
  }),
);
