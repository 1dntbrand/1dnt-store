"use client";

import Image from "next/image";

import { useStorefront } from "../storefront-context";

export function Hero() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>
          <span>{t("heroDog")}</span>
          <br />
          <span>{t("heroStyle")}</span>
          <br />
          <em>{t("heroIdentity")}</em>
        </h1>
        <a className="btn" href="#collection">
          {t("viewCollection")}
        </a>
      </div>
      <div className="hero-art">
        <Image
          src="/assets/tyubik-hero.jpg"
          alt={t("heroPhotoAlt")}
          fetchPriority="high"
          width={1152}
          height={2048}
          sizes="(max-width: 540px) 100vw, 50vw"
          loading="eager"
        />
      </div>
    </section>
  );
}
