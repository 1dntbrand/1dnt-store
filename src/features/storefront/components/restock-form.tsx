"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { variantKey, type ProductVariant } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";
import { CheckIcon } from "./icons";
import { SwapLabel } from "./swap-label";
import { colourSoldOut } from "../lib/product-options";

const restockEnabled = process.env.NEXT_PUBLIC_RESTOCK_ENABLED === "true";
type Status =
  | "idle"
  | "sending"
  | "saved"
  | "restockError"
  | "restockInvalidEmail"
  | "restockRateLimited"
  | "restockAvailable";

export function RestockForm({ variant }: { variant: ProductVariant }) {
  return <RestockRequest key={variantKey(variant)} variant={variant} />;
}

function RestockRequest({ variant }: { variant: ProductVariant }) {
  const { t, language, openService } = useStorefront((state) => ({
    t: state.t,
    language: state.language,
    openService: state.openService,
  }));
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const pending = useRef(false);
  const focusOnSave = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const sending = status === "sending";
  const saved = status === "saved";
  const invalidEmail = status === "restockInvalidEmail";
  const error = status === "idle" || sending || saved ? null : status;

  useEffect(() => {
    if (saved && focusOnSave.current) {
      successRef.current?.focus({ preventScroll: true });
    }
  }, [saved]);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || saved) return;

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    pending.current = true;
    setStatus("sending");

    try {
      const response = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...variant, email, language }),
      });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.ok === true) {
        focusOnSave.current = form.contains(document.activeElement);
        setStatus("saved");
      } else if (response.status === 429) {
        setStatus("restockRateLimited");
      } else if (response.status === 409) {
        setStatus("restockAvailable");
      } else if (response.status === 400 && result?.code === "invalid_input") {
        setStatus("restockInvalidEmail");
      } else {
        setStatus("restockError");
      }
    } catch {
      setStatus("restockError");
    } finally {
      pending.current = false;
    }
  }

  if (!restockEnabled) {
    return (
      <div className="restock-soon">
        <p>{t(colourSoldOut(variant) ? "restockSoon" : "restockSoonSize")}</p>
        <button
          className="text-button"
          type="button"
          onClick={() => openService("contact")}
        >
          {t("restockAsk")}
        </button>
      </div>
    );
  }

  return (
    <div className="restock-panel">
      <form
        className="restock-form"
        method="post"
        aria-labelledby={`${id}-heading`}
        aria-busy={sending}
        hidden={saved}
        onSubmit={subscribe}
      >
        <h4 id={`${id}-heading`} className="restock-intro">
          {t("restockIntro")}
        </h4>
        <label htmlFor={`${id}-email`}>{t("email")}</label>
        <div className="restock-controls">
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            maxLength={254}
            required
            readOnly={sending}
            aria-invalid={invalidEmail || undefined}
            aria-describedby={
              invalidEmail ? `${id}-error ${id}-note` : `${id}-note`
            }
            onChange={() => {
              if (invalidEmail) setStatus("idle");
            }}
          />
          <button
            className="btn"
            type="submit"
            aria-disabled={sending || undefined}
          >
            <SwapLabel
              options={[
                t("restockAction"),
                <>
                  <span className="spinner" aria-hidden="true" />
                  {t("restockSending")}
                </>,
              ]}
              shown={sending ? 1 : 0}
            />
          </button>
        </div>
        {error && (
          <p className="restock-error" id={`${id}-error`} role="alert">
            {t(error)}
          </p>
        )}
        <p className="field-hint" id={`${id}-note`}>
          {t("restockEmailUse")}
        </p>
      </form>
      <div
        ref={successRef}
        className={saved ? "restock-success" : "sr-only"}
        role="status"
        tabIndex={saved ? -1 : undefined}
      >
        {saved && (
          <>
            <CheckIcon className="icon state-in" />
            <p className="state-in">{t("restockSaved")}</p>
          </>
        )}
      </div>
    </div>
  );
}
