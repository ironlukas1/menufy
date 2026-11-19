export type OwnedRestaurant = {
  id: string; slug: string; name: string; ico: string; city: string; district: string;
  address: string; email: string; phone: string; status: "pending" | "active" | "hidden";
};
export type MenuItemDraft = { name: string; description: string; weight: string; price: string; allergens: number[]; tag: string };
export type StoredMenu = {
  id: string; kind: "daily" | "standard"; date: string | null; status: "draft" | "published";
  menu_items: { name: string; description: string; weight: string; price_cents: number; allergens: number[]; tag: string; position: number }[];
};
export const emptyMenuItem = (): MenuItemDraft => ({ name: "", description: "", weight: "", price: "", allergens: [], tag: "" });
export function priceToCents(value: string): number | null {
  if (!/^\d{1,4}([.,]\d{1,2})?$/.test(value.trim())) return null;
  const cents = Math.round(Number(value.trim().replace(",", ".")) * 100);
  return cents <= 100000 ? cents : null;
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function upcomingMenuDays(now = new Date()) {
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    const weekday = new Intl.DateTimeFormat("sk", { weekday: "long" }).format(date);
    const short = index === 0 ? "Dnes" : index === 1 ? "Zajtra" : weekday;
    return { date: localDate(date), short, label: `${short}, ${date.getDate()}. ${date.getMonth() + 1}.` };
  });
}
