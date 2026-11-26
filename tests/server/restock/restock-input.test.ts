import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRestockInput } from "../../../src/server/restock/restock-input";

const request = {
  email: " Ann@Example.com ",
  collection: "elegant",
  kind: "harness",
  colour: "coyote-brown",
  size: "M",
  language: "pl",
};

test("normalizes a restock request and derives the key from the verified variant", () => {
  assert.deepEqual(
    parseRestockInput({
      ...request,
      variantKey: "client-supplied",
      status: "notified",
    }),
    {
      ok: true,
      value: {
        ...request,
        email: "ann@example.com",
        variantKey: "elegant/harness/coyote-brown/M",
      },
    },
  );
});

test("keeps distinct sizes separate when the normalized email matches", () => {
  const small = parseRestockInput({ ...request, size: "S" });
  const medium = parseRestockInput({ ...request, email: "ann@example.com" });

  assert.ok(small.ok);
  assert.ok(medium.ok);
  assert.equal(small.value.email, medium.value.email);
  assert.equal(small.value.variantKey, "elegant/harness/coyote-brown/S");
  assert.equal(medium.value.variantKey, "elegant/harness/coyote-brown/M");
});

test("rejects requests for available and made-to-order variants", () => {
  for (const variant of [
    { ...request, colour: "dark-brown" },
    { ...request, collection: "base", colour: "black" },
  ]) {
    assert.deepEqual(parseRestockInput(variant), {
      ok: false,
      code: "already_available",
    });
  }
});

test("rejects unknown variant combinations with a separate error code", () => {
  for (const variant of [
    { ...request, size: "XL" },
    { ...request, colour: "black" },
    { ...request, collection: "unknown" },
  ]) {
    assert.deepEqual(parseRestockInput(variant), {
      ok: false,
      code: "invalid_variant",
    });
  }
});

test("rejects malformed requests, unsupported languages and invalid emails", () => {
  for (const input of [
    null,
    [],
    { ...request, collection: undefined },
    { ...request, language: "xx" },
    { ...request, email: "ann@" },
    { ...request, email: "a".repeat(250) + "@example.com" },
  ]) {
    assert.deepEqual(parseRestockInput(input), {
      ok: false,
      code: "invalid_input",
    });
  }
});
