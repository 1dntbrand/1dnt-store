"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";

export const elegantLeashGuideId = "elegantLeashSizeGuide";

/** Fixed 1.5 m leash with a 14 cm wooden ring handle. */
export function ElegantLeashGuide() {
  const { t, closeDialog } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
  }));
  return (
    <Dialog
      id={elegantLeashGuideId}
      className="size-guide elegant-leash-guide"
      labelledBy="elegantLeashGuideTitle"
    >
      <div className="panel-top">
        <h2 id="elegantLeashGuideTitle">{t("leashGuideTitle")}</h2>
        <button
          type="button"
          className="size-guide-button size-guide-close"
          onClick={closeDialog}
        >
          {t("guideClose")}
        </button>
      </div>
      <figure className="elegant-leash-figure">
        <svg
          className="elegant-leash-diagram"
          viewBox="0 0 800 300"
          role="img"
          aria-label={t("elegantLeashLength")}
        >
          <g fill="none" stroke="#43291e" strokeWidth="9">
            <circle
              cx="115"
              cy="155"
              r="65"
              stroke="#8a613c"
              strokeWidth="17"
            />
            <path d="M180 155H675" />
            <path d="M680 155h30q30 0 30 25v15h-45v-20" stroke="#9c7b44" />
          </g>
          <g fill="none" stroke="#73756d" strokeWidth="1.5">
            <path d="M42 55H750M42 45v25M750 45v25M50 255H180M50 245v20M180 245v20" />
          </g>
          <g fill="#252622" fontSize="22" textAnchor="middle">
            <text x="396" y="40">
              150 cm
            </text>
            <text x="115" y="290">
              Ø 14 cm
            </text>
          </g>
        </svg>
        <figcaption>{t("elegantLeashLength")}</figcaption>
      </figure>
    </Dialog>
  );
}
