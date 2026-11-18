"use client";

import { variantLimit } from "@/domain/commerce/availability";
import { itemPrice, type ProductVariant } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";
import { RestockForm } from "./restock-form";

export function ProductPurchase({
  variant,
  buttonId,
}: {
  variant: ProductVariant;
  buttonId?: string;
}) {
  const { t, money, addItems } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    addItems: state.addItems,
  }));
  const unavailable = variantLimit(variant) === 0;

  return (
    <>
      <div className="stock-announcement" role="status">
        {unavailable && <span className="stock-label">{t("outOfStock")}</span>}
      </div>
      {unavailable ? (
        <RestockForm variant={variant} />
      ) : (
        <>
          <button
            id={buttonId}
            className="btn add-product"
            type="button"
            onClick={() => addItems([variant])}
          >
            <span>{t("addCart")}</span>
            <span>{money(itemPrice(variant))}</span>
          </button>
          <p className="product-dispatch">{t("madeToOrder")}</p>
        </>
      )}
    </>
  );
}
