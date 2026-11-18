"use client";
import Image from "next/image";
import { useState } from "react";
import { useStorefront } from "../storefront-context";
import { productPhoto, setPrices, type ProductKind } from "../lib/catalog";
import { productOptions } from "../lib/product-options";
import type { FieldName } from "../lib/storage";
import { BrandText } from "./brand-text";

interface BundlePart {
  kind: ProductKind;
  colourField: FieldName;
  sizeField: FieldName;
}

export function BundleBuilder({ kind }: { kind: ProductKind }) {
  const [includeCollar, setIncludeCollar] = useState(true);
  const {
    t,
    fields,
    money,
    bundlePrices,
    collarSetPrices,
    harnessSetPrices,
    addItem,
  } = useStorefront((state) => ({
    t: state.t,
    fields: state.fields,
    money: state.money,
    bundlePrices: state.bundlePrices,
    collarSetPrices: state.collarSetPrices,
    harnessSetPrices: state.harnessSetPrices,
    addItem: state.addItem,
  }));
  const current = productOptions[kind];
  const parts: BundlePart[] = [
    { kind, colourField: current.colourField, sizeField: current.sizeField },
  ];
  if (kind === "leash")
    parts.push({
      kind: "collar",
      colourField: "collarBundleColour",
      sizeField: "collarSize",
    });
  else
    parts.push({
      kind: "leash",
      colourField:
        kind === "collar" ? "collarSetLeashColour" : "harnessSetLeashColour",
      sizeField:
        kind === "collar" ? "collarSetLeashLength" : "harnessSetLeashLength",
    });
  if (kind === "harness" && includeCollar)
    parts.push({
      kind: "collar",
      colourField: "tripleCollarColour",
      sizeField: "tripleCollarSize",
    });
  let pricing = kind === "collar" ? collarSetPrices : bundlePrices;
  if (kind === "harness")
    pricing = includeCollar
      ? harnessSetPrices
      : setPrices("harness", fields.harnessSetLeashLength, fields.harnessSize);
  const rate = parts.length === 3 ? 10 : 5;
  const action =
    kind === "leash"
      ? "set"
      : kind === "collar"
        ? "collar-set"
        : includeCollar
          ? "harness-set"
          : "harness-pair";
  return (
    <section
      className="bundle-builder"
      aria-labelledby={`${kind}-bundle-title`}
    >
      <div className="bundle-heading">
        <div>
          <h4 id={`${kind}-bundle-title`}>{t("buildYourSet")}</h4>
          <p>{t("mixHarnessSet")}</p>
        </div>
        <span className="bundle-discount">−{rate}%</span>
      </div>
      {kind === "harness" && (
        <label className="bundle-extra">
          <input
            type="checkbox"
            checked={includeCollar}
            onChange={(event) => setIncludeCollar(event.target.checked)}
          />
          <span>{t("includeCollar")}</span>
        </label>
      )}
      <div
        className="bundle-parts"
        style={{
          gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))`,
        }}
      >
        {parts.map((part) => (
          <BundlePart key={part.kind} {...part} />
        ))}
      </div>
      <div className="bundle-bottom">
        <div>
          <span className="bundle-original">{money(pricing.original)}</span>
          <strong>{money(pricing.total)}</strong>
          <span className="bundle-saving">
            {t("saveLabel")}
            {money(pricing.saving)}
          </span>
        </div>
        <button type="button" className="btn" onClick={() => addItem(action)}>
          {t("addSetToCart")}
        </button>
      </div>
    </section>
  );
}
function BundlePart({ kind, colourField, sizeField }: BundlePart) {
  const config = productOptions[kind];
  const { t, colour, size, setField } = useStorefront((state) => ({
    t: state.t,
    colour: state.fields[colourField],
    size: state.fields[sizeField],
    setField: state.setField,
  }));
  return (
    <div className="bundle-part">
      <div className="bundle-part-heading">
        <div className="bundle-photo">
          <Image src={productPhoto(kind, colour)} alt="" fill sizes="64px" />
        </div>
        <h5>
          <BrandText>{t(config.titleKey)}</BrandText>
        </h5>
      </div>
      <div className="bundle-fields">
        <label>
          {t("colourLabel")}
          <select
            value={colour}
            onChange={(event) => setField(colourField, event.target.value)}
          >
            {config.colours.map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(kind === "leash" ? "lengthLabel" : "sizeOnly")}
          <select
            value={size}
            onChange={(event) => setField(sizeField, event.target.value)}
          >
            {config.sizes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.detail ? ` · ${option.detail}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
