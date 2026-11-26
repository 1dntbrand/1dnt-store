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
import {
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
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
  // A set starts as a card file: its pieces stacked, each name showing.
  const [open, setOpen] = useState(false);
  const piecesId = useId();
  return (
    <li
      className="cart-set"
      data-cart-item
      data-collapsed={!open || undefined}
      data-sold-out={
        members.some((member) => variantLimit(member) === 0) || undefined
      }
    >
      <h3 className="cart-set-head">
        <button
          type="button"
          className="cart-set-toggle"
          aria-expanded={open}
          aria-controls={piecesId}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{label}</span>
          <span className="cart-set-meta">
            <span className="cart-set-rate">−{Math.round(rate * 100)}%</span>
            <span className="disclosure-chevron" aria-hidden="true" />
          </span>
        </button>
      </h3>
      {/* A tap on the stack opens it too; the button above is the control
          for keyboards and screen readers. */}
      <ul
        id={piecesId}
        className="cart-set-pieces"
        onClick={open ? undefined : () => setOpen(true)}
      >
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
/** The order's amounts; the bag pins its total separately, so it can leave it out. */
export function OrderTotals({ withTotal = true }: { withTotal?: boolean }) {
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
      {withTotal && (
        <div className="cart-subtotal">
          <span>{t("totalLabel")}</span>
          <Figure as="strong" value={pricing.grandTotal}>
            {money(pricing.grandTotal)}
          </Figure>
        </div>
      )}
      <p className="field-hint">{t("vatIncluded")}</p>
    </div>
  );
}

/** The amount to pay, pinned beside the checkout button. */
/**
 * The pinned end of the bag: what to pay and the button to pay it. The
 * total doubles as the switch for the breakdown that unfolds above it,
 * folded on phones and short screens so the pieces keep the room, open
 * on large ones.
 * Delivery is always counted in, and a saving is named right away.
 */
function CheckoutBar({
  disabled,
  onCheckout,
}: {
  disabled: boolean;
  onCheckout: () => void;
}) {
  const { t, money, pricing } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    pricing: state.pricing,
  }));
  // Lines only render in the browser (the bag is restored there), so the
  // screen size is known when this first renders.
  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 641px) and (min-height: 720px)").matches,
  );
  const breakdownId = useId();
  return (
    <>
      <div
        id={breakdownId}
        className="cart-breakdown"
        data-open={open || undefined}
        inert={!open}
      >
        <div>
          <OrderTotals withTotal={false} />
        </div>
      </div>
      {/* The total's own line carries the switch for the breakdown above. */}
      <div className="cart-total-head">
        <span className="cart-total-label">{t("totalLabel")}</span>
        <button
          type="button"
          className="cart-breakdown-toggle"
          aria-expanded={open}
          aria-controls={breakdownId}
          onClick={() => setOpen((value) => !value)}
        >
          {t(open ? "breakdownHide" : "breakdownShow")}
          <span className="disclosure-chevron" aria-hidden="true" />
        </button>
      </div>
      <div className="cart-total-bar">
        <p className="cart-total">
          <Figure as="strong" value={pricing.grandTotal}>
            {money(pricing.grandTotal)}
          </Figure>
          <span className="cart-total-note" aria-live="polite">
            {pricing.discount > 0
              ? `${t("saveLabel")}${money(pricing.discount)}`
              : t("totalWithDelivery")}
          </span>
        </p>
        <button
          type="button"
          className="btn"
          disabled={disabled}
          onClick={onCheckout}
        >
          {t("checkoutAction")}
        </button>
      </div>
    </>
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

/* The same upright shots as the catalogue's category previews: each piece
   whole in the 4:5 frame. */
const emptyBagPicks = [
  {
    href: "#collection/collars",
    src: "/assets/collar-orange.webp",
    label: "cat_collars",
  },
  {
    href: "#collection/leashes",
    src: "/assets/leash-khaki.webp",
    label: "cat_leashes",
  },
  {
    href: "#collection/harnesses",
    src: "/assets/harness-black-orange.webp",
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
            <div className="cart-summary">
              <SetSuggestionNote />
              <button
                type="button"
                className="text-button continue-shopping"
                onClick={closeDialog}
              >
                {t("continueShopping")}
              </button>
            </div>
          </div>
          <div className="cart-footer">
            {cartHasStockIssue && (
              <p className="cart-stock-message state-in" role="status">
                {t("cartStockIssue")}
              </p>
            )}
            <CheckoutBar
              disabled={cartHasStockIssue}
              onCheckout={() => openDialog("checkoutPanel")}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
