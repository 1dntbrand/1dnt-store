"use client";

import Image from "next/image";

import { useStorefront } from "../storefront-context";

export function Elegant() {
  const {
    t,
    elegantTab,
    setElegantTab,
    elegantViews,
    setElegantView,
    elegantPhoto,
    navigateElegantTab,
  } = useStorefront((state) => ({
    t: state.t,
    elegantTab: state.elegantTab,
    setElegantTab: state.setElegantTab,
    elegantViews: state.elegantViews,
    setElegantView: state.setElegantView,
    elegantPhoto: state.elegantPhoto,
    navigateElegantTab: state.navigateElegantTab,
  }));
  return (
    <section className="section elegant-section" id="elegant">
      <div className="catalog-heading">
        <h2>{"Elegant"}</h2>
      </div>
      <div className="elegant-tabs" role="tablist" aria-label="Elegant">
        <button
          role="tab"
          id="elegantTabCollars"
          aria-controls="elegant-collars"
          aria-selected={elegantTab === "collars"}
          tabIndex={elegantTab === "collars" ? 0 : -1}
          data-elegant-tab="collars"
          onClick={() => setElegantTab("collars")}
          onKeyDown={(event) => navigateElegantTab(event, "collars")}
          type="button"
        >
          {t("cat_collars")}
        </button>
        <button
          role="tab"
          id="elegantTabLeashes"
          aria-controls="elegant-leashes"
          aria-selected={elegantTab === "leashes"}
          data-elegant-tab="leashes"
          onClick={() => setElegantTab("leashes")}
          tabIndex={elegantTab === "leashes" ? 0 : -1}
          onKeyDown={(event) => navigateElegantTab(event, "leashes")}
          type="button"
        >
          {t("cat_leashes")}
        </button>
        <button
          role="tab"
          id="elegantTabHarnesses"
          aria-controls="elegant-harnesses"
          aria-selected={elegantTab === "harnesses"}
          tabIndex={elegantTab === "harnesses" ? 0 : -1}
          data-elegant-tab="harnesses"
          onClick={() => setElegantTab("harnesses")}
          onKeyDown={(event) => navigateElegantTab(event, "harnesses")}
          type="button"
        >
          {t("cat_harnesses")}
        </button>
      </div>
      <div
        id="elegant-leashes"
        role="tabpanel"
        aria-labelledby="elegantTabLeashes"
        hidden={elegantTab !== "leashes"}
      >
        <div className="product elegant-product">
          <div>
            <div className="elegant-main">
              <Image
                id="elegantImage"
                src={elegantPhoto("leash")}
                alt="Elegant — black leash with wooden ring handle and antique brass hardware"
                width={1312}
                height={1199}
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div className="gallery-thumbs" aria-label="Elegant gallery">
              <button
                className="gallery-thumb"
                data-elegant-view="product"
                aria-pressed={elegantViews.leash === "product"}
                aria-label="Product photo"
                onClick={() => setElegantView("leash", "product")}
                type="button"
              >
                <Image
                  src="/assets/elegant-leash-brown-product.webp"
                  alt=""
                  width={1122}
                  height={1402}
                  sizes="96px"
                />
              </button>
              <button
                className="gallery-thumb"
                data-elegant-view="lifestyle"
                aria-pressed={elegantViews.leash === "lifestyle"}
                aria-label="On a walk"
                onClick={() => setElegantView("leash", "lifestyle")}
                type="button"
              >
                <Image
                  src="/assets/elegant-leash-brown-lifestyle.webp"
                  alt=""
                  width={1122}
                  height={1402}
                  sizes="96px"
                />
              </button>
            </div>
          </div>
          <div className="product-info">
            <div className="eyebrow">{t("elegantPreview")}</div>
            <h3>{t("elegantLeash")}</h3>
            <p>{t("elegantDescription")}</p>
            <div className="elegant-spec">
              <span>{t("colourLabel")}</span>
              <strong>{"Dark Brown / Golden Oak"}</strong>
            </div>
            <div className="elegant-spec">
              <span>{t("elegantHandle")}</span>
              <strong>{t("elegantWood")}</strong>
            </div>
            <div className="elegant-spec">
              <span>{t("elegantHardware")}</span>
              <strong>{"Antique Brass"}</strong>
            </div>
            <p className="note elegant-note">{t("elegantNote")}</p>
          </div>
        </div>
      </div>
      <div
        id="elegant-collars"
        role="tabpanel"
        aria-labelledby="elegantTabCollars"
        hidden={elegantTab !== "collars"}
      >
        <div className="product elegant-product">
          <div className="elegant-collar-gallery">
            <div className="elegant-main">
              <Image
                id="elegantCollarImage"
                src={elegantPhoto("collar")}
                alt="Elegant dark brown collar with antique brass buckle"
                width={1312}
                height={1199}
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div className="gallery-thumbs">
              <button
                className="gallery-thumb"
                data-elegant-collar-view="product"
                aria-pressed={elegantViews.collar === "product"}
                aria-label="Product photo"
                onClick={() => setElegantView("collar", "product")}
                type="button"
              >
                <Image
                  src="/assets/elegant-collar-brown.webp"
                  alt=""
                  width={1122}
                  height={1402}
                  sizes="96px"
                />
              </button>
              <button
                className="gallery-thumb"
                data-elegant-collar-view="lifestyle"
                aria-pressed={elegantViews.collar === "lifestyle"}
                aria-label="On a walk"
                onClick={() => setElegantView("collar", "lifestyle")}
                type="button"
              >
                <Image
                  src="/assets/elegant-collar-lifestyle.webp"
                  alt=""
                  width={1122}
                  height={1402}
                  sizes="96px"
                />
              </button>
            </div>
          </div>
          <div className="product-info">
            <div className="eyebrow">{t("elegantPreview")}</div>
            <h3>{t("elegantCollars")}</h3>
            <p>{t("elegantCollarDescription")}</p>
            <div className="elegant-spec">
              <span>{t("colourLabel")}</span>
              <strong>{"Dark Brown"}</strong>
            </div>
            <div className="elegant-spec">
              <span>{t("elegantHardware")}</span>
              <strong>{"Antique Brass"}</strong>
            </div>
            <p className="note elegant-note">{t("elegantNote")}</p>
          </div>
        </div>
      </div>
      <div
        id="elegant-harnesses"
        role="tabpanel"
        aria-labelledby="elegantTabHarnesses"
        hidden={elegantTab !== "harnesses"}
      >
        <div className="elegant-coming">
          <span className="eyebrow">{"ELEGANT / 03"}</span>
          <h3>{t("elegantHarnesses")}</h3>
          <p>{t("elegantComing")}</p>
        </div>
      </div>
    </section>
  );
}
