"use client";
import { useStorefront } from "../storefront-context";
import { prices, type ProductKind } from "../lib/catalog";
import { productOptions, swatchColours } from "../lib/product-options";
import { BrandText } from "./brand-text";
import { ProductGallery } from "./product-gallery";
import { BundleBuilder } from "./bundle-builder";
import { ProductSafety } from "./product-safety";

export function ProductDetail({ kind }: { kind: ProductKind }) {
  const config = productOptions[kind];
  const {
    t,
    fields,
    category,
    chooseColour,
    setField,
    openSizeGuide,
    money,
    addItem,
  } = useStorefront((state) => ({
    t: state.t,
    fields: state.fields,
    category: state.category,
    chooseColour: state.chooseColour,
    setField: state.setField,
    openSizeGuide: state.openSizeGuide,
    money: state.money,
    addItem: state.addItem,
  }));
  const size = fields[config.sizeField];
  const colour = fields[config.colourField];
  return (
    <div
      className="catalog-pane product-detail"
      id={`catalog-${config.category}`}
      hidden={category !== config.category}
    >
      <div className="product-layout">
        <ProductGallery kind={kind} />
        <div className="product-info">
          <div className="product-heading">
            <h3>
              <BrandText>{t(config.titleKey)}</BrandText>
            </h3>
            <p className="product-price">{money(prices[kind][size])}</p>
          </div>
          <p className="product-intro">{t(config.introKey)}</p>
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
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="variant-group">
            <legend className="sr-only">
              {t(kind === "leash" ? "lengthLabel" : "sizeOnly")}
            </legend>
            <div className="variant-label-row">
              <span>{t(kind === "leash" ? "lengthLabel" : "sizeOnly")}</span>
              <button
                className="text-button size-help"
                type="button"
                onClick={() => openSizeGuide(kind, config.sizeField)}
              >
                {t("sizeGuideLabel")}
              </button>
            </div>
            <div
              className="size-options"
              style={{
                gridTemplateColumns: `repeat(${config.sizes.length}, minmax(0, 1fr))`,
              }}
            >
              {config.sizes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={size === option.value}
                  onClick={() => setField(config.sizeField, option.value)}
                >
                  <span>{option.label}</span>
                  {option.detail && <small>{option.detail}</small>}
                </button>
              ))}
            </div>
            {kind === "harness" && (
              <p className="field-hint">{t("harnessMeasureHint")}</p>
            )}
          </fieldset>
          <button
            id={`add${kind[0].toUpperCase()}${kind.slice(1)}`}
            className="btn add-product"
            type="button"
            onClick={() => addItem(kind)}
          >
            <span>{t("addCart")}</span>
            <span>{money(prices[kind][size])}</span>
          </button>
          <p className="product-dispatch">{t("madeToOrder")}</p>
          <ProductInformation kind={kind} />
        </div>
      </div>
      <BundleBuilder kind={kind} />
    </div>
  );
}

function ProductInformation({ kind }: { kind: ProductKind }) {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const features = [
    "baseWebbing",
    "baseWaterproof",
    "baseOdourFeature",
    "baseVegan",
    "baseHandmade",
    "baseEasyCare",
  ];
  return (
    <div className="product-information">
      <details>
        <summary>{t("baseDescriptionTitle")}</summary>
        <p>{t("baseDescription")}</p>
      </details>
      <details>
        <summary>{t("baseFeaturesTitle")}</summary>
        <ul>
          {features.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
          <li>
            {t(kind === "leash" ? "baseLeashAdjustable" : "baseAdjustable")}
          </li>
          {kind !== "leash" && <li>{t("fidlockFeature")}</li>}
        </ul>
      </details>
      <details>
        <summary>{t("baseCareTitle")}</summary>
        <p>{t("baseCare")}</p>
      </details>
      <ProductSafety />
    </div>
  );
}
