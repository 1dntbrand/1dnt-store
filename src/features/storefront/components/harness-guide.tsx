"use client";
import { harnessMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { FitFinder } from "./fit-finder";
import { GuideDialog, GuideSection } from "./guide-dialog";
import { MeasureDrawing, MeasureLegend } from "./measure-drawing";

export function HarnessGuide() {
  const { t, guideSize } = useStorefront((state) => ({
    t: state.t,
    guideSize: state.guideSize,
  }));
  return (
    <GuideDialog id="harnessSizeGuide" title={t("harnessGuideTitle")}>
      <FitFinder kind="harness" />
      <GuideSection title={t("measureTitle")} className="guide-measure">
        <MeasureDrawing
          src="/assets/guides/measure-harness.webp"
          width={941}
          height={791}
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
                <th scope="col">{t("collarWidthMm")}</th>
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
                  <td>{item.widthMm}</td>
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
