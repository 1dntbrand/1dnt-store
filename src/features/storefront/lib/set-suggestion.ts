import type {
  CartItem,
  Collection,
  ProductKind,
} from "@/domain/commerce/catalog";

export interface SetSuggestion {
  messageKey: string;
  href: string;
}

const categoryOf: Record<ProductKind, string> = {
  collar: "collars",
  leash: "leashes",
  harness: "harnesses",
};

function link(collection: Collection, kind: ProductKind) {
  const section = collection === "base" ? "collection" : "elegant";
  return `#${section}/${categoryOf[kind]}`;
}

/**
 * Suggest the one piece that unlocks the next set discount, following the
 * same rules as `calculateCart`: a leash pairs with a collar (and, in Base,
 * a harness) for 5%, and all three together give 10%.
 */
export function suggestSetItem(
  cart: readonly CartItem[],
): SetSuggestion | null {
  for (const collection of ["base", "elegant"] as const) {
    const kinds = new Set(
      cart
        .filter((item) => item.collection === collection)
        .map((item) => item.kind),
    );
    if (kinds.size === 0) continue;
    const leash = kinds.has("leash");
    const collar = kinds.has("collar");
    const harness = kinds.has("harness");
    const harnessPairs = collection === "base";

    if (!leash && (collar || (harnessPairs && harness)))
      return { messageKey: "setHintLeash", href: link(collection, "leash") };
    if (leash && !collar && !harness)
      return harnessPairs
        ? {
            messageKey: "setHintCollarOrHarness",
            href: link(collection, "collar"),
          }
        : { messageKey: "setHintCollar", href: link(collection, "collar") };
    if (leash && collar && !harness)
      return {
        messageKey: "setHintTrioHarness",
        href: link(collection, "harness"),
      };
    if (leash && harness && !collar)
      return {
        messageKey: "setHintTrioCollar",
        href: link(collection, "collar"),
      };
  }
  return null;
}
