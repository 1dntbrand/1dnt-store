import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCheckoutInput } from "../../../src/server/orders/checkout-input";

const checkout = {
  attemptId: "72d9de90-b0da-4db1-b26a-cc9ae987c450",
  contact: {
    firstName: " Anna ",
    lastName: " Nowak ",
    email: " ann@example.com ",
    phone: "+48 500 600 700",
  },
  language: "pl",
  pickupPointId: " WAW-DEMO ",
  items: [
    { collection: "base", kind: "collar", colour: "khaki", size: "S", qty: 1 },
    { collection: "base", kind: "leash", colour: "black", size: "1.5", qty: 1 },
  ],
};

test("normalizes a checkout and uses the quoted cart and server rules", () => {
  const result = parseCheckoutInput({
    ...checkout,
    shippingCountry: "DE",
    total: 1,
  });

  assert.ok(result.ok);
  assert.deepEqual(result.value.contact, {
    firstName: "Anna",
    lastName: "Nowak",
    email: "ann@example.com",
    phone: "+48500600700",
  });
  assert.equal(result.value.language, "pl");
  assert.equal(result.value.attemptId, checkout.attemptId);
  assert.equal(result.value.pickupPointId, "WAW-DEMO");
  assert.equal(result.value.shippingCountry, "PL");
  assert.deepEqual(result.value.items, [
    { ...checkout.items[0], id: "base/collar/khaki/S" },
    { ...checkout.items[1], id: "base/leash/black/1.5" },
  ]);
  assert.equal(result.value.pricing.total, 26_600);
  assert.equal("total" in result.value, false);
});

test("rejects a non-object checkout", () => {
  for (const input of [null, [], "checkout"]) {
    assert.deepEqual(parseCheckoutInput(input), {
      ok: false,
      code: "invalid_input",
    });
  }
});

test("returns the field path for invalid checkout fields and contacts", () => {
  const cases = [
    [{ ...checkout, attemptId: "invalid" }, "attemptId"],
    [{ ...checkout, pickupPointId: "  " }, "pickupPointId"],
    [{ ...checkout, language: "xx" }, "language"],
    [{ ...checkout, contact: [] }, "contact"],
    [
      { ...checkout, contact: { ...checkout.contact, firstName: "  " } },
      "contact.firstName",
    ],
    [
      { ...checkout, contact: { ...checkout.contact, email: "no-at-sign" } },
      "contact.email",
    ],
  ] as const;

  for (const [input, field] of cases) {
    assert.deepEqual(parseCheckoutInput(input), {
      ok: false,
      code: "invalid_input",
      field,
    });
  }
});

test("normalizes Polish phone numbers with spaces, hyphens and optional country prefix", () => {
  for (const phone of [
    "500600700",
    "500-600-700",
    "+48500600700",
    " +48 500 600 700 ",
    "0048 500-600-700",
    "+48\u00a0500\u202f600 700",
  ]) {
    const result = parseCheckoutInput({
      ...checkout,
      contact: { ...checkout.contact, phone },
    });

    assert.ok(result.ok, phone);
    assert.equal(result.value.contact.phone, "+48500600700", phone);
  }
});

test("accepts international contact numbers without changing the shipping country", () => {
  const examples = [
    ["+44 20 7946 0958", "+442079460958"],
    ["0049 30 123456", "+4930123456"],
    ["+1 (202) 555-0123", "+12025550123"],
    ["+380 67 123 45 67", "+380671234567"],
  ];

  for (const [phone, expected] of examples) {
    const result = parseCheckoutInput({
      ...checkout,
      contact: { ...checkout.contact, phone },
    });

    assert.ok(result.ok, phone);
    assert.equal(result.value.contact.phone, expected, phone);
    assert.equal(result.value.shippingCountry, "PL");
  }
});

test("rejects malformed and incorrectly sized phone numbers", () => {
  for (const phone of [
    "+44 20 123",
    "+999123456789",
    "+1 202 555 0123 ext. 10",
    "50060070",
    "+485006007000",
    "+48500abc600700",
    "++48500600700",
    "",
    500600700,
  ]) {
    assert.deepEqual(
      parseCheckoutInput({
        ...checkout,
        contact: { ...checkout.contact, phone },
      }),
      { ok: false, code: "invalid_input", field: "contact.phone" },
    );
  }
});

test("preserves the cart failure code", () => {
  assert.deepEqual(parseCheckoutInput({ ...checkout, items: [] }), {
    ok: false,
    code: "invalid_cart",
  });
  assert.deepEqual(
    parseCheckoutInput({
      ...checkout,
      items: [
        {
          collection: "elegant",
          kind: "harness",
          colour: "coyote-brown",
          size: "M",
          qty: 1,
        },
      ],
    }),
    { ok: false, code: "out_of_stock" },
  );
});
