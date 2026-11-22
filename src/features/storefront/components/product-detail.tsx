"use client";
import { CheckIcon } from "./icons";
import { useRef } from "react";
import { useStorefront } from "../storefront-context";
import { prices, type ProductKind } from "@/domain/commerce/catalog";
import { productOptions, swatchColours } from "../lib/product-options";
import { BrandText } from "./brand-text";
import { ProductGallery } from "./product-gallery";
import { BundleBuilder } from "./bundle-builder";
import { ProductPurchase } from "./product-purchase";
import { ProductInformation } from "./product-information";
import { ProductSizeOptions } from "./product-size-options";

export function ProductDetail({ kind }: { kind: ProductKind }) {
  const infoRef = useRef<HTMLDivElement>(null);
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
  return (
    <div
      className="catalog-pane product-detail"
      id={`catalog-${config.category}`}
      hidden={!active}
    >
      <div className="product-layout">
        <ProductGallery kind={kind} />
        <div className="product-info" ref={infoRef}>
          <div className="product-heading">
            <h3>
              <BrandText>{t(config.titleKey)}</BrandText>
            </h3>
            <p className="product-price">{money(prices[kind][size])}</p>
          </div>
          <p className="product-price-note">{t("vatShipping")}</p>
          <fieldset className="variant-group">
            <legend>
              {t("colourLabel")} <span>{t(colour)}</span>
            </legend>
            <div className="swatches">
              {config.colours.map((value) => (
                <button
                  key={value}
                  className="swatch"
                  type="button"
                  aria-label={t(value)}
                  aria-pressed={colour === value}
                  onClick={() => chooseColour(config.colourField, value, kind)}
                >
                  <span style={{ background: swatchColours[value] }} />
                  {colour === value && (
                    <span className="swatch-check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          <ProductSizeOptions
            kind={kind}
            options={config.sizes}
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
            variant={{ collection: "base", kind, colour, size }}
            buttonId={`add${kind[0].toUpperCase()}${kind.slice(1)}`}
          />
          <ProductInformation collection="base" kind={kind} />
        </div>
      </div>
      <BundleBuilder kind={kind} />
    </div>
  );
}
