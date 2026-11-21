"use client";

import { CheckIcon } from "./icons";
import {
  elegantColourIds,
  itemPrice,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  elegantColours,
  elegantProducts,
  elegantViews,
  type ElegantColour,
  type ElegantProduct,
} from "../data/elegant-products";
import { useStorefront } from "../storefront-context";
import { variantSizeOptions } from "../lib/product-options";
import type { FieldName } from "../lib/storage";
import { BundleOffer, type BundlePartSelection } from "./bundle-builder";
import { ProductPurchase } from "./product-purchase";
import { ProductSizeOptions } from "./product-size-options";
import { CollectionSwitch } from "./collection-switch";
import { MediaGallery } from "./media-gallery";
import { useTabIndicator } from "../lib/use-tab-indicator";
import { BrandText } from "./brand-text";
import { elegantLeashGuideId } from "./elegant-leash-guide";
import { ProductInformation } from "./product-information";

const imageSizes =
  "(max-width: 460px) calc(100vw - 40px), (max-width: 800px) 416px, (max-width: 1240px) 45vw, 560px";

const elegantFields = {
  collar: { colour: "elegantCollarColour", size: "elegantCollarSize" },
  leash: { colour: "elegantLeashColour", size: null },
  harness: { colour: "elegantHarnessColour", size: "elegantHarnessSize" },
} as const satisfies Record<
  ProductKind,
  { colour: FieldName; size: FieldName | null }
>;

function navigateToCategory(category: ElegantProduct["category"]) {
  window.location.hash = `elegant/${category}`;
}

export function Elegant() {
  const { t, tab } = useStorefront((state) => ({
    t: state.t,
    tab: state.categories.elegant,
  }));

  const tabs = useTabIndicator<HTMLDivElement>('[aria-selected="true"]', tab);

  function selectTab(category: ElegantProduct["category"]) {
    if (category !== tab) navigateToCategory(category);
  }

  function navigateTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = elegantProducts.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(elegantProducts[next].category);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }

  return (
    <section
      className="section elegant-section"
      id="elegant"
      aria-labelledby="elegantTitle"
    >
      <CollectionSwitch active="elegant" />
      <div className="catalog-heading">
        <h2 id="elegantTitle">
          <BrandText>{t("elegantCollectionTitle")}</BrandText>
        </h2>
      </div>
      <div
        ref={tabs}
        className="elegant-tabs"
        role="tablist"
        aria-labelledby="elegantTitle"
      >
        {elegantProducts.map(({ category, categoryKey }, index) => (
          <button
            key={category}
            type="button"
            role="tab"
            id={`elegant-tab-${category}`}
            aria-controls={`elegant-${category}`}
            aria-selected={tab === category}
            tabIndex={tab === category ? 0 : -1}
            data-elegant-tab={category}
            onClick={() => selectTab(category)}
            onKeyDown={(event) => navigateTab(event, index)}
          >
            {t(categoryKey)}
          </button>
        ))}
      </div>
      {elegantProducts.map((product) => (
        <ElegantProductPanel
          key={product.category}
          product={product}
          active={tab === product.category}
        />
      ))}
    </section>
  );
}

function ElegantProductPanel({
  product,
  active,
}: {
  product: ElegantProduct;
  active: boolean;
}) {
  const { kind } = product;
  const config = elegantFields[kind];
  const { t, money, openSizeGuide, openDialog, colour, size, setField } =
    useStorefront((state) => ({
      t: state.t,
      money: state.money,
      openSizeGuide: state.openSizeGuide,
      openDialog: state.openDialog,
      colour: state.fields[config.colour] as ElegantColour,
      size: config.size ? state.fields[config.size] : "1.5",
      setField: state.setField,
    }));
  const infoRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const [view, setView] = useState(0);
  const colourName = elegantColours[colour].label;
  const title = t(product.titleKey);
  const variant: ProductVariant = { collection: "elegant", kind, colour, size };
  const sizes = variantSizeOptions(variant);

  function setColour(value: string) {
    if (value === colour) return;
    setField(config.colour, value);
    setView(0);
  }

  function setSize(value: string) {
    if (config.size) setField(config.size, value);
  }

  return (
    <div
      id={`elegant-${product.category}`}
      role="tabpanel"
      aria-labelledby={`elegant-tab-${product.category}`}
      tabIndex={0}
      hidden={!active}
    >
      <div className="elegant-product">
        <MediaGallery
          className="elegant-gallery"
          photos={elegantViews.map(({ id, label }) => ({
            src: `/assets/${product.gallery[colour][id]}`,
            alt: `${title} · ${colourName} · ${t(label)}`,
            label: t(label),
          }))}
          index={view}
          onIndexChange={setView}
          sizes={imageSizes}
        />
        <div className="product-info" ref={infoRef}>
          <div className="product-heading">
            <h3>
              <BrandText>{title}</BrandText>
            </h3>
            <p className="product-price">{money(itemPrice(variant))}</p>
          </div>
          <p className="product-price-note">{t("vatShipping")}</p>
          <fieldset className="variant-group" ref={optionsRef} tabIndex={-1}>
            <legend>
              {t("colourLabel")} <span>{colourName}</span>
            </legend>
            <div className="swatches">
              {elegantColourIds.map((option) => (
                <button
                  key={option}
                  className="swatch"
                  type="button"
                  aria-label={elegantColours[option].label}
                  aria-pressed={colour === option}
                  onClick={() => setColour(option)}
                >
                  <span style={{ background: elegantColours[option].swatch }} />
                  {colour === option && (
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
            options={sizes}
            selected={size}
            onSelect={setSize}
            onOpenGuide={() =>
              kind === "leash"
                ? openDialog(elegantLeashGuideId)
                : openSizeGuide(kind, size, setSize)
            }
          />
          {kind === "leash" && (
            <p className="elegant-note">{t("elegantLeashLength")}</p>
          )}
          <ProductPurchase
            variant={variant}
            active={active}
            infoRef={infoRef}
            optionsRef={optionsRef}
          />
          <ProductInformation collection="elegant" kind={kind} />
        </div>
      </div>
      {kind !== "leash" && (
        <ElegantBundle
          primary={{
            variant,
            chooseColour: setColour,
            chooseSize: setSize,
          }}
        />
      )}
    </div>
  );
}

function ElegantBundle({ primary }: { primary: BundlePartSelection }) {
  const leashColourField =
    primary.variant.kind === "collar"
      ? "elegantCollarSetLeashColour"
      : "elegantHarnessSetLeashColour";
  const { leashColour, collarColour, collarSize, setField } = useStorefront(
    (state) => ({
      leashColour: state.fields[leashColourField],
      collarColour: state.fields.elegantTripleCollarColour,
      collarSize: state.fields.elegantTripleCollarSize,
      setField: state.setField,
    }),
  );

  return (
    <BundleOffer
      parts={[
        primary,
        {
          variant: {
            collection: "elegant",
            kind: "leash",
            colour: leashColour,
            size: "1.5",
          },
          chooseColour: (value) => setField(leashColourField, value),
        },
      ]}
      extra={
        primary.variant.kind === "harness"
          ? {
              variant: {
                collection: "elegant",
                kind: "collar",
                colour: collarColour,
                size: collarSize,
              },
              chooseColour: (value) =>
                setField("elegantTripleCollarColour", value),
              chooseSize: (value) => setField("elegantTripleCollarSize", value),
            }
          : undefined
      }
    />
  );
}
