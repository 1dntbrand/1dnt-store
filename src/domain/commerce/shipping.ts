/**
 * Delivery to an InPost pickup point in Poland, in grosze.
 * The store sets this price: the InPost widget only selects a point,
 * and the server passes the amount to Stripe Checkout.
 */
export const SHIPPING_PRICE = 1699;

/** Every order pays the same delivery price; an empty bag pays nothing. */
export function shippingFor(itemsTotal: number) {
  return itemsTotal > 0 ? SHIPPING_PRICE : 0;
}
