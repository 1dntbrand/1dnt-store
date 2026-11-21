"use client";

import type { ReactNode } from "react";
import { useStorefront } from "../storefront-context";
import { CloseButton } from "./close-button";
import { Dialog } from "./dialog";

/** Shared frame for size guides: sticky header, padded scrolling body. */
export function GuideDialog({
  id,
  title,
  className = "",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const { t, closeDialog } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
  }));
  const titleId = `${id}-title`;
  return (
    <Dialog
      id={id}
      className={`modal-sheet size-guide ${className}`}
      labelledBy={titleId}
    >
      <div className="panel-top">
        <h2 id={titleId}>{title}</h2>
        <CloseButton label={t("guideClose")} onClick={closeDialog} />
      </div>
      <div className="modal-body guide-body">{children}</div>
    </Dialog>
  );
}

/** A titled block inside a guide. */
export function GuideSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`guide-section ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
