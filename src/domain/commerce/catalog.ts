const baseColours = [
  "black",
  "khaki",
  "orange",
  "khaki-orange",
  "black-orange",
] as const;
export type ProductKind = "collar" | "leash" | "harness";
export const collarPrices: Record<string, number> = {
  S: 15000,
  M: 17000,
  L: 19000,
};
export const harnessPrices: Record<string, number> = {
  S: 23000,
  M: 25000,
  L: 31000,
};
export const leashPrices: Record<string, number> = {
  "1.5": 13000,
  "2.5": 19000,
};
export const prices = {
  collar: collarPrices,
  harness: harnessPrices,
  leash: leashPrices,
};
export const collections = ["base", "elegant"] as const;
export type Collection = (typeof collections)[number];

const collarColours = ["black", "khaki", "orange"] as const;
export const elegantColourIds = ["dark-brown", "coyote-brown"] as const;

const collectionPrices = {
  base: prices,
  elegant: {
    collar: { S: 15000, M: 17000, L: 19000 },
    leash: { "1.5": 13000 },
    harness: { S: 23000, M: 25000, L: 31000 },
  },
} satisfies Record<Collection, Record<ProductKind, Record<string, number>>>;

export interface ProductVariant {
  collection: Collection;
  kind: ProductKind;
  colour: string;
  size: string;
}

export interface CartItem extends ProductVariant {
  id: string;
  qty: number;
}

export function variantColours(
  collection: Collection,
  kind: ProductKind,
): readonly string[] {
  if (collection === "elegant") return elegantColourIds;
  return kind === "collar" ? collarColours : baseColours;
}

export function variantPrices(
  collection: Collection,
  kind: ProductKind,
): Readonly<Record<string, number>> {
  return collectionPrices[collection][kind];
}

export function isProductVariant(value: unknown): value is ProductVariant {
  if (!value || typeof value !== "object") return false;
  const variant = value as Partial<ProductVariant>;
  const { collection, kind, colour, size } = variant;
  return (
    (collection === "base" || collection === "elegant") &&
    (kind === "collar" || kind === "leash" || kind === "harness") &&
    typeof colour === "string" &&
    typeof size === "string" &&
    variantColours(collection, kind).includes(colour) &&
    Object.hasOwn(variantPrices(collection, kind), size)
  );
}

export function variantKey({ collection, kind, colour, size }: ProductVariant) {
  return `${collection}/${kind}/${colour}/${size}`;
}

export function itemPrice(variant: ProductVariant) {
  return variantPrices(variant.collection, variant.kind)[variant.size];
}

export const PAIR_DISCOUNT = 0.05;
export const TRIO_DISCOUNT = 0.1;

function priceCollection(items: CartItem[], collection: Collection) {
  const remaining = new Map(items.map((item) => [item.id, item.qty]));
  const discounts: Record<string, number> = {};
  const byPrice = (a: CartItem, b: CartItem) =>
    itemPrice(b) - itemPrice(a) || a.id.localeCompare(b.id);
  const byKind = (kind: ProductKind) =>
    items.filter((item) => item.kind === kind).sort(byPrice);
  const leashes = byKind("leash");
  const collars = byKind("collar");
  const harnesses = byKind("harness");
  const count = (group: CartItem[]) =>
    group.reduce((sum, item) => sum + remaining.get(item.id)!, 0);
  const groupsByItemId: Record<string, { qty: number; unitAmount: number }[]> =
    {};
  const allocate = (group: CartItem[], units: number, rate: number) => {
    let left = units;
    for (const item of group) {
      if (!left) break;
      const available = remaining.get(item.id)!;
      const quantity = Math.min(left, available);

      discounts[item.id] =
        (discounts[item.id] ?? 0) +
        Math.round(itemPrice(item) * rate) * quantity;
      remaining.set(item.id, available - quantity);
      left -= quantity;
      const discountPerUnit = Math.round(itemPrice(item) * rate);

      if (quantity > 0) {
        (groupsByItemId[item.id] ??= []).push({
          qty: quantity,
          unitAmount: itemPrice(item) - discountPerUnit,
        });
      }
    }
  };
  const trios = Math.min(count(leashes), count(collars), count(harnesses));
  for (const group of [leashes, collars, harnesses])
    allocate(group, trios, TRIO_DISCOUNT);
  const accessories =
    collection === "elegant"
      ? collars
      : [...collars, ...harnesses].sort(byPrice);
  const pairs = Math.min(count(leashes), count(accessories));
  allocate(leashes, pairs, PAIR_DISCOUNT);
  allocate(accessories, pairs, PAIR_DISCOUNT);
  for (const item of items) {
    const qty = remaining.get(item.id) ?? 0;
    if (qty > 0) {
      (groupsByItemId[item.id] ??= []).push({
        qty,
        unitAmount: itemPrice(item),
      });
    }
  }
  return { discounts, trios, pairs, groupsByItemId };
}

/** Allocate each unit once, within its own collection. */
export function calculateCart(items: CartItem[]) {
  const base = priceCollection(
    items.filter((item) => item.collection === "base"),
    "base",
  );
  const elegant = priceCollection(
    items.filter((item) => item.collection === "elegant"),
    "elegant",
  );
  const discounts = { ...base.discounts, ...elegant.discounts };
  const subtotal = items.reduce(
    (sum, item) => sum + itemPrice(item) * item.qty,
    0,
  );
  const discount = Object.values(discounts).reduce(
    (sum, value) => sum + value,
    0,
  );
  return {
    subtotal,
    discount,
    total: subtotal - discount,
    discounts,
    trios: base.trios + elegant.trios,
    pairs: base.pairs + elegant.pairs,
    groupsByItemId: { ...base.groupsByItemId, ...elegant.groupsByItemId },
  };
}
