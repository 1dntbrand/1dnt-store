import {
  calculateCart,
  type CartItem,
  isProductVariant,
  variantKey,
} from "./catalog";

import { variantLimit } from "./availability";

export type QuoteCartResult =
  | { ok: true; items: CartItem[]; pricing: ReturnType<typeof calculateCart> }
  | {
      ok: false;
      code:
        | "invalid_cart"
        | "invalid_variant"
        | "invalid_quantity"
        | "out_of_stock"
        | "quantity_limit";
    };

const MAX_CART_ROWS = 99;

export const quoteCart = (input: unknown): QuoteCartResult => {
  const qtyArray = new Map<string, CartItem>();
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > MAX_CART_ROWS
  ) {
    return {
      ok: false,
      code: "invalid_cart",
    };
  }

  for (const row of input as unknown[]) {
    if (!isProductVariant(row)) {
      return { ok: false, code: "invalid_variant" };
    }

    const qty = "qty" in row ? row.qty : undefined;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) {
      return { ok: false, code: "invalid_quantity" };
    }

    const key = variantKey(row);

    const totalQty = (qtyArray.get(key)?.qty ?? 0) + qty;
    qtyArray.set(key, {
      id: key,
      qty: totalQty,
      collection: row.collection,
      kind: row.kind,
      colour: row.colour,
      size: row.size,
    });
  }

  const items = [...qtyArray.values()];
  for (const item of items) {
    const limit = variantLimit(item);
    if (limit === 0) return { ok: false, code: "out_of_stock" };

    if (item.qty > limit) return { ok: false, code: "quantity_limit" };
  }

  return { ok: true, items, pricing: calculateCart(items) };
};
