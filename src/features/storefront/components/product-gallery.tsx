"use client";
import Image from "next/image";
import { useStorefront } from "../storefront-context";
import { productPhoto, type ProductKind } from "../lib/catalog";
import { productOptions } from "../lib/product-options";

export function ProductGallery({ kind }: { kind: ProductKind }) {
  const config = productOptions[kind];
  const { colour, view, setView, t } = useStorefront((state) => ({
    colour: state.fields[config.colourField],
    view: state.views[kind],
    setView: state.setView,
    t: state.t,
  }));
  return (
    <div className="product-gallery">
      <div className="product-photo">
        <Image
          src={productPhoto(kind, colour, view)}
          alt={`${t(config.titleKey)} · ${t(colour)} · ${t(config.galleryLabels[view])}`}
          fill
          sizes="(max-width: 800px) calc(100vw - 40px), 48vw"
        />
      </div>
      <div
        className="gallery-thumbs"
        role="group"
        aria-label={t("productPhotos")}
      >
        {config.galleryLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className="gallery-thumb"
            aria-label={t(label)}
            aria-pressed={view === index}
            onClick={() => setView(kind, index)}
          >
            <Image
              src={productPhoto(kind, colour, index)}
              alt=""
              fill
              sizes="72px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
