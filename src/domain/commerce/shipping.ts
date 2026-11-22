/**
 * Delivery to an InPost pickup point in Poland, in grosze.
 * The store sets this price: the InPost widget only selects a point,
 * and the server passes the amount to Stripe Checkout.
 */
export const SHIPPING_PRICE = 1699;

/** Orders whose discounted item total reaches this amount ship free. */
export const FREE_SHIPPING_THRESHOLD = 50000;

export function shippingFor(itemsTotal: number) {
  if (itemsTotal <= 0) return 0;
  return itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
}

/** Amount still needed for free delivery, or 0 once it applies. */
export function freeShippingRemaining(itemsTotal: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - itemsTotal);
}
