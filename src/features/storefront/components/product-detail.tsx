"use client";
import { useRef } from "react";
import { useFadeOnChange } from "../lib/fade-on-change";
import { useStorefront } from "../storefront-context";
import {
  itemPrice,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import {
  colourSoldOut,
  productOptions,
  swatchColours,
  withStock,
} from "../lib/product-options";
import { ColourSwatches, ProductHeading } from "./product-options";
import { ProductGallery } from "./product-gallery";
import { BundleBuilder } from "./bundle-builder";
import { ProductPurchase } from "./product-purchase";
import { ProductInformation } from "./product-information";
import { StickyBuyScope } from "./sticky-buy";
import { ProductSizeOptions } from "./product-size-options";

export function ProductDetail({ kind }: { kind: ProductKind }) {
  const infoRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const config = productOptions[kind];
  const {
    t,
    size,
    colour,
    active,
    chooseColour,
    setField,
    openSizeGuide,
    money,
  } = useStorefront((state) => ({
    t: state.t,
    size: state.fields[config.sizeField],
    colour: state.fields[config.colourField],
    active: state.categories.base === config.category,
    chooseColour: state.chooseColour,
    setField: state.setField,
    openSizeGuide: state.openSizeGuide,
    money: state.money,
  }));
  const variant: ProductVariant = { collection: "base", kind, colour, size };
  useFadeOnChange(paneRef, active, active);
  return (
    <StickyBuyScope>
      <div
        ref={paneRef}
        className="catalog-pane product-detail"
        id={`catalog-${config.category}`}
        hidden={!active}
      >
        <div className="product-layout">
          <ProductGallery kind={kind} />
          <div className="product-info" ref={infoRef}>
            <ProductHeading
              title={t(config.titleKey)}
              price={money(itemPrice(variant))}
            />
            <ColourSwatches
              options={config.colours.map((value) => ({
                value,
                label: t(value),
                fill: swatchColours[value],
                soldOut: colourSoldOut({ ...variant, colour: value }),
              }))}
              selected={colour}
              onSelect={(value) =>
                chooseColour(config.colourField, value, kind)
              }
            />
            <ProductSizeOptions
              kind={kind}
              options={withStock(config.sizes, variant)}
              selected={size}
              onSelect={(value) => setField(config.sizeField, value)}
              onOpenGuide={() =>
                openSizeGuide(kind, size, (value) =>
                  setField(config.sizeField, value),
                )
              }
            />
            <ProductPurchase
              active={active}
              infoRef={infoRef}
              variant={variant}
            />
            <ProductInformation collection="base" kind={kind} />
          </div>
        </div>
        <BundleBuilder kind={kind} />
      </div>
    </StickyBuyScope>
  );
}
