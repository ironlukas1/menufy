import { test } from "node:test";
import assert from "node:assert/strict";
import { localDate, priceToCents, upcomingMenuDays } from "./owner.ts";

test("menu prices accept Slovak decimals and convert to exact cents", () => {
  assert.equal(priceToCents("8,90"), 890);
  assert.equal(priceToCents(" 8.9 "), 890);
  assert.equal(priceToCents("0"), 0);
  assert.equal(priceToCents("1000.00"), 100000);
  assert.equal(priceToCents("1.01"), 101);
});
test("menu prices reject empty, negative, excessive precision and out-of-range input", () => {
  for (const input of ["", " ", "-1", "1.001", "1000.01", "1e2", "NaN", "1,2.3", "9 €"])
    assert.equal(priceToCents(input), null, input);
});
test("public menu dates use local calendar days and cross month/year boundaries", () => {
  const now = new Date(2026, 11, 31, 23, 30);
  assert.equal(localDate(now), "2026-12-31");
  const days = upcomingMenuDays(now);
  assert.deepEqual(days.map((day) => day.date), ["2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03"]);
  assert.equal(days[0].short, "Dnes");
  assert.equal(days[1].short, "Zajtra");
});
test("daylight-saving transitions do not skip or duplicate menu dates", () => {
  const days = upcomingMenuDays(new Date(2026, 9, 24, 12));
  assert.deepEqual(days.map((day) => day.date), ["2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"]);
});
