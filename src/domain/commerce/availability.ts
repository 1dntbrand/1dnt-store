import { variantKey, type ProductVariant } from "./catalog";

// Quantities maintained in code. Omitted variants are made to order.
// Each key is collection/product/colour/size (or leash length in metres).
const stock: Readonly<Record<string, number>> = {
  "elegant/collar/coyote-brown/S": 0,
  "elegant/collar/coyote-brown/M": 0,
  "elegant/collar/coyote-brown/L": 0,
  "elegant/leash/coyote-brown/1.5": 0,
  "elegant/harness/coyote-brown/S": 0,
  "elegant/harness/coyote-brown/M": 0,
  "elegant/harness/coyote-brown/L": 0,
};

export const cartLineLimit = 99;

export function variantLimit(variant: ProductVariant) {
  return Math.min(stock[variantKey(variant)] ?? cartLineLimit, cartLineLimit);
}
