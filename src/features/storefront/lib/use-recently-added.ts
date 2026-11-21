"use client";

import { useEffect, useState } from "react";
import { variantKey, type ProductVariant } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";

const CONFIRM_MS = 1800;

/** True for a moment after these exact variants were added to the bag. */
export function useRecentlyAdded(variants: readonly ProductVariant[]) {
  const lastAdded = useStorefront((state) => state.lastAdded);
  const key = variants.map(variantKey).join("|");
  const matches =
    lastAdded !== null && lastAdded.variants.map(variantKey).join("|") === key;
  const stamp = matches ? lastAdded.stamp : null;
  const [expired, setExpired] = useState<number | null>(null);

  useEffect(() => {
    if (stamp === null) return;
    const timer = window.setTimeout(() => setExpired(stamp), CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [stamp]);

  return stamp !== null && expired !== stamp;
}
