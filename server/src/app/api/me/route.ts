import { requireUser } from "@/lib/auth";
import { ok, preflight, route } from "@/lib/http";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** Current identity. Dev stub today, Supabase Auth user later. */
export const GET = route(async (req) => {
  const user = requireUser(req);
  return ok({ id: user.id, email: user.email, role: user.role });
});
