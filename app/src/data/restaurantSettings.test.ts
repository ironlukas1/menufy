import { test } from "node:test";
import assert from "node:assert/strict";
import { deliveryLinkUrl, imageValidation, photoUploadError, MAX_RESTAURANT_IMAGE_SIZE, openingDays, websiteUrl } from "./restaurantSettings.ts";

test("photo upload failures distinguish setup, access, format, size and session errors", () => {
  assert.match(photoUploadError({ message: "Bucket not found", statusCode: "404" }), /restaurant-images neexistuje/);
  assert.match(photoUploadError({ message: "new row violates row-level security policy" }), /nepovolilo nahratie/);
  assert.match(photoUploadError({ message: "mime type image/png is not supported" }), /formát/);
  assert.match(photoUploadError({ message: "Payload too large", statusCode: "413" }), /5 MB/);
  assert.match(photoUploadError({ message: "JWT expired", statusCode: "401" }), /Prihlásenie vypršalo/);
  assert.match(photoUploadError({ message: "Service unavailable", statusCode: "503" }), /503.*Service unavailable/);
});

test("delivery links accept provider pages and reject unsafe or misleading destinations", () => {
  assert.equal(deliveryLinkUrl("Wolt", "wolt.com/sk/svk/bratislava/restaurant/test"), "https://wolt.com/sk/svk/bratislava/restaurant/test");
  assert.equal(deliveryLinkUrl("Bolt Food", "https://food.bolt.eu/sk-sk/test"), "https://food.bolt.eu/sk-sk/test");
  assert.equal(deliveryLinkUrl("Bistro.sk", "https://www.bistro.sk/test/"), "https://www.bistro.sk/test/");
  assert.equal(deliveryLinkUrl("Wolt", " "), "");
  for (const url of ["javascript:alert(1)", "http://wolt.com/test", "https://wolt.com.evil.test/test", "https://wolt.com@evil.test/test", "https://evil.test/wolt.com", "https://wolt.com/", "https://wolt.com:8080/test"])
    assert.equal(deliveryLinkUrl("Wolt", url), null, url);
  assert.equal(deliveryLinkUrl("Unknown", "https://wolt.com/test"), null);
});

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
