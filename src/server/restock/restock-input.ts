import { variantLimit } from "@/domain/commerce/availability";
import {
  isProductVariant,
  type ProductVariant,
  variantKey,
} from "@/domain/commerce/catalog";
import { z } from "zod";

const restockSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  language: z.enum(["pl", "en", "ru", "uk"]),
  kind: z.string().trim(),
  colour: z.string().trim(),
  size: z.string().trim(),
  collection: z.string().trim(),
});

export type RestockRequest = ProductVariant &
  Pick<z.output<typeof restockSchema>, "email" | "language"> & {
    variantKey: string;
  };

type RestockInputResult =
  | { ok: true; value: RestockRequest }
  | {
      ok: false;
      code: "invalid_input" | "invalid_variant" | "already_available";
    };

export const parseRestockInput = (input: unknown): RestockInputResult => {
  const parsedInput = restockSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, code: "invalid_input" };
  }

  const { data } = parsedInput;

  if (!isProductVariant(data)) {
    return { ok: false, code: "invalid_variant" };
  }

  if (variantLimit(data) > 0) {
    return { ok: false, code: "already_available" };
  }

  return { ok: true, value: { ...data, variantKey: variantKey(data) } };
};
