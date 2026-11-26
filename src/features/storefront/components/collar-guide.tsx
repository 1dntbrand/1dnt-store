"use client";
import { collarMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { FitFinder } from "./fit-finder";
import { GuideDialog, GuideSection } from "./guide-dialog";
import { MeasureDrawing, MeasureLegend } from "./measure-drawing";

export function CollarGuide() {
  const { t, guideSize } = useStorefront((state) => ({
    t: state.t,
    guideSize: state.guideSize,
  }));
  return (
    <GuideDialog id="collarSizeGuide" title={t("collarGuideTitle")}>
      <FitFinder kind="collar" />
      <GuideSection title={t("measureTitle")} className="guide-measure">
        <MeasureDrawing
          src="/assets/guides/measure-collar.webp"
          width={929}
          height={1117}
          alt={t("measureCollarGraphic")}
        />
        <div className="guide-measure-text">
          <p>{t("measureCollar")}</p>
          <MeasureLegend
            items={[{ label: "A", text: t("measureNeckLabel") }]}
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
                <th scope="col">{t("tableNeck")}</th>
                <th scope="col">{t("tableWidth")}</th>
              </tr>
            </thead>
            <tbody>
              {collarMeasurements.map((item) => (
                <tr
                  key={item.size}
                  data-guide-size={item.size}
                  aria-current={guideSize === item.size}
                >
                  <th scope="row">{item.size}</th>
                  <td>{item.neck}</td>
                  <td>{item.widthMm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>
    </GuideDialog>
  );
}
