import { z } from "zod";
import { isDateKey } from "./dates";

const list = (value: unknown): string[] => {
  const values = Array.isArray(value)
    ? value.flatMap((entry) => String(entry).split(","))
    : typeof value === "string"
      ? value.split(",")
      : [];
  return values.map((entry) => entry.trim()).filter(Boolean);
};

const stringList = z.union([z.string(), z.array(z.string())]).optional().transform(list);

const allergenList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) =>
    list(value)
      .map(Number)
      .filter((code) => Number.isInteger(code) && code >= 1 && code <= 14),
  );

const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dátum musí byť v tvare YYYY-MM-DD.")
  .refine(isDateKey, "Dátum neexistuje.");

const hoursSchema = z
  .array(z.tuple([z.string().trim().max(30), z.string().trim().max(60)]))
  .length(7, "Otváracie hodiny musia mať 7 položiek (pondelok – nedeľa).")
  .optional();

/* ------------------------------------------------------------------ query --- */

export const restaurantListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  /** Cuisine names; repeatable (`?type=A&type=B`) or comma separated. */
  type: stringList,
  /** Allergen numbers to exclude, e.g. `?exclude=1,7`. */
  exclude: allergenList,
  day: z.coerce.number().int().min(0).max(3).default(0),
  maxPrice: z.coerce.number().min(0).max(1000).optional(),
  minRating: z.coerce.number().min(0).max(5).default(0),
  delivery: z
    .string()
    .optional()
    .transform((value) => value === "true" || value === "1"),
  sort: z.enum(["rating", "price", "distance"]).default("rating"),
  limit: z.coerce.number().int().min(1).max(50).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const menuRangeQuerySchema = z.object({
  from: dateKeySchema.optional(),
  to: dateKeySchema.optional(),
});

export const adminListQuerySchema = z.object({
  status: z.enum(["pending", "active", "hidden"]).default("pending"),
});

/* ------------------------------------------------------------------- body --- */

export const menuItemInputSchema = z.object({
  name: z.string().trim().min(1, "Názov jedla je povinný.").max(120),
  desc: z.string().trim().max(300).default(""),
  weight: z.string().trim().max(60).default(""),
  price: z.coerce.number().min(0).max(1000),
  allergens: z.array(z.coerce.number().int().min(1).max(14)).max(14).default([]),
  tag: z.string().trim().max(40).default("Menu 1"),
});

export const menuUpsertSchema = z.object({
  date: dateKeySchema,
  status: z.enum(["draft", "published"]).default("draft"),
  note: z.string().trim().max(500).nullish(),
  items: z.array(menuItemInputSchema).min(1, "Menu musí mať aspoň jedno jedlo.").max(60),
});

export const menuPatchSchema = z
  .object({
    status: z.enum(["draft", "published"]).optional(),
    note: z.string().trim().max(500).nullish().optional(),
    items: z.array(menuItemInputSchema).min(1).max(60).optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.note !== undefined || value.items !== undefined,
    "Zadajte aspoň jednu zmenu.",
  );

export const restaurantCreateSchema = z.object({
  name: z.string().trim().min(2, "Názov je povinný.").max(120),
  slug: z.string().trim().max(80).optional(),
  tagline: z.string().trim().max(120).default(""),
  cuisines: z.array(z.string().trim().min(1).max(60)).min(1, "Vyberte aspoň jeden typ kuchyne.").max(3),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).default(""),
  address: z.string().trim().min(3).max(200),
  phone: z.string().trim().max(40).default(""),
  email: z.email("Neplatný e-mail.").max(160),
  web: z.string().trim().max(160).default(""),
  ico: z.string().regex(/^\d{8}$/, "IČO musí mať 8 číslic."),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.email("Neplatný e-mail.").max(160),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  hours: hoursSchema,
});

export const restaurantStatusSchema = z.object({
  status: z.enum(["pending", "active", "hidden"]),
});

export const menuImportSchema = z.object({
  /** Raw text pasted from a board, Facebook post or PDF. */
  text: z.string().trim().min(3, "Vložte text menu.").max(20000),
});
