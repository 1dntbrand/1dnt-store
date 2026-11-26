import { checkRestockRateLimit } from "@/server/integrations/rate-limit";
import { writeRestockRequest } from "@/server/integrations/sheets";
import { parseRestockInput } from "@/server/restock/restock-input";

export async function POST(request: Request) {
  const clientKey =
    request.headers.get("x-vercel-forwarded-for") ??
    (process.env.NODE_ENV === "development" ? "local" : null);

  if (!clientKey) {
    return Response.json(
      { ok: false, code: "rate_limit_unavailable" },
      { status: 503 },
    );
  }
  let input: unknown;

  try {
    const rateLimit = await checkRestockRateLimit(clientKey);

    if (!rateLimit) {
      return Response.json(
        { ok: false, code: "rate_limited" },
        { status: 429 },
      );
    }
  } catch {
    return Response.json(
      { ok: false, code: "rate_limit_unavailable" },
      { status: 503 },
    );
  }

  try {
    const reader = request.body?.getReader();

    if (!reader) {
      throw new Error("Request body is not readable");
    }

    const chunks: Uint8Array[] = [];
    const readLimit = 4 * 1024;
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > readLimit) {
        await reader.cancel();
        throw new Error("Request body too large");
      }

      chunks.push(value);
    }

    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ ok: false, code: "invalid_input" }, { status: 400 });
  }

  const parsedResult = parseRestockInput(input);

  if (!parsedResult.ok) {
    const status = parsedResult.code === "already_available" ? 409 : 400;
    return Response.json(parsedResult, { status });
  }

  const writeResult = await writeRestockRequest(parsedResult.value);

  if (!writeResult.ok) {
    return Response.json({ ok: false, code: "storage_error" }, { status: 503 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
