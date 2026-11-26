import assert from "node:assert/strict";
import { test } from "node:test";
import { initialFilters } from "./filtersStorage.ts";
import { matchesFilters } from "./restaurantFilters.ts";
import type { Restaurant } from "./restaurants.ts";

const place = (overrides: Partial<Restaurant> = {}) => ({
  slug: "ruzinovska",
  name: "Ružinovská reštaurácia",
  city: "Bratislava",
  district: "Ružinov",
  cuisines: ["Slovenská"],
  delivery: { available: false, eta: "" },
  live: true,
  rating: 3,
  daily: [[{ name: "Polievka", desc: "", weight: "", allergens: [], price: 6, tag: "" }]],
  standard: [],
  hours: [],
  ...overrides,
}) as unknown as Restaurant;

test("district filter keeps only restaurants from that district", () => {
  const f = { ...initialFilters, district: "Ružinov" };
  assert.equal(matchesFilters(place(), f, "", []), true);
  assert.equal(matchesFilters(place({ district: "Staré Mesto" }), f, "", []), false);
  assert.equal(matchesFilters(place({ city: "Košice" }), f, "", []), false);
});

test("rating is left to the map highlight and does not remove markers", () => {
  assert.equal(matchesFilters(place({ rating: 1 }), { ...initialFilters, minRating: 5 }, "", []), true);
});

test("search, allergens and favorites narrow the same set", () => {
  assert.equal(matchesFilters(place(), initialFilters, "polievka", []), true);
  assert.equal(matchesFilters(place(), initialFilters, "pizza", []), false);
  const withAllergen = place({
    daily: [[{ name: "Polievka", desc: "", weight: "", allergens: [7], price: 6, tag: "" }]],
  });
  assert.equal(matchesFilters(withAllergen, { ...initialFilters, excluded: ["7"] }, "", []), false);
  assert.equal(matchesFilters(place(), { ...initialFilters, sort: "favorites" }, "", []), false);
  assert.equal(matchesFilters(place(), { ...initialFilters, sort: "favorites" }, "", ["ruzinovska"]), true);
});
