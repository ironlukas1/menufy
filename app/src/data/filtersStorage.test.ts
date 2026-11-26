import assert from "node:assert/strict";
import test from "node:test";
import { DAYS } from "./restaurants.ts";
import { initialFilters, MAX_PRICE, parseFilters } from "./filtersStorage.ts";

test("saved filters are restored unchanged", () => {
  const raw = JSON.stringify({
    day: 2,
    city: "Košice",
    district: "Sever",
    cuisines: ["Vegánska", "Talianska"],
    excluded: ["7", "3"],
    maxPrice: 9,
    delivery: true,
    minRating: 4,
    openAt: "18:00",
    sort: "price",
  });
  assert.deepEqual(parseFilters(raw), {
    day: 2,
    city: "Košice",
    district: "Sever",
    cuisines: ["Vegánska", "Talianska"],
    excluded: ["7", "3"],
    maxPrice: 9,
    delivery: true,
    minRating: 4,
    openAt: "18:00",
    sort: "price",
  });
});

test("malformed storage falls back to defaults", () => {
  assert.deepEqual(parseFilters(null), initialFilters);
  assert.deepEqual(parseFilters("not json"), initialFilters);
  assert.deepEqual(parseFilters("[]"), initialFilters);
});

test("unknown cities, districts, cuisines and allergens are discarded", () => {
  const result = parseFilters(JSON.stringify({
    city: "Neznáme mesto",
    district: "Neznáma časť",
    cuisines: ["Vegánska", "Neznáma"],
    excluded: ["7", "999", "7"],
  }));
  assert.equal(result.city, initialFilters.city);
  assert.equal(result.district, initialFilters.district);
  assert.deepEqual(result.cuisines, ["Vegánska"]);
  assert.deepEqual(result.excluded, ["7"]);
});

test("numeric values are clamped and enums are validated", () => {
  const result = parseFilters(JSON.stringify({
    day: 99,
    maxPrice: -5,
    minRating: 12,
    openAt: "25:00",
    sort: "unknown",
    delivery: "yes",
  }));
  assert.equal(result.day, Math.max(0, DAYS.length - 1));
  assert.equal(result.maxPrice, 6);
  assert.equal(result.minRating, 5);
  assert.equal(result.openAt, initialFilters.openAt);
  assert.equal(result.sort, initialFilters.sort);
  assert.equal(result.delivery, false);
  assert.equal(MAX_PRICE, 15);
});
