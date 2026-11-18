import {
  elegantProducts,
  elegantColours,
  type ElegantColour,
} from "../data/elegant-products";
import { collarMeasurements, harnessMeasurements } from "../data/measurements";
import type { FieldName } from "./storage";
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
}
interface ProductConfiguration {
  category: string;
  titleKey: string;
  introKey: string;
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
    introKey: "collarPracticalIntro",
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
    introKey: "leashPracticalIntro",
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
    introKey: "harnessPracticalIntro",
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
