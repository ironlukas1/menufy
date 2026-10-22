import { requireRole } from "@/lib/auth";
import { ok, parseBody, preflight, route } from "@/lib/http";
import { parseMenuText } from "@/lib/menu-parser";
import { menuImportSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/**
 * POST /api/menus/import
 * Text -> draft menu items (X-01). Nothing is published automatically; the
 * manager reviews the items and then calls the menu upsert endpoint.
 */
export const POST = route(async (req) => {
  requireRole(req, "manager", "admin");
  const { text } = await parseBody(req, menuImportSchema);

  const result = parseMenuText(text);
  if (!result.items.length) {
    return ok(result, {
      meta: {
        note: "Nepodarilo sa rozpoznať žiadne jedlo s cenou. Skontrolujte formát (názov ... cena).",
      },
    });
  }

  return ok(result, {
    meta: {
      note: "Návrh menu – pred zverejnením ho skontrolujte a doplňte alergény.",
      imported: result.items.length,
      skipped: result.skipped.length,
    },
  });
});
