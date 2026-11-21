"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useStorefront } from "../storefront-context";

export function Dialog({
  id,
  labelledBy,
  className,
  children,
}: {
  id: string;
  labelledBy: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { activeDialog, closeDialog } = useStorefront((state) => ({
    activeDialog: state.activeDialog,
    closeDialog: state.closeDialog,
  }));
  const isOpen = activeDialog === id;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    dialog.showModal();
    // Start on the dialog itself: no focus ring on the close button for
    // pointer users, and Tab still reaches every control in order.
    dialog.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      id={id}
      className={className}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          closeDialog();
      }}
    >
      {children}
    </dialog>
  );
}
