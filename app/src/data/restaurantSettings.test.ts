import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deliveryLinkUrl, googleMapsUrl, imageValidation, mailtoHref, photoUploadError,
  MAX_RESTAURANT_IMAGE_SIZE, openingDays, safeHttpUrl, safeImageUrl, telHref, websiteUrl,
} from "./restaurantSettings.ts";

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
  assert.equal(deliveryLinkUrl(undefined, undefined), null);
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
  for (const value of ["javascript:alert(1)", "data:text/html,hello", "http://bistro.sk", "https://user:secret@bistro.sk", "https://bad domain.sk"])
    assert.equal(websiteUrl(value), null, value);
  assert.equal(safeHttpUrl("//evil.test/path"), "https://evil.test/path");
  assert.equal(safeHttpUrl("https://bistro.sk/#menu"), "https://bistro.sk/#menu");
  assert.equal(safeHttpUrl(null), null);
});
test("restaurant images only accept normalized HTTPS URLs", () => {
  assert.equal(safeImageUrl("images.unsplash.com/photo-1?w=900"), "https://images.unsplash.com/photo-1?w=900");
  for (const value of ["javascript:alert(1)", "http://images.unsplash.com/photo-1", "https://user:pass@images.unsplash.com/photo-1", "data:image/svg+xml,<svg onload=alert(1)>"])
    assert.equal(safeImageUrl(value), null, value);
});

test("google maps links only accept Google hosts over HTTPS", () => {
  assert.equal(googleMapsUrl("https://www.google.com/maps/place/Bratislava"), "https://www.google.com/maps/place/Bratislava");
  assert.equal(googleMapsUrl("https://maps.app.goo.gl/abc"), "https://maps.app.goo.gl/abc");
  for (const value of ["javascript:alert(1)", "http://maps.google.com/x", "https://google.com.evil.test/x", "https://www.google.com@evil.test/x", "https://maps.app.goo.gl.evil.test/x", "https://evil.test/maps"])
    assert.equal(googleMapsUrl(value), null, value);
});
test("contact links reject anything that is not a plain phone number or address", () => {
  assert.equal(telHref("+421 910 234 567"), "tel:+421910234567");
  assert.equal(telHref("(021) 123-45-67"), "tel:0211234567");
  assert.equal(mailtoHref(" Obed@Bistro.sk "), "mailto:Obed@Bistro.sk");
  for (const value of ["javascript:alert(1)", "tel:+421", "callme", "+421\r\nBcc:evil"])
    assert.equal(telHref(value), null, value);
  for (const value of ["javascript:alert(1)", "a@b", "a@b.c%0d%0aBcc:evil", "name <a@b.sk>", "a@@b.sk"])
    assert.equal(mailtoHref(value), null, value);
});
test("opening hours preserve overnight and midnight closing times", () => {
  const days = openingDays([["Pondelok", "20:00 – 04:00"], ["Utorok", "11:00 – 24:00"], ["Streda", "Zatvorené"]]);
  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { day: "Pondelok", closed: false, open: "20:00", close: "04:00" });
  assert.equal(days[1].close, "24:00");
  assert.equal(days[2].closed, true);
});


test("photo format comes from file bytes rather than a misleading PNG extension", async () => {
  const { imageHeaderDimensions, restaurantPhotoType } = await import("./restaurantPhoto.ts");
  assert.equal(restaurantPhotoType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), "image/png");
  assert.equal(restaurantPhotoType(new Uint8Array([255, 216, 255, 224])), "image/jpeg");
  assert.equal(restaurantPhotoType(new TextEncoder().encode("RIFF1234WEBP")), "image/webp");
  assert.equal(restaurantPhotoType(new TextEncoder().encode("0000ftypheic")), null);
  assert.equal(restaurantPhotoType(new TextEncoder().encode("<svg></svg>")), null);
  assert.equal(restaurantPhotoType(new Uint8Array([])), null);

  const png = (width: number, height: number) => Uint8Array.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
    (width >>> 24) & 255, (width >>> 16) & 255, (width >>> 8) & 255, width & 255,
    (height >>> 24) & 255, (height >>> 16) & 255, (height >>> 8) & 255, height & 255,
  ]);
  assert.deepEqual(imageHeaderDimensions(png(5000, 5000), "image/png"), { width: 5000, height: 5000 });
  assert.equal(imageHeaderDimensions(png(1, 1), "image/png")?.width, 1);
  assert.equal(imageHeaderDimensions(new Uint8Array(10), "image/png"), null);

  const jpeg = (width: number, height: number) => Uint8Array.from([
    255, 216, 255, 192, 0, 17, 8,
    (height >>> 8) & 255, height & 255, (width >>> 8) & 255, width & 255,
    ...new Array(10).fill(0),
  ]);
  assert.deepEqual(imageHeaderDimensions(jpeg(5000, 5000), "image/jpeg"), { width: 5000, height: 5000 });
  assert.equal(imageHeaderDimensions(new Uint8Array([255, 216, 255, 217]), "image/jpeg"), null);
});
