"use client";

import { useId, useState, type FormEvent } from "react";
import { variantKey, type ProductVariant } from "@/domain/commerce/catalog";
import { useStorefront } from "../storefront-context";

const restockEnabled = process.env.NEXT_PUBLIC_RESTOCK_ENABLED === "true";
type Status = "idle" | "sending" | "saved" | "error";

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
  const sending = status === "sending";

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || status === "saved") return;
    const email = String(
      new FormData(event.currentTarget).get("email") ?? "",
    ).trim();
    setStatus("sending");
    try {
      const response = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...variant, email, language }),
      });
      if (!response.ok || (await response.json()).ok !== true) {
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (!restockEnabled)
    return (
      <div className="restock-form restock-soon">
        <p>{t("restockSoon")}</p>
        <button
          className="text-button"
          type="button"
          onClick={() => openService("contact")}
        >
          {t("restockAsk")}
        </button>
      </div>
    );

  return (
    <form
      className="restock-form"
      method="post"
      onSubmit={subscribe}
      aria-busy={sending}
    >
      <p className="restock-intro">{t("restockIntro")}</p>
      <label htmlFor={`${id}-email`}>{t("email")}</label>
      <div className="restock-controls">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          disabled={sending || status === "saved"}
          aria-describedby={`${id}-note`}
        />
        <button
          className="btn"
          type="submit"
          disabled={sending || status === "saved"}
        >
          {t(sending ? "restockSending" : "restockAction")}
        </button>
      </div>
      <p className="field-hint" id={`${id}-note`}>
        {t("restockEmailUse")}
      </p>
      <p className="restock-status" role="status">
        {status === "saved" ? t("restockSaved") : null}
      </p>
      {status === "error" && (
        <p className="restock-error" role="alert">
          {t("restockError")}
        </p>
      )}
    </form>
  );
}
