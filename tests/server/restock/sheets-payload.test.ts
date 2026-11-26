import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  buildRestockWritePayload,
  signRestockRequest,
  writeRestockRequest,
} from "../../../src/server/integrations/sheets";
import { parseRestockInput } from "../../../src/server/restock/restock-input";

test("builds a Sheets payload with a Russian product title and language name", () => {
  const request = parseRestockInput({
    email: " Zoe@Example.com ",
    collection: "elegant",
    kind: "collar",
    colour: "coyote-brown",
    size: "S",
    language: "en",
  });
  assert.ok(request.ok);

  const payload = buildRestockWritePayload(
    request.value,
    new Date("2026-11-20T10:30:00+01:00"),
  );

  assert.equal(payload.requestedAt, "2026-11-20T09:30:00.000Z");
  assert.equal(
    payload.productLabel,
    "Ошейник Elegant BioThane® · Coyote Brown · S",
  );
  assert.equal(payload.email, "zoe@example.com");
  assert.equal(payload.languageLabel, "Английский");
  assert.equal(payload.variantKey, "elegant/collar/coyote-brown/S");
});

test("formats leash length for the Russian Sheets label", () => {
  const request = parseRestockInput({
    email: "ann@example.com",
    collection: "elegant",
    kind: "leash",
    colour: "coyote-brown",
    size: "1.5",
    language: "pl",
  });
  assert.ok(request.ok);

  const payload = buildRestockWritePayload(
    request.value,
    new Date("2026-11-20T10:30:00+01:00"),
  );

  assert.equal(
    payload.productLabel,
    "Поводок Elegant BioThane® · Coyote Brown · 1,5 м",
  );
  assert.equal(payload.languageLabel, "Польский");
  assert.equal(payload.variantKey, "elegant/leash/coyote-brown/1.5");
});

const signingPayload = {
  requestedAt: "2026-11-23T09:30:00.000Z",
  productLabel: "Шлейка Elegant BioThane® · Coyote Brown · M",
  email: "ann@example.com",
  languageLabel: "Польский",
  variantKey: "elegant/harness/coyote-brown/M",
};
const signingSecret = "restock-unit-test-secret";
const issuedAt = 1795426201000;

test("signs the exact UTF-8 request body and timestamp using Base64 HMAC-SHA256", () => {
  const request = signRestockRequest(signingPayload, signingSecret, issuedAt);

  assert.equal(request.issuedAt, issuedAt);
  assert.equal(
    request.body,
    JSON.stringify({ action: "restock.create", payload: signingPayload }),
  );
  assert.equal(
    request.signature,
    "Xb3i/0GR2CoxpBSewY+++iajUV1gn1qv27XpV6Xu+0E=",
  );
});

test("changes the signature if the email or timestamp changes", () => {
  const original = signRestockRequest(signingPayload, signingSecret, issuedAt);
  const updatedEmail = signRestockRequest(
    { ...signingPayload, email: "zoe@example.com" },
    signingSecret,
    issuedAt,
  );
  const updatedTime = signRestockRequest(
    signingPayload,
    signingSecret,
    issuedAt + 1,
  );

  assert.notEqual(updatedEmail.signature, original.signature);
  assert.notEqual(updatedTime.signature, original.signature);
});

const scriptUrl = "https://example.com/exec";

function configureRestockClient(t: TestContext) {
  const values = {
    GOOGLE_SHEETS_SCRIPT_URL: scriptUrl,
    GOOGLE_SHEETS_SIGNING_SECRET: signingSecret,
  };

  for (const [key, value] of Object.entries(values)) {
    const original = process.env[key];
    t.after(() => {
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    });
    process.env[key] = value;
  }

  const request = parseRestockInput({
    email: signingPayload.email,
    collection: "elegant",
    kind: "harness",
    colour: "coyote-brown",
    size: "M",
    language: "pl",
  });
  assert.ok(request.ok);
  return request.value;
}

test("posts the signed request and preserves both Google success statuses", async (t) => {
  const value = configureRestockClient(t);
  let status: "created" | "duplicate" = "created";
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ ok: true, status }),
  );

  assert.deepEqual(await writeRestockRequest(value), { ok: true, status });

  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, scriptUrl);
  assert.equal(options?.method, "POST");
  assert.equal(
    new Headers(options?.headers).get("Content-Type"),
    "application/json",
  );
  assert.equal(typeof options?.body, "string");
  const signedRequest = JSON.parse(String(options?.body));
  const payload = buildRestockWritePayload(
    value,
    new Date(signedRequest.issuedAt),
  );
  assert.deepEqual(
    signedRequest,
    signRestockRequest(payload, signingSecret, signedRequest.issuedAt),
  );

  status = "duplicate";
  assert.deepEqual(await writeRestockRequest(value), { ok: true, status });
});

test("returns a storage error for failed, unexpected or unreachable Google responses", async (t) => {
  const value = configureRestockClient(t);
  const responses = [
    Response.json({ ok: false, code: "storage_busy" }),
    Response.json({ ok: true, status: "created" }, { status: 503 }),
    Response.json({ ok: "false", status: "created" }),
    Response.json({ ok: true, status: "unexpected" }),
    Response.json(null),
    new Response("<html>error</html>"),
  ];
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    const response = responses.shift();
    if (response) return response;
    throw new Error("test network failure");
  });
  const expected = { ok: false, code: "storage_error" };

  for (let call = 0; call < 7; call++) {
    assert.deepEqual(await writeRestockRequest(value), expected);
  }

  delete process.env.GOOGLE_SHEETS_SIGNING_SECRET;
  assert.deepEqual(await writeRestockRequest(value), expected);
  assert.equal(fetchMock.mock.callCount(), 7);
});
