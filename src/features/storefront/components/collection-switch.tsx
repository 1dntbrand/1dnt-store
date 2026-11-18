"use client";

import type { Collection } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";

export function CollectionSwitch({ active }: { active: Collection }) {
  const t = useStorefront((state) => state.t);

  return (
    <nav className="collection-switch" aria-label={t("menuCollections")}>
      <a
        href="#collection"
        aria-current={active === "base" ? "location" : undefined}
      >
        Base BioThane®
      </a>
      <a
        href="#elegant"
        aria-current={active === "elegant" ? "location" : undefined}
      >
        Elegant
      </a>
    </nav>
  );
}
