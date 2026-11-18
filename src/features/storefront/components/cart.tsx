"use client";
import Image from "next/image";
import { useStorefront } from "../storefront-context";
import { productPhoto, itemPrice } from "../lib/catalog";
import { productOptions } from "../lib/product-options";
import { Dialog } from "./dialog";
import { BrandText } from "./brand-text";

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
  return (
    <ul className="cart-list">
      {cart.map((item) => (
        <li key={item.id} className="cart-item" data-cart-item>
          <div className="cart-photo">
            <Image
              src={productPhoto(item.kind, item.colour)}
              alt=""
              fill
              sizes="80px"
            />
          </div>
          <div className="cart-item-body">
            <h3>
              <BrandText>{t(productOptions[item.kind].titleKey)}</BrandText>
            </h3>
            <p>{choiceSummary(item.colour, item.size)}</p>
            {editable ? (
              <div className="cart-actions">
                <div className="quantity-control">
                  <button
                    type="button"
                    aria-label={`${t("decrease")} · ${t(productOptions[item.kind].titleKey)}`}
                    onClick={() => changeQuantity(item.id, item.qty - 1)}
                  >
                    −
                  </button>
                  <output aria-label={t("quantity")}>{item.qty}</output>
                  <button
                    type="button"
                    aria-label={`${t("increase")} · ${t(productOptions[item.kind].titleKey)}`}
                    disabled={item.qty >= 99}
                    onClick={() => changeQuantity(item.id, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-button cart-remove"
                  onClick={() => changeQuantity(item.id, 0)}
                >
                  {t("remove")}
                </button>
              </div>
            ) : (
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
                itemPrice(item) * item.qty - (pricing.discounts[item.id] ?? 0),
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
export function OrderTotals() {
  const { t, money, pricing } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    pricing: state.pricing,
    cartNotice: state.cartNotice,
  }));
  return (
    <div className="order-totals" aria-live="polite" aria-atomic="true">
      <div>
        <span>{t("cartSubtotal")}</span>
        <span>{money(pricing.subtotal)}</span>
      </div>
      {pricing.discount > 0 && (
        <div className="order-discount">
          <span>{t("setDiscounts")}</span>
          <span>−{money(pricing.discount)}</span>
        </div>
      )}
      <div>
        <span>InPost</span>
        <span>{t("included")}</span>
      </div>
      <div className="cart-subtotal">
        <span>{t("totalLabel")}</span>
        <strong>{money(pricing.total)}</strong>
      </div>
      <p className="field-hint">{t("vatShipping")}</p>
    </div>
  );
}
export function Cart() {
  const { t, cartCount, closeDialog, openDialog, pricing, cartNotice } =
    useStorefront((state) => ({
      t: state.t,
      cartCount: state.cartCount,
      closeDialog: state.closeDialog,
      openDialog: state.openDialog,
      pricing: state.pricing,
      cartNotice: state.cartNotice,
    }));
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
        <button
          type="button"
          className="icon-button close-button"
          aria-label={t("guideClose")}
          onClick={closeDialog}
        >
          ×
        </button>
      </div>
      {cartCount === 0 ? (
        <div className="cart-empty">
          <h3>{t("cartEmpty")}</h3>
          <p>{t("cartIntro")}</p>
          <a className="btn" href="#collection" onClick={closeDialog}>
            {t("cartBrowse")}
          </a>
        </div>
      ) : (
        <>
          <div className="cart-scroll">
            {cartNotice && (
              <p className="integration-notice" role="status">
                {t(cartNotice)}
              </p>
            )}
            <OrderItems editable />
            {pricing.discount > 0 && (
              <p className="cart-discount-message">{t("discountApplied")}</p>
            )}
          </div>
          <div className="cart-footer">
            <OrderTotals />
            <button
              type="button"
              className="btn"
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
