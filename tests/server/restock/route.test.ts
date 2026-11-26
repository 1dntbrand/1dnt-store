import assert from "node:assert/strict";
import { test } from "node:test";
import { Redis } from "@upstash/redis";
import { POST } from "../../../src/app/api/restock/route";

test("returns 429 before reading the body or writing to Sheets when the restock limit is exceeded", async (t) => {
  const redis = new Redis({
    url: "https://redis.example.invalid",
    token: "test-token",
    enableAutoPipelining: false,
  });
  t.mock.method(Redis, "fromEnv", () => redis);
  const redisLimit = t.mock.method(redis, "evalsha", async () => [-1, 5]);
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  const request = new Request("http://localhost/api/restock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-vercel-forwarded-for": "192.0.2.1",
    },
    body: JSON.stringify({
      email: "customer@example.com",
      collection: "elegant",
      kind: "harness",
      colour: "coyote-brown",
      size: "M",
      language: "pl",
    }),
  });

  const response = await POST(request);

  assert.equal(redisLimit.mock.callCount(), 1);
  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { ok: false, code: "rate_limited" });
  assert.equal(request.bodyUsed, false);
  assert.equal(fetchMock.mock.callCount(), 0);
});
