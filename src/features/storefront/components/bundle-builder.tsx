"use client";

import { CheckIcon } from "./icons";
import Image from "next/image";
import { useRecentlyAdded } from "../lib/use-recently-added";
import { useId, useRef } from "react";
import { usePublishSetOffer } from "./sticky-buy";
import { SwapLabel } from "./swap-label";
import { Disclosure, DisclosureGroup } from "./disclosure";
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
  productBundleId,
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
  const { fields, setField, chooseColour } = useStorefront((state) => ({
    fields: state.fields,
    setField: state.setField,
    chooseColour: state.chooseColour,
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
    chooseColour: (colour) => {
      if (colourField === current.colourField)
        chooseColour(colourField, colour, kind);
      else setField(colourField, colour);
    },
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
    />
  );
}

export function BundleOffer({
  parts,
  extra,
}: {
  parts: readonly BundlePartSelection[];
  extra?: BundlePartSelection;
}) {
  const { collection } = parts[0].variant;
  const { t, money, addItems, includeExtra, setBundleExtra } = useStorefront(
    (state) => ({
      t: state.t,
      money: state.money,
      addItems: state.addItems,
      includeExtra: extra ? state.bundleExtras[collection] : false,
      setBundleExtra: state.setBundleExtra,
    }),
  );
  const id = useId();
  const selected = extra && includeExtra ? [...parts, extra] : parts;
  const variants = selected.map(({ variant }) => variant);
  const justAdded = useRecentlyAdded(variants);
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
  const section = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  usePublishSetOffer({
    variants,
    total: pricing.total,
    rate,
    available: !unavailable,
    section,
    button,
  });

  return (
    <section
      ref={section}
      className="bundle-builder"
      id={productBundleId(parts[0].variant)}
      aria-labelledby={id}
      tabIndex={-1}
    >
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
            onChange={(event) =>
              setBundleExtra(collection, event.target.checked)
            }
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
        <DisclosureGroup>
          {selected.map((part) => (
            <BundlePart key={part.variant.kind} {...part} />
          ))}
        </DisclosureGroup>
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
          ref={button}
          type="button"
          className="btn"
          disabled={unavailable}
          data-added={justAdded || undefined}
          onClick={() => addItems(variants)}
        >
          <SwapLabel
            shown={justAdded ? 1 : 0}
            options={[
              t("addSetToCart"),
              <>
                <CheckIcon />
                {t("addedToBag")}
              </>,
            ]}
          />
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
  const { t, choiceSummary } = useStorefront((state) => ({
    t: state.t,
    choiceSummary: state.choiceSummary,
  }));
  const { collection, kind, colour, size } = variant;
  const title = t(productTitleKey(variant));

  return (
    <div className="bundle-part">
      <Disclosure
        className="bundle-part-options"
        summaryClassName="bundle-part-heading"
        contentClassName="bundle-fields"
        summary={
          <>
            <span className="bundle-photo">
              <Image src={variantPhoto(variant)} alt="" fill sizes="48px" />
            </span>
            <span className="bundle-part-summary">
              <span className="bundle-part-title">
                <BrandText>{title}</BrandText>
              </span>
              <span className="bundle-part-choice">
                {choiceSummary(colour, size)}
              </span>
            </span>
            <span className="disclosure-chevron" aria-hidden="true" />
          </>
        }
      >
        <label>
          {t("colourLabel")}
          <select
            className="select-control"
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
            className="select-control"
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
      </Disclosure>
      {variantLimit(variant) === 0 && (
        <Disclosure
          className="bundle-restock"
          summaryClassName="stock-label"
          summary={`${t("outOfStock")} · ${t("restockAction")}`}
        >
          <RestockForm variant={variant} />
        </Disclosure>
      )}
    </div>
  );
}
