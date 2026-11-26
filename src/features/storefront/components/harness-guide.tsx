"use client";
import { harnessMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { FitFinder } from "./fit-finder";
import { GuideDialog, GuideSection } from "./guide-dialog";
import { MeasureDrawing, MeasureLegend } from "./measure-drawing";

type HarnessSize = (typeof harnessMeasurements)[number];

const harnessRows: {
  label: string;
  value: (item: HarnessSize) => string | number;
}[] = [
  { label: "tableNeck", value: (item) => item.neck },
  { label: "tableChest", value: (item) => item.chest },
  { label: "tableLower", value: (item) => item.lower },
  { label: "tableUpper", value: (item) => item.upper },
  { label: "tableWidth", value: (item) => item.widthMm },
];

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
        <div className="size-table-wrap size-table-wide">
          <table>
            <thead>
              <tr>
                <th scope="col">{t("sizeOnly")}</th>
                <th scope="col">{t("tableNeck")}</th>
                <th scope="col">{t("tableChest")}</th>
                <th scope="col">{t("tableLower")}</th>
                <th scope="col">{t("tableUpper")}</th>
                <th scope="col">{t("tableWidth")}</th>
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
        {/* Phones: the same table turned on its side, one column per size,
            so all five measurements fit without scrolling sideways. */}
        <div className="size-table-wrap size-table-tall">
          <table>
            <thead>
              <tr>
                <th scope="col">{t("sizeOnly")}</th>
                {harnessMeasurements.map((item) => (
                  <th
                    key={item.size}
                    scope="col"
                    aria-current={guideSize === item.size}
                    data-current={guideSize === item.size || undefined}
                  >
                    {item.size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {harnessRows.map(({ label, value }) => (
                <tr key={label}>
                  <th scope="row">{t(label)}</th>
                  {harnessMeasurements.map((item) => (
                    <td
                      key={item.size}
                      data-current={guideSize === item.size || undefined}
                    >
                      {value(item)}
                    </td>
                  ))}
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
