"use client";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useStorefront } from "../storefront-context";
import { captureReturnFocus, returnFocus } from "../lib/focus-return";
import { playDialogExit } from "../lib/exit-motion";

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
  // Only a press that both starts and ends on the backdrop closes the
  // dialog; selecting text inside and releasing outside must not.
  const pressedBackdrop = useRef(false);
  const { activeDialog, closeDialog } = useStorefront((state) => ({
    activeDialog: state.activeDialog,
    closeDialog: state.closeDialog,
  }));
  const isOpen = activeDialog === id;
  const exit = useRef<Animation | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = captureReturnFocus();
    const pageScroll = window.scrollY;
    const pageHash = window.location.hash;
    // Reopened while it was still fading out: keep it, drop the exit.
    exit.current?.cancel();
    exit.current = null;
    dialog.getAnimations().forEach((animation) => animation.cancel());
    if (!dialog.open) dialog.showModal();
    // Start on the dialog itself: no focus ring on the close button for
    // pointer users, and Tab still reaches every control in order.
    dialog.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      // The page under a dialog should not move, but iPhone can still pan
      // it (a field focused inside a sheet, the keyboard, rubber-banding).
      // Closing puts the shopper back exactly where they opened it; a link
      // in the dialog scrolls on its own afterwards.
      const panned =
        window.location.hash === pageHash &&
        Math.abs(window.scrollY - pageScroll) > 1;
      const finish = () => {
        if (exit.current !== running) return;
        exit.current = null;
        dialog.close();
        dialog.getAnimations().forEach((animation) => animation.cancel());
        // Only once the dialog is closed: scrolled back while it is still
        // modal, iPhone Safari keeps hit-testing the sticky header where it
        // sat while panned, and taps on it miss until the next scroll.
        if (panned) window.scrollTo({ top: pageScroll, behavior: "instant" });
        // Another dialog may have opened meanwhile; it keeps the focus.
        if (!document.querySelector("dialog[open]"))
          returnFocus(previousFocus, dialog);
      };
      // A short exit the way it came in, then the real close. A panned page
      // skips it: the sheet goes and the page returns in the same frame, so
      // nothing is seen jumping.
      const running = panned ? null : playDialogExit(dialog);
      exit.current = running;
      if (running) running.finished.then(finish, () => {});
      else finish();
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
      onPointerDown={(event) => {
        pressedBackdrop.current = isBackdrop(event);
      }}
      onClick={(event) => {
        const fromBackdrop = pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (fromBackdrop && isBackdrop(event)) closeDialog();
      }}
    >
      {children}
    </dialog>
  );
}

/** A pointer event on the ::backdrop targets the dialog, outside its box. */
function isBackdrop(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const rect = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}
