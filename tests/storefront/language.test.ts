import assert from "node:assert/strict";
import { test } from "node:test";
import { pickLanguage } from "../../src/features/storefront/lib/language";

test("prefers the language the shopper chose before", () => {
  assert.equal(pickLanguage("ru", "pl-PL,pl;q=0.9"), "ru");
});

test("falls back to the best supported browser language", () => {
  assert.equal(
    pickLanguage(undefined, "de-DE,de;q=0.9,pl;q=0.8,en;q=0.5"),
    "pl",
  );
  assert.equal(pickLanguage(undefined, "uk-UA"), "uk");
});

test("ignores unsupported or empty values", () => {
  assert.equal(pickLanguage("xx", "de-DE,fr;q=0.8"), "en");
  assert.equal(pickLanguage(undefined, null), "en");
  assert.equal(pickLanguage(undefined, "pl;q=0,en;q=0.4"), "en");
});
