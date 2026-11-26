"use client";
import { ArrowIcon } from "./icons";
import Image from "next/image";
import { useStorefront } from "../storefront-context";
import { itemPrice, type CartItem } from "@/domain/commerce/catalog";
import { variantLimit } from "@/domain/commerce/availability";
import { variantPhoto } from "../lib/catalog";
import { productTitleKey } from "../lib/product-options";
import { suggestSetItem } from "../lib/set-suggestion";
import { groupBag, type BagItem, type BagSet } from "../lib/cart-groups";
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
  const { cart, pricing } = useStorefront((state) => ({
    cart: state.cart,
    pricing: state.pricing,
  }));
  return (
    <ul className="cart-list">
      {groupBag(cart, pricing.sets).map((group) =>
        group.type === "set" ? (
          <SetGroup key={group.key} group={group} editable={editable} />
        ) : (
          <CartLine key={group.key} group={group} editable={editable} />
        ),
      )}
    </ul>
  );
}

/** Folds a bag entry away before it leaves, so the change is seen. */
function foldEntry(event: MouseEvent<HTMLElement>, done: () => void) {
  const entry = event.currentTarget.closest("[data-cart-item]");
  foldAway(entry as HTMLElement | null, () => {
    // The pressed button leaves with its entry; focus stays in the bag.
    if (entry?.contains(document.activeElement))
      entry.closest("dialog")?.focus({ preventScroll: true });
    done();
  });
}

/** Photo, name and choice of one piece; shared by lines and sets. */
function PieceInfo({
  item,
  children,
}: {
  item: CartItem;
  children?: ReactNode;
}) {
  const { t, choiceSummary } = useStorefront((state) => ({
    t: state.t,
    choiceSummary: state.choiceSummary,
  }));
  const limit = variantLimit(item);
  return (
    <>
      <div className="cart-photo">
        <Image
          src={variantPhoto(item)}
          alt=""
          fill
          sizes="80px"
          {...blurProps(variantPhoto(item))}
        />
      </div>
      <div className="cart-item-body">
        <h3>
          <BrandText>{t(productTitleKey(item))}</BrandText>
        </h3>
        <p>{choiceSummary(item.colour, item.size)}</p>
        {item.qty > limit && (
          <p className="cart-stock-message">
            <span className="stock-pill">
              {limit === 0
                ? t("outOfStock")
                : `${t("cartAvailableQuantity")} ${limit}`}
            </span>
          </p>
        )}
        {children}
      </div>
    </>
  );
}

function Stepper({
  label,
  value,
  canAdd,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  canAdd: boolean;
  onDecrease: (event: MouseEvent<HTMLElement>) => void;
  onIncrease: () => void;
}) {
  const t = useStorefront((state) => state.t);
  return (
    <div className="quantity-control">
      <button
        type="button"
        aria-label={`${t("decrease")} · ${label}`}
        onClick={onDecrease}
      >
        −
      </button>
      <Figure as="output" label={t("quantity")} value={value}>
        {value}
      </Figure>
      <button
        type="button"
        aria-label={`${t("increase")} · ${label}`}
        disabled={!canAdd}
        onClick={onIncrease}
      >
        +
      </button>
    </div>
  );
}

/** A piece on its own: its units that are not part of any set. */
function CartLine({ group, editable }: { group: BagItem; editable: boolean }) {
  const { t, money, changeQuantity } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    changeQuantity: state.changeQuantity,
  }));
  const { item, qty } = group;
  const limit = variantLimit(item);
  const title = t(productTitleKey(item));
  const removeLoose = (event: MouseEvent<HTMLElement>) =>
    foldEntry(event, () => changeQuantity(item.id, item.qty - qty));
  return (
    <li
      className={editable ? "cart-item cart-item-editable" : "cart-item"}
      data-cart-item
      data-sold-out={limit === 0 || undefined}
    >
      <PieceInfo item={item}>
        {!editable && (
          <p>
            {t("quantity")}: {qty}
          </p>
        )}
      </PieceInfo>
      <div className="cart-line-price">
        <span>{money(itemPrice(item) * qty)}</span>
      </div>
      {editable && (
        <div className="cart-actions">
          <Stepper
            label={title}
            value={qty}
            canAdd={item.qty < limit}
            onDecrease={(event) =>
              qty > 1
                ? changeQuantity(item.id, item.qty - 1)
                : removeLoose(event)
            }
            onIncrease={() => changeQuantity(item.id, item.qty + 1)}
          />
          <button
            type="button"
            className="text-button cart-remove"
            onClick={removeLoose}
          >
            {t("remove")}
          </button>
        </div>
      )}
    </li>
  );
}

/**
 * Pieces bought as a set, read as one: what the set is, what it saves, and
 * one control for the whole set. Changing it changes every piece together.
 */
function SetGroup({ group, editable }: { group: BagSet; editable: boolean }) {
  const { t, money, cart, changeQuantities } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    cart: state.cart,
    changeQuantities: state.changeQuantities,
  }));
  const { members, count, rate } = group;
  const label = t("setAddedLine", { count: String(members.length) });
  const total = (id: string) => cart.find((item) => item.id === id)?.qty ?? 0;
  const shift = (by: number) =>
    changeQuantities(
      members.map((member) => ({ id: member.id, qty: total(member.id) + by })),
    );
  const removeAll = (event: MouseEvent<HTMLElement>) =>
    foldEntry(event, () => shift(-count));
  const canAdd = members.every(
    (member) => total(member.id) < variantLimit(member),
  );
  return (
    <li
      className="cart-set"
      data-cart-item
      data-sold-out={
        members.some((member) => variantLimit(member) === 0) || undefined
      }
    >
      <div className="cart-set-head">
        <h3>{label}</h3>
        <span className="cart-set-rate">−{Math.round(rate * 100)}%</span>
      </div>
      <ul className="cart-set-pieces">
        {members.map((member) => (
          <li key={member.id} className="cart-item cart-set-piece">
            <PieceInfo item={member} />
          </li>
        ))}
      </ul>
      <div className="cart-set-foot">
        {editable ? (
          <div className="cart-actions">
            <Stepper
              label={label}
              value={count}
              canAdd={canAdd}
              onDecrease={(event) => (count > 1 ? shift(-1) : removeAll(event))}
              onIncrease={() => shift(1)}
            />
            <button
              type="button"
              className="text-button cart-remove"
              onClick={removeAll}
            >
              {t("remove")}
            </button>
          </div>
        ) : (
          <p className="cart-item-quantity">
            {t("quantity")}: {count}
          </p>
        )}
        <div className="cart-line-price">
          <s>{money(group.original)}</s>
          <span>{money(group.total)}</span>
        </div>
      </div>
    </li>
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
        <Figure value={pricing.shipping}>{money(pricing.shipping)}</Figure>
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
