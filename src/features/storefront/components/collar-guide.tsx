"use client";
import { collarMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { FitFinder } from "./fit-finder";
import { GuideDialog, GuideSection } from "./guide-dialog";
import { MeasureLegend, MeasurePhoto } from "./measure-photo";

export function CollarGuide() {
  const { t, guideSize } = useStorefront((state) => ({
    t: state.t,
    guideSize: state.guideSize,
  }));
  return (
    <GuideDialog id="collarSizeGuide" title={t("collarGuideTitle")}>
      <FitFinder kind="collar" />
      <GuideSection title={t("measureTitle")} className="guide-measure">
        <MeasurePhoto
          src="/assets/tyubik-hero.jpg"
          width={1152}
          height={2048}
          crop={{ x: 120, y: 470, w: 912, h: 900 }}
          loops={[{ cx: 465, cy: 930, rx: 168, ry: 52, rotate: 17 }]}
          badges={[{ label: "A", x: 860, y: 1070, from: [628, 980] }]}
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
                <th scope="col">{t("neckCm")}</th>
                <th scope="col">{t("collarWidthMm")}</th>
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
