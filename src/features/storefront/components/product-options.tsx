"use client";

import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { CheckIcon } from "./icons";

/** Product name, price and the VAT/delivery note, shared by both collections. */
export function ProductHeading({
  title,
  price,
}: {
  title: string;
  price: string;
}) {
  const t = useStorefront((state) => state.t);
  return (
    <>
      <div className="product-heading">
        <h3>
          <BrandText>{title}</BrandText>
        </h3>
        <p className="product-price">{price}</p>
      </div>
      <p className="product-price-note">{t("vatShipping")}</p>
    </>
  );
}

export interface SwatchOption {
  value: string;
  label: string;
  /** Any CSS background: a colour or a two-tone gradient. */
  fill: string;
}

/** Colour choice as round swatches with the selected name beside the label. */
export function ColourSwatches({
  options,
  selected,
  onSelect,
}: {
  options: readonly SwatchOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const t = useStorefront((state) => state.t);
  const current = options.find((option) => option.value === selected);
  return (
    <fieldset className="variant-group">
      <legend>
        {t("colourLabel")} <span>{current?.label}</span>
      </legend>
      <div className="swatches">
        {options.map(({ value, label, fill }) => (
          <button
            key={value}
            className="swatch"
            type="button"
            aria-label={label}
            aria-pressed={selected === value}
            onClick={() => onSelect(value)}
          >
            <span style={{ background: fill }} />
            {selected === value && (
              <span className="swatch-check" aria-hidden="true">
                <CheckIcon />
              </span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
