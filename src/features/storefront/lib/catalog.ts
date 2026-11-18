export const languages = ["en", "pl", "ru", "uk"] as const;
export type Language = (typeof languages)[number];
export const colours = [
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
export const PAIR_DISCOUNT = 0.05;
export const TRIO_DISCOUNT = 0.1;

export interface CartItem {
  id: string;
  kind: ProductKind;
  colour: string;
  size: string;
  qty: number;
}

export function productPhoto(kind: ProductKind, colour: string, view = 0) {
  if (colour === "black-orange" && view > 0)
    return "/assets/black-orange-lifestyle.webp";
  const suffix =
    kind === "collar" ? ["", "-left", "-right"][view] : ["", "-walk"][view];
  return `/assets/${kind}-${colour}${suffix ?? ""}.webp`;
}

export function itemPrice(item: CartItem) {
  return prices[item.kind][item.size];
}

export function setPrices(
  kind: "collar" | "harness",
  length: string,
  size: string,
) {
  const accessory = prices[kind][size];
  const leash = leashPrices[length];
  const original = accessory + leash;
  const saving = Math.round(original * PAIR_DISCOUNT);
  return {
    collar: accessory,
    harness: accessory,
    leash,
    collarDiscounted: accessory - Math.round(accessory * PAIR_DISCOUNT),
    harnessDiscounted: accessory - Math.round(accessory * PAIR_DISCOUNT),
    leashDiscounted: leash - Math.round(leash * PAIR_DISCOUNT),
    original,
    total: original - saving,
    saving,
  };
}

/** Allocate each unit once, giving full sets priority, then eligible pairs. */
export function calculateCart(items: CartItem[]) {
  const remaining = new Map(items.map((item) => [item.id, item.qty]));
  const discounts: Record<string, number> = {};
  const byKind = (kind: ProductKind) =>
    items
      .filter((item) => item.kind === kind)
      .sort((a, b) => itemPrice(b) - itemPrice(a) || a.id.localeCompare(b.id));
  const leashes = byKind("leash");
  const collars = byKind("collar");
  const harnesses = byKind("harness");
  const count = (group: CartItem[]) =>
    group.reduce((sum, item) => sum + remaining.get(item.id)!, 0);
  const allocate = (group: CartItem[], units: number, rate: number) => {
    let left = units;
    for (const item of group) {
      const quantity = Math.min(left, remaining.get(item.id)!);
      discounts[item.id] =
        (discounts[item.id] ?? 0) +
        Math.round(itemPrice(item) * rate) * quantity;
      remaining.set(item.id, remaining.get(item.id)! - quantity);
      left -= quantity;
    }
  };
  const trios = Math.min(count(leashes), count(collars), count(harnesses));
  for (const group of [leashes, collars, harnesses])
    allocate(group, trios, TRIO_DISCOUNT);
  const accessories = [...collars, ...harnesses].sort(
    (a, b) => itemPrice(b) - itemPrice(a) || a.id.localeCompare(b.id),
  );
  const pairs = Math.min(count(leashes), count(accessories));
  allocate(leashes, pairs, PAIR_DISCOUNT);
  allocate(accessories, pairs, PAIR_DISCOUNT);
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
    trios,
    pairs,
  };
}

export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return (
    typeof item.id === "string" &&
    ["collar", "leash", "harness"].includes(item.kind) &&
    colours.includes(item.colour as (typeof colours)[number]) &&
    (item.kind !== "collar" ||
      !["khaki-orange", "black-orange"].includes(item.colour)) &&
    Object.hasOwn(prices[item.kind], item.size) &&
    Number.isInteger(item.qty) &&
    item.qty > 0 &&
    item.qty <= 99
  );
}

export function triplePrices(length: string, size: string, collarSize: string) {
  const harness = harnessPrices[size];
  const leash = leashPrices[length];
  const collar = collarPrices[collarSize];
  const original = harness + leash + collar;
  const total = Math.round(original * (1 - TRIO_DISCOUNT));
  return {
    harness,
    leash,
    collar,
    collarDiscounted: Math.round(collar * (1 - TRIO_DISCOUNT)),
    original,
    total,
    saving: original - total,
    harnessDiscounted: Math.round(harness * (1 - TRIO_DISCOUNT)),
    leashDiscounted: Math.round(leash * (1 - TRIO_DISCOUNT)),
  };
}
