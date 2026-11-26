import messages from "@/features/storefront/data/messages.json";
import {
  productTitleKey,
  variantColourLabel,
} from "@/features/storefront/lib/product-options";
import type { RestockRequest } from "@/server/restock/restock-input";
import { createHmac } from "node:crypto";

type RestockWritePayload = {
  requestedAt: string;
  productLabel: string;
  email: string;
  languageLabel: string;
  variantKey: string;
};

type signedRestockRequest = {
  issuedAt: number;
  body: string;
  signature: string;
};

const dictionary: Partial<
  Record<string, Partial<Record<RestockRequest["language"], string>>>
> = messages;

const languageLabels: Record<RestockRequest["language"], string> = {
  en: "Английский",
  pl: "Польский",
  ru: "Русский",
  uk: "Украинский",
};

const translateToRussian = (key: string): string => dictionary[key]?.ru ?? key;

export const buildRestockWritePayload = (
  value: RestockRequest,
  requestDate: Date,
): RestockWritePayload => {
  const title = translateToRussian(productTitleKey(value));
  const colour = variantColourLabel(value.colour, translateToRussian);
  const size =
    value.kind === "leash"
      ? `${value.size.replace(".", ",")} ${messages.mUnit.ru}`
      : value.size;

  return {
    requestedAt: requestDate.toISOString(),
    productLabel: [title, colour, size].join(" · "),
    email: value.email,
    languageLabel: languageLabels[value.language],
    variantKey: value.variantKey,
  };
};

export const signRestockRequest = (
  payload: RestockWritePayload,
  secret: string,
  issuedAt: number,
): signedRestockRequest => {
  const body = JSON.stringify({ action: "restock.create", payload });
  const message = `${issuedAt}.${body}`;
  return {
    issuedAt,
    body,
    signature: createHmac("sha256", secret)
      .update(message, "utf8")
      .digest("base64"),
  };
};

export const writeRestockRequest = async (value: RestockRequest) => {
  const { GOOGLE_SHEETS_SCRIPT_URL, GOOGLE_SHEETS_SIGNING_SECRET } =
    process.env;

  if (!GOOGLE_SHEETS_SCRIPT_URL || !GOOGLE_SHEETS_SIGNING_SECRET) {
    return { ok: false, code: "storage_error" };
  }

  const issuedAt = Date.now();

  const payload = buildRestockWritePayload(value, new Date(issuedAt));
  const signedRequest = signRestockRequest(
    payload,
    GOOGLE_SHEETS_SIGNING_SECRET,
    issuedAt,
  );

  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signedRequest),
      signal: AbortSignal.timeout(15_000),
    });

    const result = await response.json();

    if (
      response.ok &&
      result?.ok === true &&
      (result.status === "created" || result.status === "duplicate")
    ) {
      return { ok: true, status: result.status };
    } else {
      return { ok: false, code: "storage_error" };
    }
  } catch {
    return { ok: false, code: "storage_error" };
  }
};
