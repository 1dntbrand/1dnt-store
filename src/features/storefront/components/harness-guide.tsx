"use client";
import { harnessMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { FitFinder } from "./fit-finder";
import { GuideDialog, GuideSection } from "./guide-dialog";
import { MeasureLegend, MeasurePhoto } from "./measure-photo";

export function HarnessGuide() {
  const { t, guideSize, language } = useStorefront((state) => ({
    t: state.t,
    guideSize: state.guideSize,
    language: state.language,
  }));
  return (
    <GuideDialog id="harnessSizeGuide" title={t("harnessGuideTitle")}>
      <FitFinder kind="harness" />
      <GuideSection title={t("measureTitle")} className="guide-measure">
        <MeasurePhoto
          src="/assets/harness-khaki-walk.webp"
          width={1312}
          height={1199}
          crop={{ x: 40, y: 300, w: 820, h: 850 }}
          loops={[
            { cx: 382, cy: 616, rx: 128, ry: 34, rotate: 132 },
            { cx: 546, cy: 678, rx: 124, ry: 30, rotate: 94 },
          ]}
          badges={[
            { label: "A", x: 170, y: 880, from: [300, 712] },
            { label: "B", x: 790, y: 780, from: [548, 800] },
          ]}
          alt={t("measureHarnessGraphic")}
        />
        <div className="guide-measure-text">
          <p>{t("measureHarness")}</p>
          <MeasureLegend
            items={[
              { label: "A", text: t("measureNeckLabel") },
              { label: "B", text: t("measureChestLabel") },
            ]}
          />
          <p className="guide-tip">{t("measureTip")}</p>
        </div>
      </GuideSection>
      <GuideSection title={t("sizeGuideLabel")}>
        <div className="size-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t("sizeOnly")}</th>
                <th scope="col">{t("neckCm")}</th>
                <th scope="col">{t("chestCm")}</th>
                <th scope="col">{t("harnessLowerCm")}</th>
                <th scope="col">{t("harnessUpperCm")}</th>
                <th scope="col">{t("widthCm")}</th>
              </tr>
            </thead>
            <tbody>
              {harnessMeasurements.map((item) => (
                <tr
                  key={item.size}
                  data-guide-size={item.size}
                  aria-current={guideSize === item.size}
                >
                  <th scope="row">{item.size}</th>
                  <td>{item.neck}</td>
                  <td>{item.chest}</td>
                  <td>{item.lower}</td>
                  <td>{item.upper}</td>
                  <td>{item.widthCm.toLocaleString(language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="guide-note">{t("harnessSTableNote")}</p>
      </GuideSection>
    </GuideDialog>
  );
}
