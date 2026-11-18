"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { variantLimit } from "@/domain/commerce/availability";
import {
  calculateCart,
  PAIR_DISCOUNT,
  TRIO_DISCOUNT,
  variantColours,
  variantKey,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { variantPhoto } from "../lib/catalog";
import {
  productOptions,
  productTitleKey,
  variantColourLabel,
  variantSizeOptions,
} from "../lib/product-options";
import type { FieldName } from "../lib/storage";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { RestockForm } from "./restock-form";

export type BundlePartSelection = {
  variant: ProductVariant;
  chooseColour: (colour: string) => void;
  chooseSize?: (size: string) => void;
};

export function BundleBuilder({ kind }: { kind: ProductKind }) {
  const { fields, setField } = useStorefront((state) => ({
    fields: state.fields,
    setField: state.setField,
  }));
  const current = productOptions[kind];
  const part = (
    kind: ProductKind,
    colourField: FieldName,
    sizeField: FieldName,
  ): BundlePartSelection => ({
    variant: {
      collection: "base",
      kind,
      colour: fields[colourField],
      size: fields[sizeField],
    },
    chooseColour: (colour) => setField(colourField, colour),
    chooseSize: (size) => setField(sizeField, size),
  });
  const primary = part(kind, current.colourField, current.sizeField);
  if (kind === "leash") {
    return (
      <BundleOffer
        parts={[primary, part("collar", "collarBundleColour", "collarSize")]}
      />
    );
  }
  const leash =
    kind === "collar"
      ? part("leash", "collarSetLeashColour", "collarSetLeashLength")
      : part("leash", "harnessSetLeashColour", "harnessSetLeashLength");

  return (
    <BundleOffer
      parts={[primary, leash]}
      extra={
        kind === "harness"
          ? part("collar", "tripleCollarColour", "tripleCollarSize")
          : undefined
      }
      includeExtraInitially
    />
  );
}

export function BundleOffer({
  parts,
  extra,
  includeExtraInitially = false,
}: {
  parts: readonly BundlePartSelection[];
  extra?: BundlePartSelection;
  includeExtraInitially?: boolean;
}) {
  const [includeExtra, setIncludeExtra] = useState(includeExtraInitially);
  const { t, money, addItems } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    addItems: state.addItems,
  }));
  const id = useId();
  const selected = extra && includeExtra ? [...parts, extra] : parts;
  const variants = selected.map(({ variant }) => variant);
  const pricing = calculateCart(
    variants.map((variant) => ({
      ...variant,
      id: variantKey(variant),
      qty: 1,
    })),
  );
  const rate = pricing.trios
    ? TRIO_DISCOUNT
    : pricing.pairs
      ? PAIR_DISCOUNT
      : 0;
  const unavailable = variants.some((variant) => variantLimit(variant) === 0);

  return (
    <section className="bundle-builder" aria-labelledby={id}>
      <div className="bundle-heading">
        <div>
          <h4 id={id}>{t("buildYourSet")}</h4>
          <p>{t("mixHarnessSet")}</p>
        </div>
        {rate > 0 && <span className="bundle-discount">−{rate * 100}%</span>}
      </div>
      {extra && (
        <label className="bundle-extra">
          <input
            type="checkbox"
            checked={includeExtra}
            onChange={(event) => setIncludeExtra(event.target.checked)}
          />
          <span>{t("includeCollar")}</span>
        </label>
      )}
      <div
        className="bundle-parts"
        style={{
          gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))`,
        }}
      >
        {selected.map((part) => (
          <BundlePart key={part.variant.kind} {...part} />
        ))}
      </div>
      <div className="bundle-bottom">
        <div>
          {pricing.discount > 0 && (
            <span className="bundle-original">{money(pricing.subtotal)}</span>
          )}
          <strong>{money(pricing.total)}</strong>
          {pricing.discount > 0 && (
            <span className="bundle-saving">
              {t("saveLabel")}
              {money(pricing.discount)}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn"
          disabled={unavailable}
          onClick={() => addItems(variants)}
        >
          {t("addSetToCart")}
        </button>
      </div>
      <div role="status" className="stock-announcement">
        {unavailable && (
          <p className="field-hint bundle-stock-note">
            {t("bundleStockIssue")}
          </p>
        )}
      </div>
    </section>
  );
}

function BundlePart({
  variant,
  chooseColour,
  chooseSize,
}: BundlePartSelection) {
  const t = useStorefront((state) => state.t);
  const { collection, kind, colour, size } = variant;
  const title = t(productTitleKey(variant));

  return (
    <div className="bundle-part">
      <div className="bundle-part-heading">
        <div className="bundle-photo">
          <Image src={variantPhoto(variant)} alt="" fill sizes="64px" />
        </div>
        <h5>
          <BrandText>{title}</BrandText>
        </h5>
      </div>
      <div className="bundle-fields">
        <label>
          {t("colourLabel")}
          <select
            value={colour}
            onChange={(event) => chooseColour(event.target.value)}
          >
            {variantColours(collection, kind).map((value) => (
              <option key={value} value={value}>
                {variantColourLabel(value, t)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(kind === "leash" ? "lengthLabel" : "sizeOnly")}
          <select
            value={size}
            disabled={!chooseSize}
            onChange={(event) => chooseSize?.(event.target.value)}
          >
            {variantSizeOptions(variant).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.detail ? ` · ${option.detail}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {variantLimit(variant) === 0 && (
        <details className="bundle-restock">
          <summary className="stock-label">
            {t("outOfStock")} · {t("restockAction")}
          </summary>
          <RestockForm variant={variant} />
        </details>
      )}
    </div>
  );
}
