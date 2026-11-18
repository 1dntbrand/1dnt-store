"use client";
import { useStorefront } from "../storefront-context";
import { FaqSection } from "./faq-section";

export function BrandStory() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  return (
    <section>
      <div className="philosophy" id="philosophy">
        <div className="eyebrow">{t("storyEyebrow")}</div>
        <div>
          <blockquote>
            {t("storyHeadingFirst")}
            <br />
            {t("storyHeadingSecond")}
          </blockquote>
          <p>{t("storyIntro")}</p>
          <p>{t("philosophyHandmade")}</p>
          <details className="story-more">
            <summary>{t("readOurStory")}</summary>
            <p>{t("philosophyBond")}</p>
            <p>{t("philosophyReflection")}</p>
            <p>{t("philosophyFounded")}</p>
          </details>
        </div>
      </div>
      <FaqSection />
    </section>
  );
}
