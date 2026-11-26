import {
  itemPrice,
  type CartItem,
  type CartSet,
  type ProductKind,
} from "@/domain/commerce/catalog";

/** Sets show leash first, then collar, then harness, the order they are worn. */
const kindOrder: Record<ProductKind, number> = {
  leash: 0,
  collar: 1,
  harness: 2,
};

export interface BagSet {
  type: "set";
  key: string;
  rate: number;
  /** How many identical sets: two of the same trio show once, as ×2. */
  count: number;
  members: CartItem[];
  /** Full price of the sets and what the shopper pays for them. */
  original: number;
  total: number;
}

export interface BagItem {
  type: "item";
  key: string;
  item: CartItem;
  /** Units of this item outside any set. */
  qty: number;
}

/**
 * The bag as the shopper should read it: every discounted set as one group,
 * identical sets merged, and whatever is left as ordinary lines. Built only
 * from the sets the price calculation made, so it always matches the total.
 */
export function groupBag(cart: CartItem[], sets: CartSet[]) {
  const byId = new Map(cart.map((item) => [item.id, item]));
  const used = new Map<string, number>();
  const groups = new Map<string, BagSet>();
  for (const set of sets) {
    const members = set.ids
      .map((id) => byId.get(id))
      .filter((item): item is CartItem => !!item)
      .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
    if (members.length !== set.ids.length) continue;
    for (const member of members)
      used.set(member.id, (used.get(member.id) ?? 0) + 1);
    const key = `${set.rate}:${members.map((member) => member.id).join("+")}`;
    const original = members.reduce((sum, item) => sum + itemPrice(item), 0);
    const total =
      original -
      members.reduce(
        (sum, item) => sum + Math.round(itemPrice(item) * set.rate),
        0,
      );
    const group = groups.get(key);
    if (group) {
      group.count += 1;
      group.original += original;
      group.total += total;
    } else
      groups.set(key, {
        type: "set",
        key,
        rate: set.rate,
        count: 1,
        members,
        original,
        total,
      });
  }
  const loose: BagItem[] = cart.flatMap((item) => {
    const qty = item.qty - (used.get(item.id) ?? 0);
    return qty > 0 ? [{ type: "item" as const, key: item.id, item, qty }] : [];
  });
  return [...groups.values(), ...loose];
}
