"use client";

import Image from "next/image";
import { blurProps } from "../lib/image-placeholder";
import { useStorefront } from "../storefront-context";
import { FaqSection } from "./faq-section";

export function BrandStory() {
  const t = useStorefront((state) => state.t);

  return (
    <>
      <section
        className="philosophy"
        id="philosophy"
        aria-labelledby="philosophy-title"
      >
        <div className="philosophy-heading" data-reveal>
          <p className="eyebrow">{t("storyEyebrow")}</p>
          <h2 id="philosophy-title" className="philosophy-title">
            <span>{t("storyHeadingFirst")}</span>
            <em>{t("storyHeadingSecond")}</em>
          </h2>
        </div>
        <figure className="philosophy-photo" data-reveal>
          <Image
            src="/assets/philosophy-together.webp"
            {...blurProps("/assets/philosophy-together.webp")}
            alt={t("storyPhotoAlt")}
            width={1152}
            height={2048}
            sizes="(max-width: 540px) 91vw, (max-width: 800px) 520px, (max-width: 1200px) 43vw, 520px"
            loading="lazy"
          />
        </figure>
        <div className="philosophy-copy" data-reveal>
          <p>{t("storyIntro")}</p>
          <p>{t("philosophyHandmade")}</p>
          <p>{t("philosophyBond")}</p>
          <p>{t("philosophyReflection")}</p>
          <p className="philosophy-founded">{t("philosophyFounded")}</p>
        </div>
      </section>
      <FaqSection />
    </>
  );
}
