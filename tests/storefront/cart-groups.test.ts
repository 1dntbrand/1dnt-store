import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateCart,
  variantKey,
  type CartItem,
  type ProductVariant,
} from "../../src/domain/commerce/catalog";
import { groupBag } from "../../src/features/storefront/lib/cart-groups";

const line = (variant: ProductVariant, qty = 1): CartItem => ({
  ...variant,
  id: variantKey(variant),
  qty,
});
const leash = line({
  collection: "base",
  kind: "leash",
  colour: "black",
  size: "1.5",
});
const collar = line({
  collection: "base",
  kind: "collar",
  colour: "khaki",
  size: "S",
});
const harness = line({
  collection: "base",
  kind: "harness",
  colour: "orange",
  size: "M",
});
const elegantCollar = line({
  collection: "elegant",
  kind: "collar",
  colour: "dark-brown",
  size: "S",
});

const bag = (cart: CartItem[]) => {
  const pricing = calculateCart(cart);
  return { pricing, groups: groupBag(cart, pricing.sets) };
};

test("a leash and a collar read as one 5% set, leash first", () => {
  const { groups, pricing } = bag([collar, leash]);
  assert.equal(groups.length, 1);
  const [set] = groups;
  assert.equal(set.type, "set");
  if (set.type !== "set") return;
  assert.equal(set.rate, 0.05);
  assert.deepEqual(
    set.members.map((member) => member.kind),
    ["leash", "collar"],
  );
  assert.equal(set.original - set.total, pricing.discount);
});

test("all three make one 10% set; nothing is left over", () => {
  const { groups } = bag([leash, collar, harness]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].type === "set" && groups[0].rate, 0.1);
});

test("identical sets merge, extra units stay as plain lines", () => {
  const { groups, pricing } = bag([
    { ...leash, qty: 2 },
    { ...collar, qty: 3 },
  ]);
  const sets = groups.filter((group) => group.type === "set");
  const loose = groups.filter((group) => group.type === "item");
  assert.equal(sets.length, 1);
  assert.equal(sets[0].type === "set" && sets[0].count, 2);
  assert.deepEqual(
    loose.map((group) => group.type === "item" && [group.item.id, group.qty]),
    [[collar.id, 1]],
  );
  const setDiscount = sets.reduce(
    (sum, group) =>
      group.type === "set" ? sum + group.original - group.total : sum,
    0,
  );
  assert.equal(setDiscount, pricing.discount);
});

test("collections never mix: an Elegant collar does not join a Base leash", () => {
  const { groups } = bag([leash, elegantCollar]);
  assert.ok(groups.every((group) => group.type === "item"));
});

test("every unit in the bag appears exactly once", () => {
  const cart = [
    { ...leash, qty: 3 },
    { ...collar, qty: 1 },
    { ...harness, qty: 2 },
    elegantCollar,
  ];
  const { groups } = bag(cart);
  const units = new Map<string, number>();
  for (const group of groups)
    if (group.type === "set")
      for (const member of group.members)
        units.set(member.id, (units.get(member.id) ?? 0) + group.count);
    else units.set(group.item.id, (units.get(group.item.id) ?? 0) + group.qty);
  for (const item of cart) assert.equal(units.get(item.id), item.qty);
});
