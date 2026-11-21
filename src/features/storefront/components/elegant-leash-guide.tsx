"use client";
import { useStorefront } from "../storefront-context";
import { GuideDialog } from "./guide-dialog";

export const elegantLeashGuideId = "elegantLeashSizeGuide";

/** Fixed 1.5 m leash with a 14 cm wooden ring handle. */
export function ElegantLeashGuide() {
  const { t, language } = useStorefront((state) => ({
    t: state.t,
    language: state.language,
  }));
  const decimal = language === "en" ? "." : ",";
  return (
    <GuideDialog id={elegantLeashGuideId} title={t("leashGuideTitle")}>
      <figure className="leash-card">
        <div className="leash-card-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/guides/leash-elegant.svg"
            alt={t("elegantLeashLength")}
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="leash-card-dimension">
          {`1${decimal}50 ${t("mUnit")} · Ø 14 ${t("centimetreUnit")}`}
        </p>
        <figcaption>{t("elegantLeashLength")}</figcaption>
      </figure>
    </GuideDialog>
  );
}
