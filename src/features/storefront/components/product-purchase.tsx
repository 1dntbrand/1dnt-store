"use client";

import { CheckIcon } from "./icons";
import { useEffect, useRef, useState, type RefObject } from "react";
import { variantLimit } from "@/domain/commerce/availability";
import { itemPrice, type ProductVariant } from "@/domain/commerce/catalog";
import { productBundleId } from "../lib/product-options";
import { useStorefront } from "../storefront-context";
import { RestockForm } from "./restock-form";
import { useRecentlyAdded } from "../lib/use-recently-added";

const dockMedia = "(max-width: 800px) and (min-height: 480px)";

/**
 * The dock repeats the main button while the shopper reads this product's
 * details below it: it shows once the button has passed under the header and
 * leaves when the details give way to the set builder or the next section.
 * A 24px band between the show and hide points keeps small scroll movements
 * from toggling it.
 */
const HYSTERESIS = 24;

function useDockVisible(
  active: boolean,
  infoRef: RefObject<HTMLDivElement | null>,
  actionRef: RefObject<HTMLDivElement | null>,
) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    const media = window.matchMedia(dockMedia);
    let shown = false;
    let frame = 0;
    const show = (next: boolean) => {
      if (next === shown) return;
      shown = next;
      setVisible(next);
    };
    const update = () => {
      frame = 0;
      const info = infoRef.current;
      const action = actionRef.current;
      if (!media.matches || !info || !action) return show(false);
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .bottom ?? 0;
      const band = shown ? HYSTERESIS : -HYSTERESIS;
      const buttonPassed =
        action.getBoundingClientRect().bottom < headerBottom + band;
      const stillReading =
        info.getBoundingClientRect().bottom > window.innerHeight * 0.5 - band;
      show(buttonPassed && stillReading);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      show(false);
    };
  }, [active, infoRef, actionRef]);

  return active && visible;
}

function jumpTo(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  // Glide to the set builder so the shopper sees where they went.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    block: "start",
    behavior: reduce ? "auto" : "smooth",
  });
}

export function ProductPurchase({
  variant,
  buttonId,
  active,
  infoRef,
}: {
  variant: ProductVariant;
  buttonId?: string;
  active: boolean;
  infoRef: RefObject<HTMLDivElement | null>;
}) {
  const { t, money, choiceSummary, addItems, openService } = useStorefront(
    (state) => ({
      t: state.t,
      money: state.money,
      choiceSummary: state.choiceSummary,
      addItems: state.addItems,
      openService: state.openService,
    }),
  );
  const actionRef = useRef<HTMLDivElement>(null);
  const hasBundle = variant.collection === "base" || variant.kind !== "leash";
  const bundleId = hasBundle ? productBundleId(variant) : null;
  const dockVisible = useDockVisible(active, infoRef, actionRef);
  const unavailable = variantLimit(variant) === 0;
  const price = money(itemPrice(variant));
  const justAdded = useRecentlyAdded([variant]);

  return (
    <>
      <div className="product-purchase" ref={actionRef}>
        <div className="stock-announcement" role="status">
          {unavailable && (
            <span className="stock-label">{t("outOfStock")}</span>
          )}
        </div>
        {unavailable ? (
          <RestockForm variant={variant} />
        ) : (
          <button
            id={buttonId}
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
      {active && !unavailable && (
        <div
          className="purchase-dock"
          data-visible={dockVisible || undefined}
          aria-hidden={!dockVisible}
          inert={!dockVisible}
        >
          <div className="purchase-dock-summary">
            <strong>{price}</strong>
            <span>{choiceSummary(variant.colour, variant.size)}</span>
          </div>
          <button
            className="btn"
            type="button"
            data-added={justAdded || undefined}
            onClick={() => addItems([variant])}
          >
            {justAdded ? (
              <>
                <CheckIcon />
                {t("addedToBag")}
              </>
            ) : (
              t("addCart")
            )}
          </button>
        </div>
      )}
    </>
  );
}
