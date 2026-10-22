import type { NextRequest } from "next/server";
import { env } from "./env";
import { ApiError } from "./http";

export type Role = "user" | "manager" | "admin";

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
};

function roleFor(email: string): Role {
  if (env.adminEmails.includes(email)) return "admin";
  if (env.managerEmails.includes(email)) return "manager";
  return "user";
}

/**
 * DEV AUTH STUB
 * ------------
 * The prototype has no real sign-in yet. A caller identifies itself with
 * `X-Menufy-User: <email>`; without the header `MENUFY_DEV_USER` is used.
 * This is deliberately insecure and must not survive into production.
 *
 * When Supabase Auth lands, keep the CurrentUser shape and replace the body:
 *
 *   const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
 *   const { data, error } = await supabase.auth.getUser(token);
 *   if (error || !data.user) return null;
 *   return {
 *     id: data.user.id,                                  // uuid from auth.users
 *     email: data.user.email ?? "",
 *     role: (data.user.app_metadata.role as Role) ?? "user",
 *   };
 *
 * Favorites/notifications already key on an opaque string id, and the Supabase
 * repositories resolve the email to a profile row, so routes do not change.
 */
export function currentUser(req: NextRequest): CurrentUser | null {
  const raw = req.headers.get("x-menufy-user") ?? env.devUserEmail;
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { id: `user_${email}`, email, role: roleFor(email) };
}

export function requireUser(req: NextRequest): CurrentUser {
  const user = currentUser(req);
  if (!user) throw new ApiError(401, "unauthorized", "Chýba alebo je neplatná identita používateľa.");
  return user;
}

export function requireRole(req: NextRequest, ...roles: Role[]): CurrentUser {
  const user = requireUser(req);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "forbidden", "Na túto akciu nemáte oprávnenie.");
  }
  return user;
}
