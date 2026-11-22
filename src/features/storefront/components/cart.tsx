"use client";
import { ArrowIcon } from "./icons";
import Image from "next/image";
import { useStorefront } from "../storefront-context";
import { itemPrice } from "@/domain/commerce/catalog";
import { variantLimit } from "@/domain/commerce/availability";
import {
  FREE_SHIPPING_THRESHOLD,
  freeShippingRemaining,
} from "@/domain/commerce/shipping";
import { variantPhoto } from "../lib/catalog";
import { productTitleKey } from "../lib/product-options";
import { suggestSetItem } from "../lib/set-suggestion";
import { Dialog } from "./dialog";
import { CloseButton } from "./close-button";
import { BrandText } from "./brand-text";
import { foldAway } from "../lib/exit-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { useFadeOnChange, useTickOnChange } from "../lib/fade-on-change";
import { blurProps } from "../lib/image-placeholder";

/** A number in the bag that ticks when the shopper changes it. */
function Figure({
  value,
  as: Tag = "span",
  label,
  className,
  children,
}: {
  value: unknown;
  as?: "span" | "strong" | "output";
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useTickOnChange(ref, value);
  return (
    <Tag
      ref={ref as never}
      className={className ? `figure ${className}` : "figure"}
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

export function OrderItems({ editable = false }: { editable?: boolean }) {
  const { cart, pricing, t, money, choiceSummary, changeQuantity } =
    useStorefront((state) => ({
      cart: state.cart,
      pricing: state.pricing,
      t: state.t,
      money: state.money,
      choiceSummary: state.choiceSummary,
      changeQuantity: state.changeQuantity,
    }));
  // The line folds away before it leaves the list, so the change is seen.
  const removeLine = (event: MouseEvent<HTMLElement>, id: string) => {
    const line = event.currentTarget.closest("li");
    foldAway(line, () => {
      // The pressed button leaves with its line; focus stays in the bag.
      if (line?.contains(document.activeElement))
        line.closest("dialog")?.focus({ preventScroll: true });
      changeQuantity(id, 0);
    });
  };
  return (
    <ul className="cart-list">
      {cart.map((item) => {
        const limit = variantLimit(item);
        const title = t(productTitleKey(item));
        return (
          <li
            key={item.id}
            className={editable ? "cart-item cart-item-editable" : "cart-item"}
            data-cart-item
          >
            <div className="cart-photo">
              <Image src={variantPhoto(item)} alt="" fill sizes="80px" />
            </div>
            <div className="cart-item-body">
              <h3>
                <BrandText>{title}</BrandText>
              </h3>
              <p>{choiceSummary(item.colour, item.size)}</p>
              {item.qty > limit && (
                <p className="cart-stock-message">
                  {limit === 0
                    ? t("outOfStock")
                    : `${t("cartAvailableQuantity")} ${limit}`}
                </p>
              )}
              {!editable && (
                <p>
                  {t("quantity")}: {item.qty}
                </p>
              )}
            </div>
            <div className="cart-line-price">
              {pricing.discounts[item.id] > 0 && (
                <s>{money(itemPrice(item) * item.qty)}</s>
              )}
              <span>
                {money(
                  itemPrice(item) * item.qty -
                    (pricing.discounts[item.id] ?? 0),
                )}
              </span>
            </div>
            {editable && (
              <div className="cart-actions">
                <div className="quantity-control">
                  <button
                    type="button"
                    aria-label={`${t("decrease")} · ${title}`}
                    onClick={(event) =>
                      item.qty > 1
                        ? changeQuantity(item.id, item.qty - 1)
                        : removeLine(event, item.id)
                    }
                  >
                    −
                  </button>
                  <Figure as="output" label={t("quantity")} value={item.qty}>
                    {item.qty}
                  </Figure>
                  <button
                    type="button"
                    aria-label={`${t("increase")} · ${title}`}
                    disabled={item.qty >= limit}
                    onClick={() => changeQuantity(item.id, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-button cart-remove"
                  onClick={(event) => removeLine(event, item.id)}
                >
                  {t("remove")}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
export function OrderTotals() {
  const { t, money, pricing } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    pricing: state.pricing,
  }));
  const discountRow = useRef<HTMLDivElement>(null);
  useFadeOnChange(discountRow, pricing.discount > 0);
  return (
    <div className="order-totals" aria-live="polite" aria-atomic="true">
      <div>
        <span>{t("cartSubtotal")}</span>
        <Figure value={pricing.subtotal}>{money(pricing.subtotal)}</Figure>
      </div>
      {pricing.discount > 0 && (
        <div className="order-discount" ref={discountRow}>
          <span>{t("setDiscounts")}</span>
          <Figure value={pricing.discount}>−{money(pricing.discount)}</Figure>
        </div>
      )}
      <div>
        <span>{t("deliveryInpost")}</span>
        <Figure
          value={pricing.shipping}
          className={pricing.shipping === 0 ? "free-shipping" : undefined}
        >
          {pricing.shipping === 0 ? t("freeShipping") : money(pricing.shipping)}
        </Figure>
      </div>
      <div className="cart-subtotal">
        <span>{t("totalLabel")}</span>
        <Figure as="strong" value={pricing.grandTotal}>
          {money(pricing.grandTotal)}
        </Figure>
      </div>
      <p className="field-hint">{t("vatIncluded")}</p>
    </div>
  );
}

/** Points to the one piece that unlocks the next set discount. */
function SetSuggestionNote() {
  const { t, cart, closeDialog } = useStorefront((state) => ({
    t: state.t,
    cart: state.cart,
    closeDialog: state.closeDialog,
  }));
  const suggestion = suggestSetItem(cart);
  if (!suggestion) return null;
  return (
    <p className="set-suggestion">
      <span>{t(suggestion.messageKey)}</span>
      <a href={suggestion.href} onClick={closeDialog}>
        {t("setHintAction")}
        <ArrowIcon />
      </a>
    </p>
  );
}

/** Shows how close the bag is to free delivery; set discounts count first. */
export function FreeShippingProgress() {
  const { t, money, total } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    total: state.pricing.total,
  }));
  const remaining = freeShippingRemaining(total);
  const progress = Math.min(1, total / FREE_SHIPPING_THRESHOLD);
  return (
    <div
      className="free-shipping-progress"
      data-complete={remaining === 0 || undefined}
    >
      <p role="status">
        {remaining === 0
          ? t("freeShippingReached")
          : t("freeShippingRemaining", { amount: money(remaining) })}
      </p>
      <span className="free-shipping-track" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>
    </div>
  );
}
const emptyBagPicks = [
  {
    href: "#collection/collars",
    src: "/assets/collar-khaki.webp",
    label: "cat_collars",
  },
  {
    href: "#collection/leashes",
    src: "/assets/leash-black.webp",
    label: "cat_leashes",
  },
  {
    href: "#collection/harnesses",
    src: "/assets/harness-khaki.webp",
    label: "cat_harnesses",
  },
];

export function Cart() {
  const {
    t,
    cartCount,
    closeDialog,
    openDialog,
    cartNotice,
    cartHasStockIssue,
  } = useStorefront((state) => ({
    t: state.t,
    cartCount: state.cartCount,
    closeDialog: state.closeDialog,
    openDialog: state.openDialog,
    cartNotice: state.cartNotice,
    cartHasStockIssue: state.cartHasStockIssue,
  }));
  const empty = useRef<HTMLDivElement>(null);
  useFadeOnChange(empty, cartCount === 0);
  return (
    <Dialog
      id="cartPanel"
      className="site-panel cart-panel"
      labelledBy="cartPanelTitle"
    >
      <div className="panel-top">
        <h2 id="cartPanelTitle">
          {t("cartTitle")}{" "}
          <span className="cart-heading-count">({cartCount})</span>
        </h2>
        <CloseButton label={t("guideClose")} onClick={closeDialog} />
      </div>
      {cartCount === 0 ? (
        <div className="cart-empty" ref={empty}>
          <h3>{t("cartEmpty")}</h3>
          <p>{t("cartIntro")}</p>
          <p className="cart-empty-label">{t("emptyBagPick")}</p>
          <div className="cart-empty-picks">
            {emptyBagPicks.map(({ href, src, label }) => (
              <a
                key={href}
                className="cart-empty-pick"
                href={href}
                onClick={closeDialog}
              >
                <span className="cart-empty-photo">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    {...blurProps(src)}
                  />
                </span>
                <span>{t(label)}</span>
              </a>
            ))}
          </div>
          <p className="cart-empty-offer">{t("catalogSetOffer")}</p>
          <a className="btn" href="#collection" onClick={closeDialog}>
            {t("cartBrowse")}
          </a>
        </div>
      ) : (
        <>
          <div className="cart-scroll">
            {cartNotice && (
              <p className="integration-notice state-in" role="status">
                {t(cartNotice)}
              </p>
            )}
            <OrderItems editable />
          </div>
          <div className="cart-footer">
            <SetSuggestionNote />
            <FreeShippingProgress />
            <OrderTotals />
            {cartHasStockIssue && (
              <p className="cart-stock-message state-in" role="status">
                {t("cartStockIssue")}
              </p>
            )}
            <button
              type="button"
              className="btn"
              disabled={cartHasStockIssue}
              onClick={() => openDialog("checkoutPanel")}
            >
              {t("checkoutAction")}
            </button>
            <button
              type="button"
              className="text-button continue-shopping"
              onClick={closeDialog}
            >
              {t("continueShopping")}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
