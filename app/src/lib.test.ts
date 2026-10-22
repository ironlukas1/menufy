import { test } from "node:test";
import assert from "node:assert/strict";
import { nextAt, openStatus } from "./lib.ts";

const week = (wd: string, sun = "Zatvorené"): [string, string][] =>
  ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"].map((d): [string, string] => [d, wd]).concat([["Nedeľa", sun]]);

// 2026-10-22 is a Thursday
const at = (day: number, hhmm: string) => new Date(`2026-10-${day}T${hhmm}:00`);

test("daytime range", () => {
  const r = { hours: week("11:00 – 15:00") };
  assert.equal(openStatus(r, at(22, "12:00")).open, true);
  assert.equal(openStatus(r, at(22, "15:00")).open, false);
  assert.equal(openStatus(r, at(22, "10:00")).label, "Zatvorené · otvára o 11:00");
  assert.equal(openStatus(r, at(25, "12:00")).label, "Dnes zatvorené");
});

test("range past midnight counts on the next day", () => {
  const r = { hours: week("20:00 – 04:00") };
  assert.equal(openStatus(r, at(22, "23:00")).open, true);
  assert.equal(openStatus(r, at(23, "03:00")).label, "Otvorené do 04:00");
  assert.equal(openStatus(r, at(23, "04:00")).open, false);
  assert.equal(openStatus(r, at(26, "02:00")).open, false, "Sunday closed, so Monday 2 am is closed");
});

test("24:00 closing", () => {
  const r = { hours: week("11:00 – 24:00") };
  assert.equal(openStatus(r, at(22, "23:59")).open, true);
  assert.equal(openStatus(r, at(23, "00:30")).open, false);
});

test("nextAt picks the next occurrence", () => {
  const now = at(22, "15:00");
  assert.equal(nextAt("03:00", now).getDate(), 23);
  assert.equal(nextAt("18:00", now).getDate(), 22);
  assert.equal(nextAt("now", now), now);
});
