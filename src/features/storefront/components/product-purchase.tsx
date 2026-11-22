"use client";

import { CheckIcon, UnavailableIcon } from "./icons";
import { useRef, type RefObject } from "react";
import { variantLimit } from "@/domain/commerce/availability";
import { itemPrice, type ProductVariant } from "@/domain/commerce/catalog";
import { productBundleId } from "../lib/product-options";
import { useStorefront } from "../storefront-context";
import { RestockForm } from "./restock-form";
import { StickyBuy } from "./sticky-buy";
import { scrollBehavior } from "../lib/motion";
import { useRecentlyAdded } from "../lib/use-recently-added";

function jumpTo(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  // Glide to the set builder so the shopper sees where they went.
  element.scrollIntoView({ block: "start", behavior: scrollBehavior() });
}

export function ProductPurchase({
  variant,
  active,
  infoRef,
}: {
  variant: ProductVariant;
  active: boolean;
  infoRef: RefObject<HTMLDivElement | null>;
}) {
  const { t, money, addItems, openService } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    addItems: state.addItems,
    openService: state.openService,
  }));
  const actionRef = useRef<HTMLDivElement>(null);
  const hasBundle = variant.collection === "base" || variant.kind !== "leash";
  const bundleId = hasBundle ? productBundleId(variant) : null;
  const unavailable = variantLimit(variant) === 0;
  const price = money(itemPrice(variant));
  const justAdded = useRecentlyAdded([variant]);

  return (
    <>
      <div className="product-purchase" ref={actionRef}>
        {unavailable ? (
          <>
            {/* Same place and size as Add to Cart: the state is unmistakable.
                The chosen colour and size are right above, so it names
                neither. */}
            <div className="sold-out-cta" role="status">
              <UnavailableIcon />
              {t("outOfStock")}
            </div>
            <RestockForm variant={variant} />
          </>
        ) : (
          <button
            className="btn add-product"
            type="button"
            data-added={justAdded || undefined}
            onClick={() => addItems([variant])}
          >
            <span>{t(justAdded ? "addedToBag" : "addCart")}</span>
            <span>{justAdded ? <CheckIcon /> : price}</span>
          </button>
        )}
      </div>
      {!unavailable && <p className="product-dispatch">{t("madeToOrder")}</p>}
      <div className="product-quick-links">
        {bundleId && (
          <button
            className="text-button"
            type="button"
            onClick={() => jumpTo(document.getElementById(bundleId))}
          >
            {t("buildYourSet")}
          </button>
        )}
        <button
          className="text-button"
          type="button"
          onClick={() => openService("returns")}
        >
          {t("productReturnPolicy")}
        </button>
      </div>
      <StickyBuy
        active={active}
        variant={variant}
        available={!unavailable}
        regionRef={infoRef}
        buttonRef={actionRef}
      />
    </>
  );
}
