"use client";

import { ExternalIcon } from "./icons";
import type { Collection, ProductKind } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";
import { ProductSafety } from "./product-safety";
import { fidlockVideo } from "../data/brand";

/** Description, features, hardware, care and safety, shared by both collections. */
export function ProductInformation({
  collection,
  kind,
}: {
  collection: Collection;
  kind: ProductKind;
}) {
  const t = useStorefront((state) => state.t);
  const elegant = collection === "elegant";
  const fidlock = !elegant && kind !== "leash";
  const woodenHandle = elegant && kind === "leash";
  const features = [
    "baseWebbing",
    "baseWaterproof",
    "baseOdourFeature",
    ...(elegant
      ? kind === "leash"
        ? []
        : ["baseAdjustable"]
      : [kind === "leash" ? "baseLeashAdjustable" : "baseAdjustable"]),
    ...(fidlock ? ["fidlockFeature"] : []),
    "baseVegan",
    "baseHandmade",
    "baseEasyCare",
  ];

  return (
    <div className="product-information">
      <details open>
        <summary>{t("baseDescriptionTitle")}</summary>
        <p>{t(elegant ? "elegantFullDescription" : "baseDescription")}</p>
      </details>
      <details>
        <summary>{t("baseFeaturesTitle")}</summary>
        <ul>
          {features.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>{t("hardwareTitle")}</summary>
        <p>{t(elegant ? "elegantHardwareColour" : "baseHardwareColour")}</p>
        <p>{t("hardwareMaterials")}</p>
        {woodenHandle && <p>{t("elegantHandleMaterial")}</p>}
        {fidlock && (
          <>
            <p>{t("baseHardwareFastening")}</p>
            <p>
              <a
                className="text-link"
                href={fidlockVideo.watch}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("hardwareHowWorks")}
                <ExternalIcon />
              </a>
            </p>
          </>
        )}
      </details>
      <details>
        <summary>{t("baseCareTitle")}</summary>
        <p>{t("baseCare")}</p>
        {woodenHandle && <p>{t("elegantWoodCare")}</p>}
      </details>
      <ProductSafety />
    </div>
  );
}
