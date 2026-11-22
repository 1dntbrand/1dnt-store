"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { freeShippingRemaining } from "@/domain/commerce/shipping";
import { variantPhoto } from "../lib/catalog";
import { productTitleKey } from "../lib/product-options";
import type { AddedNotice } from "../store";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { CloseButton } from "./close-button";
import { CheckIcon } from "./icons";
import { fadeAway } from "../lib/exit-motion";

const VISIBLE_MS = 6000;

/** Confirms an add without taking the shopper away from the product. */
export function AddedToast() {
  const { lastAdded, activeDialog } = useStorefront((state) => ({
    lastAdded: state.lastAdded,
    activeDialog: state.activeDialog,
  }));
  const visible = lastAdded !== null && activeDialog === null;

  return (
    <div className="added-toast-region" role="status">
      {visible && <ToastCard key={lastAdded.stamp} notice={lastAdded} />}
    </div>
  );
}

/**
 * One confirmation. Keyed by the add, so hover/focus pause state never
 * carries over to the next add.
 */
function ToastCard({ notice }: { notice: AddedNotice }) {
  const { t, money, choiceSummary, total, dismissAdded, openDialog } =
    useStorefront((state) => ({
      t: state.t,
      money: state.money,
      choiceSummary: state.choiceSummary,
      total: state.pricing.total,
      dismissAdded: state.dismissAdded,
      openDialog: state.openDialog,
    }));
  const [paused, setPaused] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  // Leaving fades the card out first, so it never just vanishes.
  const leave = useCallback(
    () => fadeAway(card.current, dismissAdded),
    [dismissAdded],
  );

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(leave, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [paused, leave]);

  const [first] = notice.variants;
  const remaining = freeShippingRemaining(total);
  const summary =
    notice.variants.length === 1
      ? choiceSummary(first.colour, first.size)
      : t("setAddedLine", { count: String(notice.variants.length) });

  return (
    <div
      ref={card}
      className="added-toast"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!card.current?.contains(event.relatedTarget as Node | null))
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
        <CloseButton label={t("guideClose")} onClick={leave} />
      </div>
    </div>
  );
}
