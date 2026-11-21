"use client";
import { useState } from "react";
import { useStorefront } from "../storefront-context";
import { GuideDialog, GuideSection } from "./guide-dialog";

const sizes = ["1.5", "2.5"] as const;
type LeashSize = (typeof sizes)[number];

function LeashFigure({
  src,
  title,
  dimension,
  caption,
  index,
  tall = false,
}: {
  src: string;
  title?: string;
  dimension: string;
  caption: string;
  index?: string;
  tall?: boolean;
}) {
  return (
    <figure className="leash-card" data-tall={tall || undefined}>
      {title && (
        <h4>
          {index && <span className="leash-card-index">{index}</span>}
          {title}
        </h4>
      )}
      <div className="leash-card-art">
        {/* Static vector illustration; next/image adds nothing for SVG. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" decoding="async" />
      </div>
      <p className="leash-card-dimension">{dimension}</p>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function LeashGuide() {
  const { t, guideSize, language, applyGuideSize } = useStorefront((state) => ({
    t: state.t,
    guideSize: state.guideSize,
    language: state.language,
    applyGuideSize: state.applyGuideSize,
  }));
  const opened = (sizes as readonly string[]).includes(guideSize)
    ? (guideSize as LeashSize)
    : "1.5";
  const [shownFor, setShownFor] = useState<{ from: string; size: LeashSize }>({
    from: guideSize,
    size: opened,
  });
  // Reopening the guide from another selection starts on that selection.
  const shown = shownFor.from === guideSize ? shownFor.size : opened;
  const decimal = language === "en" ? "." : ",";
  const metres = (value: number) =>
    `${value.toFixed(2).replace(".", decimal)} ${t("mUnit")}`;
  const sizeLabel = (size: LeashSize) =>
    `${size.replace(".", decimal)} ${t("mUnit")}`;
  const title = (key: string) => t(key).replace(/^\d+\s·\s/, "");

  return (
    <GuideDialog id="leashSizeGuide" title={t("leashGuideTitle")}>
      <div
        className="leash-size-switch"
        role="group"
        aria-label={t("lengthLabel")}
      >
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={shown === size}
            onClick={() => setShownFor({ from: guideSize, size })}
          >
            <strong>{sizeLabel(size)}</strong>
            <span>{t(size === "1.5" ? "handHeldOnly" : "convertibleUse")}</span>
          </button>
        ))}
      </div>

      {shown === "1.5" ? (
        <GuideSection title={t("shortGuideNote")}>
          <LeashFigure
            src="/assets/guides/leash-standard.svg"
            dimension={metres(1.5)}
            caption={t("shortLeashGuideCaption")}
          />
        </GuideSection>
      ) : (
        <GuideSection title={t("leashModesHeading")}>
          <div className="leash-modes">
            <LeashFigure
              index="01"
              src="/assets/guides/leash-full.svg"
              title={title("leashFixedTitle")}
              dimension={metres(2.5)}
              caption={t("leashFixedCaption")}
            />
            <LeashFigure
              index="02"
              src="/assets/guides/leash-shortened.svg"
              title={title("leashLongTitle")}
              dimension={metres(2)}
              caption={t("leashLongCaption")}
            />
            <LeashFigure
              index="03"
              tall
              src="/assets/guides/leash-hands-free.svg"
              title={title("leashHandsFreeTitle")}
              dimension={`150 ${t("centimetreUnit")}`}
              caption={t("leashHandsFreeCaption")}
            />
          </div>
          <p className="guide-note leash-active-note">
            <span className="leash-active-ring" aria-hidden="true" />
            {t("leashActiveRing")}
          </p>
          <p className="guide-note">{t("leashHandsFreeNote")}</p>
        </GuideSection>
      )}

      <GuideSection title={t("sizeGuideLabel")}>
        <div className="size-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t("leashTotalLength")}</th>
                <th scope="col">{t("collarWidthMm")}</th>
                <th scope="col">{t("leashUse")}</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr
                  key={size}
                  data-guide-size={size}
                  aria-current={shown === size}
                >
                  <th scope="row">{sizeLabel(size)}</th>
                  <td>19</td>
                  <td>
                    {t(size === "1.5" ? "handHeldOnly" : "convertibleUse")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <div className="guide-actions">
        <button
          type="button"
          className="btn"
          onClick={() => applyGuideSize(shown)}
        >
          {t("chooseThisSize", { size: sizeLabel(shown) })}
        </button>
      </div>
    </GuideDialog>
  );
}
