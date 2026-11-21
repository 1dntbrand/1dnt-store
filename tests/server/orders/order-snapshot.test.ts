import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCheckoutInput } from "../../../src/server/orders/checkout-input";
import { buildOrderSnapshot } from "../../../src/server/orders/order-snapshot";
import { SHIPPING_PRICE } from "../../../src/domain/commerce/shipping";

const collar = {
  collection: "base",
  kind: "collar",
  colour: "khaki",
  size: "S",
  qty: 1,
};
const leash = {
  collection: "base",
  kind: "leash",
  colour: "black",
  size: "1.5",
  qty: 1,
};
const harness = {
  collection: "base",
  kind: "harness",
  colour: "khaki",
  size: "S",
  qty: 1,
};

function orderInput(items: unknown = [collar, leash]) {
  const parsed = parseCheckoutInput({
    attemptId: "72d9de90-b0da-4db1-b26a-cc9ae987c450",
    contact: {
      firstName: " Anna ",
      lastName: "Nowak",
      email: "ann@example.com",
      phone: "+48500600700",
    },
    language: "pl",
    pickupPointId: "WAW-DEMO",
    items,
    successUrl: "https://example.com/client-supplied",
    total: 1,
  });

  assert.ok(parsed.ok);
  return {
    checkout: parsed.value,
    pickupPoint: {
      id: "WAW-DEMO",
      country: "PL" as const,
      address: "Adres testowy",
    },
    orderId: "ord_demo_001",
    createdAt: "2026-11-18T12:00:00Z",
  };
}

test("builds a deterministic snapshot with fixed prices, titles and initial states", () => {
  const input = orderInput();
  const snapshot = buildOrderSnapshot(input);

  assert.deepEqual(snapshot, buildOrderSnapshot(input));
  assert.equal(snapshot.orderId, input.orderId);
  assert.equal(snapshot.attemptId, input.checkout.attemptId);
  assert.equal(snapshot.createdAt, input.createdAt);
  assert.equal(snapshot.language, "pl");
  assert.equal(snapshot.contact.firstName, "Anna");
  assert.deepEqual(snapshot.pickupPoint, input.pickupPoint);
  assert.equal(snapshot.currency, "PLN");
  assert.equal(snapshot.shippingAmount, 0);
  assert.equal(snapshot.paymentStatus, "pending");
  assert.equal(snapshot.fulfillmentStatus, "new");
  assert.equal(snapshot.total, 26_600);
  assert.equal("successUrl" in snapshot, false);
  assert.deepEqual(
    snapshot.items.map(({ title, unitPrice, discount, lineTotal }) => ({
      title,
      unitPrice,
      discount,
      lineTotal,
    })),
    [
      {
        title: "Obroża Base BioThane®",
        unitPrice: 15_000,
        discount: 750,
        lineTotal: 14_250,
      },
      {
        title: "Smycz Base BioThane®",
        unitPrice: 13_000,
        discount: 650,
        lineTotal: 12_350,
      },
    ],
  );
});

test("records only the discounted accessory and both leash price groups", () => {
  const snapshot = buildOrderSnapshot(
    orderInput([collar, { ...leash, qty: 2 }]),
  );
  const [collarLine, leashLine] = snapshot.items;

  assert.deepEqual(collarLine.priceGroups, [{ qty: 1, unitAmount: 14_250 }]);
  assert.deepEqual(leashLine.priceGroups, [
    { qty: 1, unitAmount: 12_350 },
    { qty: 1, unitAmount: 13_000 },
  ]);
  assert.equal(leashLine.lineTotal, 25_350);
  assert.equal(snapshot.total, 39_600);
});

test("reconciles quantities and totals when trio, pair and full prices coexist", () => {
  const snapshot = buildOrderSnapshot(
    orderInput([
      { ...collar, qty: 2 },
      { ...leash, qty: 3 },
      harness,
      { ...leash, collection: "elegant", colour: "dark-brown" },
    ]),
  );
  const baseLeash = snapshot.items.find(
    ({ id }) => id === "base/leash/black/1.5",
  );
  assert.deepEqual(baseLeash?.priceGroups, [
    { qty: 1, unitAmount: 11_700 },
    { qty: 1, unitAmount: 12_350 },
    { qty: 1, unitAmount: 13_000 },
  ]);
  const elegantLeash = snapshot.items.find(
    ({ collection }) => collection === "elegant",
  );
  assert.deepEqual(elegantLeash?.priceGroups, [{ qty: 1, unitAmount: 13_000 }]);

  for (const {
    id,
    unitPrice,
    qty,
    discount,
    lineTotal,
    priceGroups,
  } of snapshot.items) {
    assert.equal(
      priceGroups.reduce((sum, group) => sum + group.qty, 0),
      qty,
      id,
    );
    assert.equal(
      priceGroups.reduce((sum, group) => sum + group.unitAmount * group.qty, 0),
      lineTotal,
      id,
    );
    assert.equal(unitPrice * qty - discount, lineTotal, id);
  }
  assert.equal(
    snapshot.items.reduce(
      (sum, item) => sum + item.lineTotal,
      snapshot.shippingAmount,
    ),
    snapshot.total,
  );
});

test("copies contacts, pickup point, cart lines and price group objects", () => {
  const input = orderInput();
  const snapshot = buildOrderSnapshot(input);

  input.checkout.contact.firstName = "Changed";
  input.pickupPoint.address = "Changed";
  input.checkout.items[0].qty = 8;
  input.checkout.pricing.groupsByItemId[
    input.checkout.items[0].id
  ][0].unitAmount = 1;

  assert.equal(snapshot.contact.firstName, "Anna");
  assert.equal(snapshot.pickupPoint.address, "Adres testowy");
  assert.equal(snapshot.items[0].qty, 1);
  assert.deepEqual(snapshot.items[0].priceGroups, [
    { qty: 1, unitAmount: 14_250 },
  ]);
});

test("adds delivery to the order total below the free delivery threshold", () => {
  const snapshot = buildOrderSnapshot(orderInput([leash]));

  assert.equal(snapshot.shippingAmount, SHIPPING_PRICE);
  assert.equal(snapshot.pricing.shipping, SHIPPING_PRICE);
  assert.equal(snapshot.total, 13_000 + SHIPPING_PRICE);
  assert.equal(
    snapshot.items.reduce(
      (sum, item) => sum + item.lineTotal,
      snapshot.shippingAmount,
    ),
    snapshot.total,
  );
});
