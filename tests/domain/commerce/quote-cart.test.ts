import assert from "node:assert/strict";
import { test } from "node:test";
import { quoteCart } from "../../../src/domain/commerce/quote-cart";

const collar = {
  collection: "base",
  kind: "collar",
  colour: "khaki",
  size: "S",
  qty: 1,
} as const;

const leash = {
  collection: "base",
  kind: "leash",
  colour: "black",
  size: "1.5",
  qty: 1,
} as const;

test("quotes an eligible Base pair at the catalogue price with a 5% discount", () => {
  const result = quoteCart([collar, leash]);

  assert.ok(result.ok);
  assert.equal(result.pricing.subtotal, 28_000);
  assert.equal(result.pricing.discount, 1_400);
  assert.equal(result.pricing.total, 26_600);
});

test("does not give the pair discount across collections", () => {
  const result = quoteCart([
    collar,
    { ...leash, collection: "elegant", colour: "dark-brown" },
  ]);

  assert.ok(result.ok);
  assert.equal(result.pricing.discount, 0);
  assert.equal(result.pricing.total, 28_000);
});

test("rebuilds items and pricing from trusted catalogue data", () => {
  const input = [collar, leash].map((item) => ({
    ...item,
    id: "same-client-id",
    price: 1,
    discount: 99,
  }));
  const result = quoteCart(input);

  assert.ok(result.ok);
  assert.deepEqual(result.items, [
    { ...collar, id: "base/collar/khaki/S" },
    { ...leash, id: "base/leash/black/1.5" },
  ]);
  assert.equal(result.pricing.total, 26_600);
});

test("merges identical variants and keeps different sizes as separate lines", () => {
  const result = quoteCart([
    collar,
    { ...collar, qty: 2 },
    { ...collar, size: "M" },
  ]);

  assert.ok(result.ok);
  assert.deepEqual(result.items, [
    { ...collar, id: "base/collar/khaki/S", qty: 3 },
    { ...collar, id: "base/collar/khaki/M", size: "M" },
  ]);
});

test("rejects missing, non-array and empty carts", () => {
  for (const input of [undefined, null, { items: [collar] }, []]) {
    assert.deepEqual(quoteCart(input), { ok: false, code: "invalid_cart" });
  }
});

test("accepts 99 input rows and rejects 100 before merging", () => {
  const atLimit = quoteCart(Array.from({ length: 99 }, () => collar));
  const aboveLimit = quoteCart(Array.from({ length: 100 }, () => collar));

  assert.ok(atLimit.ok);
  assert.equal(atLimit.items.length, 1);
  assert.equal(atLimit.items[0].qty, 99);
  assert.deepEqual(aboveLimit, { ok: false, code: "invalid_cart" });
});

test("rejects invalid catalogue variants", () => {
  assert.deepEqual(
    quoteCart([
      { ...leash, collection: "elegant", colour: "dark-brown", size: "2.5" },
    ]),
    { ok: false, code: "invalid_variant" },
  );
  assert.deepEqual(quoteCart([null]), { ok: false, code: "invalid_variant" });
});

test("rejects invalid quantities", () => {
  for (const qty of [undefined, "1", 1.5, 0, -1, Infinity]) {
    assert.deepEqual(quoteCart([{ ...collar, qty }]), {
      ok: false,
      code: "invalid_quantity",
    });
  }
});

test("rejects an out-of-stock variant", () => {
  assert.deepEqual(
    quoteCart([
      {
        collection: "elegant",
        kind: "harness",
        colour: "coyote-brown",
        size: "M",
        qty: 1,
      },
    ]),
    { ok: false, code: "out_of_stock" },
  );
});

test("applies the quantity limit after merging duplicate rows", () => {
  assert.deepEqual(
    quoteCart([
      { ...collar, qty: 60 },
      { ...collar, qty: 60 },
    ]),
    { ok: false, code: "quantity_limit" },
  );
});
