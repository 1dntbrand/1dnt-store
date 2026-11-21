"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { variantLimit } from "@/domain/commerce/availability";
import { itemPrice, type ProductVariant } from "@/domain/commerce/catalog";
import { productBundleId } from "../lib/product-options";
import { useStorefront } from "../storefront-context";
import { RestockForm } from "./restock-form";
import { useRecentlyAdded } from "../lib/use-recently-added";

const dockMedia = "(max-width: 800px) and (min-height: 480px)";

type DockAction = "choose" | "buy";

function useDockAction(
  active: boolean,
  infoRef: RefObject<HTMLDivElement | null>,
  actionRef: RefObject<HTMLDivElement | null>,
  bundleId: string | null,
) {
  const [dockAction, setDockAction] = useState<DockAction | null>(null);

  useEffect(() => {
    if (!active || !("IntersectionObserver" in window)) return;
    const info = infoRef.current;
    const action = actionRef.current;
    if (!info || !action) return;

    const bundle = bundleId ? document.getElementById(bundleId) : null;
    const media = window.matchMedia(dockMedia);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const bounds = entry.rootBounds;
        if (!media.matches || !bounds) return;
        const infoRect = info.getBoundingClientRect();
        const bundleRect = bundle?.getBoundingClientRect();
        const bundleVisible =
          bundleRect &&
          bundleRect.top < bounds.bottom &&
          bundleRect.bottom > bounds.top;
        if (
          bundleVisible ||
          infoRect.bottom <= bounds.top ||
          infoRect.top >= bounds.bottom
        ) {
          setDockAction(null);
          return;
        }
        const actionRect = action.getBoundingClientRect();
        setDockAction(
          actionRect.top >= bounds.bottom
            ? "choose"
            : actionRect.bottom <= bounds.top
              ? "buy"
              : null,
        );
      },
      { rootMargin: "-68px 0px -84px" },
    );

    const updateObservation = () => {
      observer.disconnect();
      if (media.matches) {
        observer.observe(info);
        observer.observe(action);
        if (bundle) observer.observe(bundle);
      } else {
        setDockAction(null);
      }
    };
    updateObservation();
    media.addEventListener("change", updateObservation);
    return () => {
      media.removeEventListener("change", updateObservation);
      observer.disconnect();
    };
  }, [active, infoRef, actionRef, bundleId]);

  return active ? dockAction : null;
}

function jumpTo(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: "start" });
}

export function ProductPurchase({
  variant,
  buttonId,
  active,
  infoRef,
  optionsRef,
}: {
  variant: ProductVariant;
  buttonId?: string;
  active: boolean;
  infoRef: RefObject<HTMLDivElement | null>;
  optionsRef: RefObject<HTMLFieldSetElement | null>;
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
  const dockAction = useDockAction(active, infoRef, actionRef, bundleId);
  const unavailable = variantLimit(variant) === 0;
  const price = money(itemPrice(variant));
  const canBuyFromDock = dockAction === "buy" && !unavailable;
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
            <span>{justAdded ? "✓" : price}</span>
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
      {dockAction && (
        <div className="purchase-dock">
          <div className="purchase-dock-summary">
            <strong>{unavailable ? t("outOfStock") : price}</strong>
            <span>{choiceSummary(variant.colour, variant.size)}</span>
          </div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (canBuyFromDock) addItems([variant]);
              else jumpTo(optionsRef.current);
            }}
          >
            {justAdded
              ? `${t("addedToBag")} ✓`
              : t(canBuyFromDock ? "addCart" : "chooseVariant")}
          </button>
        </div>
      )}
    </>
  );
}
