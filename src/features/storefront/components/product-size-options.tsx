"use client";

import type { ProductKind } from "@/domain/commerce/catalog";
import type { VariantOption } from "../lib/product-options";
import { useStorefront } from "../storefront-context";

export function ProductSizeOptions({
  kind,
  options,
  selected,
  onSelect,
  onOpenGuide,
}: {
  kind: ProductKind;
  options: readonly VariantOption[];
  selected: string;
  onSelect: (value: string) => void;
  onOpenGuide: () => void;
}) {
  const { t, centimetres } = useStorefront((state) => ({
    t: state.t,
    centimetres: state.centimetres,
  }));
  const isLeash = kind === "leash";
  const label = t(isLeash ? "lengthLabel" : "sizeOnly");

  return (
    <fieldset className="variant-group">
      <legend className="sr-only">{label}</legend>
      <div className="variant-label-row">
        <span aria-hidden="true">{label}</span>
        <button
          className="text-button size-help"
          type="button"
          onClick={onOpenGuide}
        >
          {t(isLeash ? "sizeGuideLabel" : "fitGuideLabel")}
        </button>
      </div>
      <div
        className="size-options"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map(({ value, label, detail, soldOut }) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected === value}
            data-sold-out={soldOut || undefined}
            aria-label={soldOut ? `${label} · ${t("outOfStock")}` : undefined}
            onClick={() => onSelect(value)}
          >
            <span>{label}</span>
            <small>
              {soldOut
                ? t("outOfStock")
                : detail && centimetres(detail.replace(/ cm$/, ""))}
            </small>
          </button>
        ))}
      </div>
      {kind === "harness" && (
        <p className="field-hint">{t("harnessMeasureHint")}</p>
      )}
    </fieldset>
  );
}
