import assert from "node:assert/strict";
import test from "node:test";
import { parseLocation } from "./locationStorage.ts";

test("saved position is restored", () => {
  assert.deepEqual(
    parseLocation(JSON.stringify({ position: { lat: 48.1486, lng: 17.1077 }, denied: false })),
    { position: { lat: 48.1486, lng: 17.1077 }, denied: false },
  );
});

test("denied state is remembered without a position", () => {
  assert.deepEqual(parseLocation(JSON.stringify({ position: null, denied: true })), {
    position: null,
    denied: true,
  });
});

test("malformed or out-of-range data is discarded", () => {
  const empty = { position: null, denied: false };
  assert.deepEqual(parseLocation(null), empty);
  assert.deepEqual(parseLocation("not json"), empty);
  assert.deepEqual(parseLocation("[]"), empty);
  assert.deepEqual(parseLocation(JSON.stringify({ position: { lat: 100, lng: 17 }, denied: true })), {
    position: null,
    denied: true,
  });
  assert.deepEqual(parseLocation(JSON.stringify({ position: { lat: 48, lng: "17" } })), empty);
});
