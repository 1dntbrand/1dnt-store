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
  width,
  height,
  tall = false,
}: {
  src: string;
  title?: string;
  dimension: string;
  caption: string;
  index?: string;
  width: number;
  height: number;
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
        <img src={src} alt="" width={width} height={height} decoding="async" />
      </div>
      <p className="leash-card-dimension">{dimension}</p>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function LeashGuide() {
  const { t, metres, centimetres, guideSize, applyGuideSize } = useStorefront(
    (state) => ({
      t: state.t,
      metres: state.metres,
      centimetres: state.centimetres,
      guideSize: state.guideSize,
      applyGuideSize: state.applyGuideSize,
    }),
  );
  const opened = (sizes as readonly string[]).includes(guideSize)
    ? (guideSize as LeashSize)
    : "1.5";
  const [shownFor, setShownFor] = useState<{ from: string; size: LeashSize }>({
    from: guideSize,
    size: opened,
  });
  // Reopening the guide from another selection starts on that selection.
  const shown = shownFor.from === guideSize ? shownFor.size : opened;

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
            <strong>{metres(size)}</strong>
            <span>{t(size === "1.5" ? "handHeldOnly" : "convertibleUse")}</span>
          </button>
        ))}
      </div>
      <p className="guide-note leash-width-note">{t("leashStrapWidth")}</p>

      {shown === "1.5" ? (
        <GuideSection title={t("shortGuideNote")}>
          <LeashFigure
            src="/assets/guides/leash-standard.svg"
            width={640}
            height={170}
            dimension={metres(1.5, 2)}
            caption={t("shortLeashGuideCaption")}
          />
        </GuideSection>
      ) : (
        <GuideSection title={t("leashModesHeading")}>
          <div className="leash-modes">
            <LeashFigure
              index="01"
              src="/assets/guides/leash-full-line.webp"
              width={1630}
              height={265}
              title={t("leashFixedTitle")}
              dimension={metres(2.5, 2)}
              caption={t("leashFixedCaption")}
            />
            <LeashFigure
              index="02"
              src="/assets/guides/leash-shortened-line.webp"
              width={1486}
              height={294}
              title={t("leashLongTitle")}
              dimension={metres(2, 2)}
              caption={t("leashLongCaption")}
            />
            <LeashFigure
              index="03"
              tall
              src="/assets/guides/leash-hands-free-walk.webp"
              width={919}
              height={1064}
              title={t("leashHandsFreeTitle")}
              dimension={centimetres("150")}
              caption={t("leashHandsFreeCaption")}
            />
          </div>
          <p className="guide-note">{t("leashHandsFreeNote")}</p>
        </GuideSection>
      )}

      <div className="guide-actions">
        <button
          type="button"
          className="btn"
          onClick={() => applyGuideSize(shown)}
        >
          {t("chooseThisSize", { size: metres(shown) })}
        </button>
      </div>
    </GuideDialog>
  );
}
