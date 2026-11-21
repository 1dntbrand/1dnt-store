"use client";

import { CheckIcon } from "./icons";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { freeShippingRemaining } from "@/domain/commerce/shipping";
import { variantPhoto } from "../lib/catalog";
import { productTitleKey } from "../lib/product-options";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";

const VISIBLE_MS = 6000;

/** Confirms an add without taking the shopper away from the product. */
export function AddedToast() {
  const {
    t,
    money,
    choiceSummary,
    lastAdded,
    activeDialog,
    total,
    dismissAdded,
    openDialog,
  } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    choiceSummary: state.choiceSummary,
    lastAdded: state.lastAdded,
    activeDialog: state.activeDialog,
    total: state.pricing.total,
    dismissAdded: state.dismissAdded,
    openDialog: state.openDialog,
  }));
  const [paused, setPaused] = useState(false);
  const toast = useRef<HTMLDivElement>(null);
  const visible = lastAdded !== null && activeDialog === null;

  useEffect(() => {
    if (!visible || paused) return;
    const timer = window.setTimeout(dismissAdded, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [visible, paused, lastAdded, dismissAdded]);

  if (!visible) return <div className="added-toast-region" role="status" />;

  const [first] = lastAdded.variants;
  const remaining = freeShippingRemaining(total);
  const summary =
    lastAdded.variants.length === 1
      ? choiceSummary(first.colour, first.size)
      : t("setAddedLine", { count: String(lastAdded.variants.length) });

  return (
    <div className="added-toast-region" role="status">
      <div
        ref={toast}
        key={lastAdded.stamp}
        className="added-toast"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!toast.current?.contains(event.relatedTarget as Node | null))
            setPaused(false);
        }}
      >
        <span className="added-toast-photo">
          <Image src={variantPhoto(first)} alt="" fill sizes="56px" />
        </span>
        <div className="added-toast-body">
          <p className="added-toast-title">
            <CheckIcon />
            {t("cartAdded")}
          </p>
          <p className="added-toast-item">
            <strong>
              <BrandText>{t(productTitleKey(first))}</BrandText>
            </strong>
            <span>{summary}</span>
          </p>
          <p className="added-toast-shipping">
            {remaining === 0
              ? t("freeShippingReached")
              : t("freeShippingRemaining", { amount: money(remaining) })}
          </p>
        </div>
        <div className="added-toast-actions">
          <button
            type="button"
            className="btn"
            onClick={() => openDialog("cartPanel")}
          >
            {t("viewBag")}
          </button>
          <button
            type="button"
            className="icon-button added-toast-close"
            aria-label={t("guideClose")}
            onClick={dismissAdded}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
