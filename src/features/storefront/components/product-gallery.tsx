"use client";
import { useStorefront } from "../storefront-context";
import type { ProductKind } from "@/domain/commerce/catalog";
import { productPhoto, productPhotoPosition } from "../lib/catalog";
import { productOptions } from "../lib/product-options";
import { MediaGallery } from "./media-gallery";

export function ProductGallery({ kind }: { kind: ProductKind }) {
  const config = productOptions[kind];
  const { colour, view, setView, t } = useStorefront((state) => ({
    colour: state.fields[config.colourField],
    view: state.views[kind],
    setView: state.setView,
    t: state.t,
  }));
  const title = t(config.titleKey);
  const photos = config.galleryLabels.map((label, index) => ({
    src: productPhoto(kind, colour, index),
    alt: `${title} · ${t(colour)} · ${t(label)}`,
    label: t(label),
    position: productPhotoPosition(kind, index),
  }));
  return (
    <MediaGallery
      className={`product-gallery ${kind}-gallery`}
      photos={photos}
      index={view}
      onIndexChange={(index) => setView(kind, index)}
      sizes="(max-width: 800px) calc(100vw - 40px), 48vw"
    />
  );
}
