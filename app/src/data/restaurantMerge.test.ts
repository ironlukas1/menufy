import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeRestaurants } from "./restaurantMerge.ts";

test("live imports replace matching sample restaurants without duplicate cards or markers", () => {
  const sample = { slug: "bistro", name: "Sample Bistro", initials: "SB" };
  const live = { slug: "bistro", name: "Updated Bistro" };
  const owner = { slug: "owner-bistro", name: "Owner Bistro" };
  const result = mergeRestaurants<{ slug: string; name: string; initials?: string }>([sample], [live, owner]);
  assert.deepEqual(result, [live, owner]);
  assert.equal(new Set(result.map((restaurant) => restaurant.slug)).size, result.length);
  assert.deepEqual(mergeRestaurants([sample], []), [sample]);
});
