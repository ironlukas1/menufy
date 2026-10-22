import { env } from "../env";
import { createMemoryRepositories } from "./memory/repositories";
import { createSupabaseRepositories } from "./supabase/repositories";
import type { Repositories } from "./types";

let repositories: Repositories | null = null;

/**
 * Single place that decides where data comes from.
 * Flip `MENUFY_DATA_SOURCE=supabase` (after creating the schema) and every route
 * follows, because they only depend on the `Repositories` interfaces.
 */
export function getRepositories(): Repositories {
  if (!repositories) {
    repositories =
      env.dataSource === "supabase" ? createSupabaseRepositories() : createMemoryRepositories();
  }
  return repositories;
}

export type { Repositories };
