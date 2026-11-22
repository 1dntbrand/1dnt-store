import {
  elegantProducts,
  elegantColours,
  type ElegantColour,
} from "../data/elegant-products";
import { collarMeasurements, harnessMeasurements } from "../data/measurements";
import type { FieldName } from "./storage";
import { variantLimit } from "@/domain/commerce/availability";
import {
  variantColours,
  variantPrices,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";

export interface VariantOption {
  value: string;
  label: string;
  detail?: string;
  /** Out of stock in the chosen colour. */
  soldOut?: boolean;
}
interface ProductConfiguration {
  category: string;
  titleKey: string;
  colourField: FieldName;
  sizeField: FieldName;
  colours: readonly string[];
  sizes: VariantOption[];
  galleryLabels: string[];
}
export const productOptions: Record<ProductKind, ProductConfiguration> = {
  collar: {
    category: "collars",
    titleKey: "productCollar",
    colourField: "collarColour",
    sizeField: "collarProductSize",
    colours: variantColours("base", "collar"),
    sizes: collarMeasurements.map((item) => ({
      value: item.size,
      label: item.size,
      detail: `${item.neck} cm`,
    })),
    galleryLabels: ["galleryProduct", "galleryLeft", "galleryRight"],
  },
  leash: {
    category: "leashes",
    titleKey: "productLeash",
    colourField: "leashColour",
    sizeField: "length",
    colours: variantColours("base", "leash"),
    sizes: [
      { value: "1.5", label: "1.5 m" },
      { value: "2.5", label: "2.5 m" },
    ],
    galleryLabels: ["galleryProduct", "galleryWalk"],
  },
  harness: {
    category: "harnesses",
    titleKey: "productHarness",
    colourField: "harnessColour",
    sizeField: "harnessSize",
    colours: variantColours("base", "harness"),
    sizes: harnessMeasurements.map((item) => ({
      value: item.size,
      label: item.size,
      detail: `${item.neck} / ${item.chest} cm`,
    })),
    galleryLabels: ["galleryProduct", "galleryWalk"],
  },
};
export const swatchColours: Record<string, string> = {
  black: "#252622",
  khaki: "#6d7357",
  orange: "#dc6b2f",
  "khaki-orange": "linear-gradient(135deg,#6d7357 50%,#dc6b2f 50%)",
  "black-orange": "linear-gradient(135deg,#252622 50%,#dc6b2f 50%)",
};

export function productTitleKey({ collection, kind }: ProductVariant) {
  return collection === "base"
    ? productOptions[kind].titleKey
    : elegantProducts.find((product) => product.kind === kind)!.titleKey;
}

export function variantColourLabel(colour: string, t: (key: string) => string) {
  return elegantColours[colour as ElegantColour]?.label ?? t(colour);
}

export function variantSizeOptions({
  collection,
  kind,
}: Pick<ProductVariant, "collection" | "kind">) {
  const sizes = productOptions[kind].sizes;
  if (collection === "base") return sizes;
  return sizes.filter(({ value }) =>
    Object.hasOwn(variantPrices(collection, kind), value),
  );
}

export function productBundleId({
  collection,
  kind,
}: Pick<ProductVariant, "collection" | "kind">) {
  return `bundle-${collection}-${kind}`;
}

/** Marks the sizes that are out of stock in the variant's colour. */
export function withStock(
  options: readonly VariantOption[],
  variant: ProductVariant,
): VariantOption[] {
  return options.map((option) => ({
    ...option,
    soldOut: variantLimit({ ...variant, size: option.value }) === 0,
  }));
}

/** A colour is sold out when none of its sizes can be ordered. */
export function colourSoldOut(variant: ProductVariant) {
  return variantSizeOptions(variant).every(
    ({ value }) => variantLimit({ ...variant, size: value }) === 0,
  );
}
