"use client";

import { YouTubeIcon } from "./icons";
import type { Collection, ProductKind } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";
import { ProductSafety } from "./product-safety";
import { Disclosure } from "./disclosure";
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
    "baseEasyCare",
  ];

  return (
    <div className="product-information">
      <>
        <Disclosure defaultOpen summary={t("baseDescriptionTitle")}>
          <p>{t(elegant ? "elegantFullDescription" : "baseDescription")}</p>
        </Disclosure>
        <Disclosure summary={t("baseFeaturesTitle")}>
          <ul>
            {features.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure summary={t("hardwareTitle")}>
          <p>{t(elegant ? "elegantHardwareColour" : "baseHardwareColour")}</p>
          <p>{t("hardwareMaterials")}</p>
          {woodenHandle && <p>{t("elegantHandleMaterial")}</p>}
          {fidlock && (
            <>
              <p>{t("baseHardwareFastening")}</p>
              <p>
                <a
                  className="text-link video-link"
                  href={fidlockVideo.watch}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YouTubeIcon />
                  <span>{t("hardwareHowWorks")}</span>
                </a>
              </p>
            </>
          )}
        </Disclosure>
        <Disclosure summary={t("baseCareTitle")}>
          <p>{t("baseCare")}</p>
          {woodenHandle && <p>{t("elegantWoodCare")}</p>}
        </Disclosure>
        <ProductSafety />
      </>
    </div>
  );
}
