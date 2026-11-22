"use client";

import type { MouseEvent } from "react";
import type { Collection } from "@/domain/commerce/catalog";
import type { Category } from "./storage";

/**
 * Switches a collection's category in place. The address is updated with
 * replaceState so the link stays shareable, without a history entry per tab
 * and without the hash handler's dialog closing and scrolling.
 */
export function showCategory(
  setCategory: (collection: Collection, category: Category) => void,
  collection: Collection,
  category: Category,
) {
  setCategory(collection, category);
  const section = collection === "base" ? "collection" : "elegant";
  window.history.replaceState(
    window.history.state,
    "",
    `#${section}/${category}`,
  );
}

/** Plain clicks switch in place; new-tab and modified clicks keep the link. */
export function isPlainClick(event: MouseEvent<HTMLElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
