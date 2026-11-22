"use client";
import { BrandText } from "./brand-text";

import Image from "next/image";
import { blurProps } from "../lib/image-placeholder";

import { useStorefront } from "../storefront-context";
import {
  collarPrices,
  leashPrices,
  harnessPrices,
} from "@/domain/commerce/catalog";
import { ProductDetail } from "./product-detail";
import { CollectionSwitch } from "./collection-switch";
import { useTabIndicator } from "../lib/use-tab-indicator";
import { isPlainClick, showCategory } from "../lib/category-nav";
import type { Category } from "../lib/storage";

const categoryImageSizes =
  "(max-width: 540px) 94vw, (max-width: 1480px) 31vw, 424px";

const baseCategories = [
  ["all", "allCategories"],
  ["collars", "cat_collars"],
  ["leashes", "cat_leashes"],
  ["harnesses", "cat_harnesses"],
] as const satisfies readonly (readonly [Category, string])[];

export function Catalog() {
  const { t, current, money, setCategory } = useStorefront((state) => ({
    t: state.t,
    current: state.categories.base,
    money: state.money,
    setCategory: state.setCategory,
  }));
  const filters = useTabIndicator<HTMLElement>(
    '[aria-current="page"]',
    current,
  );
  return (
    <section className="section catalog-section" id="collection">
      <CollectionSwitch active="base" />
      <div className="catalog-heading">
        <h2>
          <BrandText>{t("collectionTitle")}</BrandText>
        </h2>
        <p className="catalog-offer">{t("catalogSetOffer")}</p>
      </div>
      <nav
        ref={filters}
        className="catalog-filters"
        aria-label={t("catalogCategories")}
      >
        {baseCategories.map(([category, label]) => (
          <a
            key={category}
            href={`#collection/${category}`}
            aria-current={current === category ? "page" : undefined}
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              showCategory(setCategory, "base", category);
            }}
          >
            {t(label)}
          </a>
        ))}
      </nav>
      <div id="catalog-all" className="catalog-pane" hidden={current !== "all"}>
        <div className="catalog-overview">
          <a
            className="catalog-preview"
            href="#collection/collars"
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              // The product opens where the overview was; nothing scrolls.
              showCategory(setCategory, "base", "collars");
            }}
          >
            <span className="catalog-preview-media">
              <Image
                src="/assets/collar-khaki.webp"
                {...blurProps("/assets/collar-khaki.webp")}
                alt=""
                loading="lazy"
                width={1312}
                height={1199}
                sizes={categoryImageSizes}
              />
            </span>
            <div>
              <h3>{t("cat_collars")}</h3>
              <p className="catalog-start-price">
                {t("priceFrom")}{" "}
                {money(Math.min(...Object.values(collarPrices)))}
              </p>
            </div>
          </a>
          <a
            className="catalog-preview"
            href="#collection/leashes"
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              // The product opens where the overview was; nothing scrolls.
              showCategory(setCategory, "base", "leashes");
            }}
          >
            <span className="catalog-preview-media">
              <Image
                src="/assets/leash-black.webp"
                {...blurProps("/assets/leash-black.webp")}
                alt=""
                loading="lazy"
                width={1086}
                height={1448}
                sizes={categoryImageSizes}
              />
            </span>
            <div>
              <h3>{t("cat_leashes")}</h3>
              <p className="catalog-start-price">
                {t("priceFrom")}{" "}
                {money(Math.min(...Object.values(leashPrices)))}
              </p>
            </div>
          </a>
          <a
            className="catalog-preview"
            href="#collection/harnesses"
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              // The product opens where the overview was; nothing scrolls.
              showCategory(setCategory, "base", "harnesses");
            }}
          >
            <span className="catalog-preview-media">
              <Image
                src="/assets/harness-khaki.webp"
                {...blurProps("/assets/harness-khaki.webp")}
                alt=""
                loading="lazy"
                width={1312}
                height={1199}
                sizes={categoryImageSizes}
              />
            </span>
            <div>
              <h3>{t("cat_harnesses")}</h3>
              <p className="catalog-start-price">
                {t("priceFrom")}{" "}
                {money(Math.min(...Object.values(harnessPrices)))}
              </p>
            </div>
          </a>
        </div>
      </div>
      <ProductDetail kind="collar" />
      <ProductDetail kind="leash" />
      <ProductDetail kind="harness" />
    </section>
  );
}
