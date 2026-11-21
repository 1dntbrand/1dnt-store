import assert from "node:assert/strict";
import { test } from "node:test";
import type { CartItem } from "../../../src/domain/commerce/catalog";
import { suggestSetItem } from "../../../src/features/storefront/lib/set-suggestion";

const item = (
  collection: CartItem["collection"],
  kind: CartItem["kind"],
): CartItem => ({
  id: `${collection}/${kind}`,
  collection,
  kind,
  colour: collection === "base" ? "black" : "dark-brown",
  size: kind === "leash" ? "1.5" : "S",
  qty: 1,
});

test("suggests a leash for a lone collar or Base harness", () => {
  assert.equal(
    suggestSetItem([item("base", "collar")])?.href,
    "#collection/leashes",
  );
  assert.equal(
    suggestSetItem([item("base", "harness")])?.messageKey,
    "setHintLeash",
  );
});

test("suggests the third piece once a pair is in the bag", () => {
  assert.equal(
    suggestSetItem([item("base", "collar"), item("base", "leash")])?.messageKey,
    "setHintTrioHarness",
  );
  assert.equal(
    suggestSetItem([item("elegant", "harness"), item("elegant", "leash")])
      ?.href,
    "#elegant/collars",
  );
});

test("stays quiet for a full set and an Elegant harness alone", () => {
  assert.equal(
    suggestSetItem([
      item("base", "collar"),
      item("base", "leash"),
      item("base", "harness"),
    ]),
    null,
  );
  assert.equal(suggestSetItem([item("elegant", "harness")]), null);
});
