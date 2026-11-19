import { test } from "node:test";
import assert from "node:assert/strict";
import { imageValidation, MAX_RESTAURANT_IMAGE_SIZE, openingDays, websiteUrl } from "./restaurantSettings.ts";

test("restaurant photos accept supported formats up to 5 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"])
    assert.equal(imageValidation({ type, size: MAX_RESTAURANT_IMAGE_SIZE }), null);
  for (const file of [{ type: "image/svg+xml", size: 10 }, { type: "constructor", size: 10 }, { type: "image/png", size: 0 }, { type: "image/png", size: MAX_RESTAURANT_IMAGE_SIZE + 1 }])
    assert.ok(imageValidation(file));
});
test("restaurant websites normalize domains while rejecting unsafe URLs", () => {
  assert.equal(websiteUrl(" www.bistro.sk "), "https://www.bistro.sk/");
  assert.equal(websiteUrl("https://bistro.sk/menu"), "https://bistro.sk/menu");
  assert.equal(websiteUrl(""), "");
  for (const value of ["javascript:alert(1)", "data:text/html,hello", "https://user:secret@bistro.sk", "https://bad domain.sk"])
    assert.equal(websiteUrl(value), null, value);
});
test("opening hours preserve overnight and midnight closing times", () => {
  const days = openingDays([["Pondelok", "20:00 – 04:00"], ["Utorok", "11:00 – 24:00"], ["Streda", "Zatvorené"]]);
  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { day: "Pondelok", closed: false, open: "20:00", close: "04:00" });
  assert.equal(days[1].close, "24:00");
  assert.equal(days[2].closed, true);
});


test("photo format comes from file bytes rather than a misleading PNG extension", async () => {
  const { restaurantPhotoType } = await import("./restaurantPhoto.ts");
  assert.equal(restaurantPhotoType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), "image/png");
  assert.equal(restaurantPhotoType(new Uint8Array([255, 216, 255, 224])), "image/jpeg");
  assert.equal(restaurantPhotoType(new TextEncoder().encode("RIFF1234WEBP")), "image/webp");
  assert.equal(restaurantPhotoType(new TextEncoder().encode("0000ftypheic")), null);
  assert.equal(restaurantPhotoType(new TextEncoder().encode("<svg></svg>")), null);
  assert.equal(restaurantPhotoType(new Uint8Array([])), null);
});
