"use client";
import { BrandText } from "./brand-text";

import Image from "next/image";

import { useStorefront } from "../storefront-context";
import {
  collarPrices,
  leashPrices,
  harnessPrices,
} from "@/domain/commerce/catalog";
import { ProductDetail } from "./product-detail";
import { CollectionSwitch } from "./collection-switch";

const categoryImageSizes =
  "(max-width: 540px) 94vw, (max-width: 1480px) 31vw, 424px";

export function Catalog() {
  const { t, category, money } = useStorefront((state) => ({
    t: state.t,
    category: state.categories.base,
    money: state.money,
  }));
  return (
    <section className="section catalog-section" id="collection">
      <CollectionSwitch active="base" />
      <div className="catalog-heading">
        <h2 id="catalogTitle" tabIndex={-1}>
          <BrandText>{t("collectionTitle")}</BrandText>
        </h2>
        <p className="catalog-offer">{t("catalogSetOffer")}</p>
      </div>
      <nav className="catalog-filters" aria-label={t("catalogCategories")}>
        <a
          href="#collection/all"
          data-category="all"
          aria-current={category === "all" ? "page" : undefined}
        >
          {t("allCategories")}
        </a>
        <a
          href="#collection/collars"
          data-category="collars"
          aria-current={category === "collars" ? "page" : undefined}
        >
          {t("cat_collars")}
        </a>
        <a
          href="#collection/leashes"
          data-category="leashes"
          aria-current={category === "leashes" ? "page" : undefined}
        >
          {t("cat_leashes")}
        </a>
        <a
          href="#collection/harnesses"
          data-category="harnesses"
          aria-current={category === "harnesses" ? "page" : undefined}
        >
          {t("cat_harnesses")}
        </a>
      </nav>
      <div
        id="catalog-all"
        className="catalog-pane"
        hidden={category !== "all"}
      >
        <div className="catalog-overview">
          <a className="catalog-preview" href="#collection/collars">
            <Image
              src="/assets/collar-khaki.webp"
              alt=""
              loading="lazy"
              width={1312}
              height={1199}
              sizes={categoryImageSizes}
            />
            <div>
              <h3>{t("cat_collars")}</h3>
              <p className="catalog-start-price">
                {t("priceFrom")}{" "}
                {money(Math.min(...Object.values(collarPrices)))}
              </p>
            </div>
          </a>
          <a className="catalog-preview" href="#collection/leashes">
            <Image
              src="/assets/leash-black.webp"
              alt=""
              loading="lazy"
              width={1086}
              height={1448}
              sizes={categoryImageSizes}
            />
            <div>
              <h3>{t("cat_leashes")}</h3>
              <p className="catalog-start-price">
                {t("priceFrom")}{" "}
                {money(Math.min(...Object.values(leashPrices)))}
              </p>
            </div>
          </a>
          <a className="catalog-preview" href="#collection/harnesses">
            <Image
              src="/assets/harness-khaki.webp"
              alt=""
              loading="lazy"
              width={1312}
              height={1199}
              sizes={categoryImageSizes}
            />
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
