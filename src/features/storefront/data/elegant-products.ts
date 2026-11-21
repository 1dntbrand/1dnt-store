import type { ProductKind, elegantColourIds } from "@/domain/commerce/catalog";

export const elegantColours = {
  "dark-brown": { label: "Dark Brown", swatch: "#43291e" },
  "coyote-brown": { label: "Coyote Brown", swatch: "#8a795d" },
} as const satisfies Record<ElegantColour, { label: string; swatch: string }>;

export type ElegantColour = (typeof elegantColourIds)[number];

export const elegantViews = [
  { id: "product", label: "galleryProduct" },
  { id: "lifestyle", label: "galleryWalk" },
] as const;

export type ElegantView = (typeof elegantViews)[number]["id"];

type ElegantProductConfig = {
  kind: ProductKind;
  category: string;
  categoryKey: string;
  titleKey: string;
  gallery: Record<ElegantColour, Record<ElegantView, string>>;
};

export const elegantProducts = [
  {
    kind: "collar",
    category: "collars",
    categoryKey: "cat_collars",
    titleKey: "elegantCollars",
    gallery: {
      "dark-brown": {
        product: "elegant-collar-brown.webp",
        lifestyle: "elegant-collar-lifestyle.webp",
      },
      "coyote-brown": {
        product: "elegant-collar-coyote-product.webp",
        lifestyle: "elegant-collar-coyote-lifestyle.webp",
      },
    },
  },
  {
    kind: "leash",
    category: "leashes",
    categoryKey: "cat_leashes",
    titleKey: "elegantLeash",
    gallery: {
      "dark-brown": {
        product: "elegant-leash-brown-product.webp",
        lifestyle: "elegant-leash-brown-lifestyle.webp",
      },
      "coyote-brown": {
        product: "elegant-leash-coyote-product.webp",
        lifestyle: "elegant-leash-coyote-lifestyle.webp",
      },
    },
  },
  {
    kind: "harness",
    category: "harnesses",
    categoryKey: "cat_harnesses",
    titleKey: "elegantHarnesses",
    gallery: {
      "dark-brown": {
        product: "elegant-harness-product.webp",
        lifestyle: "elegant-harness-lifestyle.webp",
      },
      "coyote-brown": {
        product: "elegant-harness-coyote-product.webp",
        lifestyle: "elegant-harness-coyote-lifestyle.webp",
      },
    },
  },
] as const satisfies readonly ElegantProductConfig[];

export type ElegantProduct = (typeof elegantProducts)[number];
