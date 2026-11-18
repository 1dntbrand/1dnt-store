"use client";

import Image from "next/image";
import {
  elegantColourIds,
  itemPrice,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  elegantColours,
  elegantProducts,
  elegantViews,
  type ElegantColour,
  type ElegantProduct,
  type ElegantView,
} from "../data/elegant-products";
import { useStorefront } from "../storefront-context";
import { variantSizeOptions } from "../lib/product-options";
import { BundleOffer, type BundlePartSelection } from "./bundle-builder";
import { ProductPurchase } from "./product-purchase";
import { ProductSizeOptions } from "./product-size-options";
import { CollectionSwitch } from "./collection-switch";

const imageSizes =
  "(max-width: 460px) calc(100vw - 40px), (max-width: 800px) 416px, (max-width: 1240px) 45vw, 560px";

export function Elegant() {
  const t = useStorefront((state) => state.t);
  const [tab, setTab] = useState<ElegantProduct["category"]>("leashes");

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
    setTab(elegantProducts[next].category);
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
        <h2 id="elegantTitle">Elegant</h2>
      </div>
      <div
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
            onClick={() => setTab(category)}
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
  const { t, money, openSizeGuide } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    openSizeGuide: state.openSizeGuide,
  }));
  const { kind } = product;
  const infoRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const [size, setSize] = useState(kind === "leash" ? "1.5" : "S");
  const [colour, setColour] = useState<ElegantColour>("dark-brown");
  const [view, setView] = useState<ElegantView>("product");
  const colourName = elegantColours[colour].label;
  const photo = product.gallery[colour][view];
  const title = t(product.titleKey);
  const variant: ProductVariant = { collection: "elegant", kind, colour, size };
  const sizes = variantSizeOptions(variant);

  return (
    <div
      id={`elegant-${product.category}`}
      role="tabpanel"
      aria-labelledby={`elegant-tab-${product.category}`}
      tabIndex={0}
      hidden={!active}
    >
      <div className="elegant-product">
        <div>
          <div className="elegant-main">
            <Image
              src={`/assets/${photo}`}
              alt={`${title} · ${colourName} · ${t(view === "product" ? "galleryProduct" : "galleryWalk")}`}
              width={1122}
              height={1402}
              sizes={imageSizes}
            />
          </div>
          <div
            className="gallery-thumbs"
            role="group"
            aria-label={t("productPhotos")}
          >
            {elegantViews.map(({ id, label }) => (
              <button
                key={id}
                className="gallery-thumb"
                type="button"
                aria-label={t(label)}
                aria-pressed={view === id}
                onClick={() => setView(id)}
              >
                <Image
                  src={`/assets/${product.gallery[colour][id]}`}
                  alt=""
                  fill
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info" ref={infoRef}>
          <div className="product-heading">
            <h3>{title}</h3>
            <p className="product-price">{money(itemPrice(variant))}</p>
          </div>
          <p className="product-intro">{t(product.descriptionKey)}</p>
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
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          {kind === "leash" ? (
            <p className="elegant-note">{t("elegantLeashLength")}</p>
          ) : (
            <ProductSizeOptions
              kind={kind}
              options={sizes}
              selected={size}
              onSelect={setSize}
              onOpenGuide={() => openSizeGuide(kind, size, setSize)}
            />
          )}
          <ProductPurchase
            variant={variant}
            active={active}
            infoRef={infoRef}
            optionsRef={optionsRef}
          />
          <dl className="elegant-specs">
            {"woodenHandle" in product && (
              <div className="elegant-spec">
                <dt>{t("elegantHandle")}</dt>
                <dd>{t("elegantWood")}</dd>
              </div>
            )}
            <div className="elegant-spec">
              <dt>{t("elegantHardware")}</dt>
              <dd>Antique Brass</dd>
            </div>
          </dl>
        </div>
      </div>
      {kind !== "leash" && (
        <ElegantBundle
          primary={{
            variant,
            chooseColour: (value) => setColour(value as ElegantColour),
            chooseSize: setSize,
          }}
        />
      )}
    </div>
  );
}

function ElegantBundle({ primary }: { primary: BundlePartSelection }) {
  const [leashColour, setLeashColour] = useState("dark-brown");
  const [collarColour, setCollarColour] = useState("dark-brown");
  const [collarSize, setCollarSize] = useState("S");

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
          chooseColour: setLeashColour,
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
              chooseColour: setCollarColour,
              chooseSize: setCollarSize,
            }
          : undefined
      }
    />
  );
}
